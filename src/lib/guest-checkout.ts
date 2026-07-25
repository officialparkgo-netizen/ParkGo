import "server-only";
import { cookies } from "next/headers";
import type { User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { SESSION_COOKIE } from "@/lib/auth";
import { findUserByEmail } from "@/lib/data/users";

/**
 * Booking without signing up first.
 *
 * Requiring an account before anyone can pay is the single biggest thing
 * standing between a visitor and a booking. So we take the details we need
 * anyway — name, email, phone — and quietly make the account behind the
 * scenes. The traveller experiences a guest checkout; they still end up with
 * somewhere to find their QR, message the host and manage the stay.
 *
 * The one thing this must never do is hand someone an existing account. If the
 * email is already registered we stop and send them to sign in — otherwise
 * anyone who knows an address could check out as its owner.
 */
export type GuestResult =
  | { ok: true; user: User }
  | { ok: false; reason: "exists" | "invalid" | "failed" };

function cleanPhone(raw: string): string | undefined {
  const digits = raw.replace(/[^\d+ ]/g, "").trim();
  return digits.length >= 7 ? digits.slice(0, 24) : undefined;
}

export async function createGuestAccount(input: {
  name: string;
  email: string;
  phone?: string;
}): Promise<GuestResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().slice(0, 120);
  if (!email.includes("@") || email.length < 5 || name.length < 2) {
    return { ok: false, reason: "invalid" };
  }

  // Never adopt an address that already belongs to someone.
  const existing = await findUserByEmail(email).catch(() => null);
  if (existing) return { ok: false, reason: "exists" };

  const phone = cleanPhone(input.phone ?? "");

  if (!IS_LIVE) {
    const { addMockUser } = await import("@/lib/data/store");
    const { createHash } = await import("crypto");
    const id = `user_guest_${createHash("sha256").update(email).digest("hex").slice(0, 10)}`;
    const user: User = {
      id,
      role: "traveller",
      name,
      email,
      ...(phone ? { phone } : {}),
      locale: "en",
      // They booked; there is nothing left to onboard.
      onboarded: true,
      guestCreated: true,
      createdAt: new Date().toISOString(),
    };
    addMockUser(user);
    await signInAs(id);
    return { ok: true, user };
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();

    // No password: they sign in later with a magic link from /login.
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name, ...(phone ? { phone } : {}) },
    });
    if (error || !created.user) return { ok: false, reason: "failed" };
    const id = created.user.id;

    await admin.from("users").upsert({
      id,
      role: "traveller",
      name,
      email,
      phone: phone ?? null,
      locale: "en",
      onboarded: true,
      guest_created: true,
    });

    // Establish the session now, so checkout carries straight on. A magic link
    // is minted and immediately redeemed server-side — the same flow the login
    // page uses, just without making them go via their inbox mid-payment.
    const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link?.properties?.hashed_token;
    if (tokenHash) {
      const { createServerSupabase } = await import("@/lib/supabase/auth-server");
      const supabase = await createServerSupabase();
      await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
    }

    const { getUserProfile } = await import("@/lib/data/users");
    const profile = await getUserProfile(id);
    return profile
      ? { ok: true, user: profile }
      : {
          ok: true,
          user: {
            id,
            role: "traveller",
            name,
            email,
            locale: "en",
            createdAt: new Date().toISOString(),
          },
        };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/** Mock-mode session: the cookie simply names the user. */
async function signInAs(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/**
 * Let a guest know the account exists and how to get back into it. Best-effort
 * — the booking confirmation is the email that matters, and this must never
 * fail a payment.
 */
export async function sendGuestWelcome(user: User) {
  try {
    const { isEmailConfigured, sendEmail, emailShell } = await import("@/lib/email");
    if (!isEmailConfigured()) return;
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.parkgo.ai";
    await sendEmail(
      user.email,
      "Your ParkGo account is ready",
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">Welcome to ParkGo</h2>
         <p style="margin:0">We've set up an account for <strong>${user.email
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")}</strong> so you can find your entry pass, message your host and manage the booking.</p>
         <p style="margin:16px 0 0"><a href="${base}/login" style="background:#F26A1B;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">Sign in</a></p>
         <p style="margin:14px 0 0;font-size:12px;color:#878F96">No password needed — sign in with your email address.</p>`
      )
    ).catch(() => {});
  } catch {
    // best-effort
  }
}
