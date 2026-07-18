"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/types";
import { DEMO_LOGINS, SESSION_COOKIE, rolePath, roleHomeFor, resolveNext } from "@/lib/auth";
import { IS_LIVE } from "@/lib/config";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Log in as the demo account for a role (mock mode). */
export async function loginAs(role: Role, next?: string) {
  const demo = DEMO_LOGINS.find((d) => d.role === role);
  if (!demo) return;
  const store = await cookies();
  store.set(SESSION_COOKIE, demo.userId, COOKIE_OPTS);
  redirect(resolveNext(next, rolePath(role)));
}

export async function logout() {
  const store = await cookies();
  if (IS_LIVE) {
    try {
      const { createServerSupabase } = await import("@/lib/supabase/auth-server");
      const supabase = await createServerSupabase();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore — we still clear the cookies below
    }
    // Belt-and-braces: remove any Supabase auth cookies that remain so the
    // session is definitely gone even if signOut couldn't write cookies.
    for (const c of store.getAll()) {
      if (c.name.startsWith("sb-") && c.name.includes("auth-token")) {
        store.delete(c.name);
      }
    }
  }
  store.delete(SESSION_COOKIE);
  redirect("/");
}

// -----------------------------------------------------------------------------
// Real Supabase Auth (live mode) — email/password + magic link.
// -----------------------------------------------------------------------------

export interface AuthState {
  error?: string;
  message?: string;
}

function normaliseRole(raw: string): Role {
  return (["traveller", "host"].includes(raw) ? raw : "traveller") as Role;
}

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "") || undefined;

  if (!email || !password) return { error: "Enter your email and password." };

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return { error: error?.message || "Invalid email or password." };
  }

  // Land each role on its own portal — admins go straight to /admin.
  redirect(resolveNext(next, await roleHomeFor(data.user)));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const role = normaliseRole(String(formData.get("role") || "traveller"));
  const next = String(formData.get("next") || "") || rolePath(role);

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!email.includes("@")) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message || "Could not create your account." };

  // Supabase returns an obfuscated user with no identities when the email is
  // already registered (email-enumeration protection).
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "That email already has an account — try signing in instead." };
  }

  // If email confirmation is disabled, a session is returned immediately.
  if (data.session) redirect(next);
  return { message: "Check your email to confirm your account, then sign in." };
}

/** Forgot password: email a reset link (lands on /account via /auth/confirm). */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  if (!email.includes("@")) return { error: "Please enter a valid email address." };

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm?next=${encodeURIComponent("/account?reset=1")}`,
  });
  if (error) return { error: error.message || "Could not send the reset link." };
  return { message: "Password reset link sent — check your email." };
}

/** Signed-in user: set a new password (Account page). */
export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  if (!IS_LIVE) {
    return { error: "Password change isn't available for demo accounts." };
  }

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message || "Could not update your password." };
  return { message: "Password updated ✔" };
}

export async function signInWithMagicLink(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  // No baked-in default: with no explicit target the callback sends each
  // role to its own portal (admins land on /admin).
  const next = String(formData.get("next") || "");

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  if (!email.includes("@")) return { error: "Please enter a valid email address." };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });
  if (error) return { error: error.message || "Could not send the magic link." };
  return { message: "Magic link sent — check your email to sign in." };
}
