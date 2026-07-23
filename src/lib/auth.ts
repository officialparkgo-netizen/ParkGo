/**
 * Auth (mock mode).
 *
 * A signed-cookie session keyed by user id, with one demo login per role. In
 * live mode this is replaced by Supabase Auth (the cookie + getCurrentUser()
 * contract stays the same, so guards and UI don't change).
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@/types";
import { getUser } from "@/lib/data/store";
import { IS_LIVE } from "@/lib/config";
import { ensureUserProfile } from "@/lib/data/users";

export const SESSION_COOKIE = "parkgo_session";

/** Demo accounts surfaced on the login screen (mock mode). */
export const DEMO_LOGINS: { role: Role; userId: string; label: string; blurb: string }[] = [
  { role: "traveller", userId: "user_traveller", label: "Traveller", blurb: "Search, book, track & review" },
  { role: "host", userId: "user_host", label: "Host / Landlord", blurb: "List spaces, see earnings" },
  { role: "admin", userId: "user_admin", label: "Admin / Compliance", blurb: "Verify, monitor, payouts" },
];

export async function getCurrentUser(): Promise<User | null> {
  if (IS_LIVE) {
    const { createServerSupabase } = await import("@/lib/supabase/auth-server");
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return ensureUserProfile(user);
  }

  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getUser(id) ?? null;
}

/** Admin/host accounts with 2FA on need a valid second-factor session. */
async function assertTwofa(user: User, next: string): Promise<void> {
  if (user.role !== "admin" && user.role !== "host") return;
  const { twofaRequiredFor, hasAdmin2faSession } = await import("@/lib/admin-2fa");
  if (twofaRequiredFor(user) && !(await hasAdmin2faSession(user.id))) {
    redirect(`/verify-2fa?next=${encodeURIComponent(next)}`);
  }
}

/** New non-admin accounts set up their profile first (strict false only). */
function assertOnboarded(user: User): void {
  if (user.role !== "admin" && user.onboarded === false) redirect("/welcome");
}

/** Guard: require a signed-in user, else redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.suspended && user.role !== "admin") redirect("/login?suspended=1");
  assertOnboarded(user);
  await assertTwofa(user, rolePath(user.role));
  return user;
}

/**
 * Guard: require a specific role, else redirect (login or that role's home).
 * Admins pass every guard so they can open the traveller and host portals too.
 */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${rolePath(role)}`);
  if (user.suspended && user.role !== "admin") redirect("/login?suspended=1");
  assertOnboarded(user);
  await assertTwofa(user, rolePath(role));
  if (user.role !== role && user.role !== "admin") redirect(rolePath(user.role));
  return user;
}

export function rolePath(role: Role): string {
  switch (role) {
    case "traveller":
      return "/app";
    case "host":
      return "/host";
    case "admin":
      return "/admin";
  }
}

/**
 * Where to land after signing in: honor an explicit deep link, but collapse
 * bare portal roots to the user's own portal — an admin who arrived via a
 * generic "Get started" (/login?next=/app) link belongs on /admin, and no
 * guard bounces admins because they may open every portal.
 */
export function resolveNext(next: string | null | undefined, roleHome: string): string {
  if (!next || next === "/app" || next === "/host" || next === "/admin") return roleHome;
  return next;
}

/**
 * Live mode: the portal a just-signed-in Supabase user should land on.
 * The profile row is the source of truth (that's where admins are promoted);
 * sign-up metadata is only a fallback while the row doesn't exist yet.
 */
export async function roleHomeFor(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): Promise<string> {
  const metaRole = String(authUser.user_metadata?.role ?? "");
  let role: Role =
    metaRole === "host" || metaRole === "admin" ? (metaRole as Role) : "traveller";
  try {
    const profile = await ensureUserProfile(authUser);
    if (profile) role = profile.role;
  } catch {
    // keep the metadata fallback
  }
  return rolePath(role);
}
