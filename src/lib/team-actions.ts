"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IS_LIVE } from "@/lib/config";
import { SESSION_COOKIE, rolePath } from "@/lib/auth";
import {
  findUserByEmail,
  getUserProfile,
  setInviteNonce,
  setStaffPassword,
  verifyMockPassword,
} from "@/lib/data/users";
import { passwordProblem, verifyInviteToken } from "@/lib/team-invite";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export interface TeamAuthState {
  error?: string;
}

/** Where a staff account belongs after signing in. */
function staffHome(scope: string | undefined): string {
  return scope === "support" ? "/admin/support" : rolePath("admin");
}

/**
 * Accept a staff invite: verify the single-use link, set the password, sign
 * the teammate in and drop them on their desk. The nonce is cleared first, so
 * a replayed link fails even if the sign-in step later errors.
 */
export async function setTeamPasswordAction(
  _prev: TeamAuthState,
  formData: FormData
): Promise<TeamAuthState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  const problem = passwordProblem(password, confirm);
  if (problem === "short") return { error: "short" };
  if (problem === "mismatch") return { error: "mismatch" };

  const { peekInviteUserId } = await import("@/lib/team-invite");
  const claimedId = peekInviteUserId(token);
  const target = claimedId ? await getUserProfile(claimedId) : null;
  const check = verifyInviteToken(token, target?.inviteNonce);
  if (!target || !check.ok || target.role !== "admin" || target.suspended) {
    return { error: "link" };
  }

  await setInviteNonce(target.id, null); // burn the link before anything else
  const saved = await setStaffPassword(target.id, password);
  if (!saved) return { error: "save" };

  if (IS_LIVE) {
    const { createServerSupabase } = await import("@/lib/supabase/auth-server");
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: target.email,
      password,
    });
    // Password is set either way — send them to sign in manually if the
    // session couldn't be established here.
    if (error) redirect("/team/login?set=1");
  } else {
    (await cookies()).set(SESSION_COOKIE, target.id, COOKIE_OPTS);
  }
  redirect(staffHome(target.adminScope));
}

/** Staff sign-in with email + password (admins and support agents). */
export async function teamSignInAction(
  _prev: TeamAuthState,
  formData: FormData
): Promise<TeamAuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email.includes("@") || !password) return { error: "credentials" };

  const profile = await findUserByEmail(email);
  // Same message for "no such account", "not staff" and "wrong password" —
  // the sign-in page must not confirm who works here.
  const generic: TeamAuthState = { error: "credentials" };

  if (IS_LIVE) {
    const { createServerSupabase } = await import("@/lib/supabase/auth-server");
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) return generic;
    const signedIn = await getUserProfile(data.user.id);
    if (!signedIn || signedIn.role !== "admin" || signedIn.suspended) {
      await supabase.auth.signOut({ scope: "local" });
      return generic;
    }
    redirect(staffHome(signedIn.adminScope));
  }

  if (!profile || profile.role !== "admin" || profile.suspended) return generic;
  if (!(await verifyMockPassword(profile.id, password))) return generic;
  (await cookies()).set(SESSION_COOKIE, profile.id, COOKIE_OPTS);
  redirect(staffHome(profile.adminScope));
}
