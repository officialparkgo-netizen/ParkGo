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
  let real: User | null = null;
  if (IS_LIVE) {
    const { createServerSupabase } = await import("@/lib/supabase/auth-server");
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    real = await ensureUserProfile(user);
  } else {
    const store = await cookies();
    const id = store.get(SESSION_COOKIE)?.value;
    if (!id) return null;
    real = getUser(id) ?? null;
  }
  if (!real) return null;

  // Support impersonation: an admin with a valid cookie sees the app as the
  // target user. The cookie is inert for non-admin sessions.
  if (real.role === "admin") {
    const impersonated = await resolveImpersonation(real);
    if (impersonated) return impersonated;
  }
  return real;
}

async function resolveImpersonation(admin: User): Promise<User | null> {
  try {
    const { IMPERSONATE_COOKIE, parseImpersonationToken } = await import(
      "@/lib/impersonation"
    );
    const store = await cookies();
    const targetId = parseImpersonationToken(store.get(IMPERSONATE_COOKIE)?.value);
    if (!targetId || targetId === admin.id) return null;
    const { getUsersByIds } = await import("@/lib/data/users");
    const target = (await getUsersByIds([targetId])).get(targetId);
    if (!target || target.role === "admin") return null;
    return { ...target, impersonatedBy: admin.id };
  } catch {
    return null;
  }
}

/** Admin/host accounts with 2FA on need a valid second-factor session. */
async function assertTwofa(user: User, next: string): Promise<void> {
  if (user.impersonatedBy) return; // the real admin already passed their own gates
  if (user.role !== "admin" && user.role !== "host") return;
  const { twofaRequiredFor, hasAdmin2faSession } = await import("@/lib/admin-2fa");
  if (twofaRequiredFor(user) && !(await hasAdmin2faSession(user.id))) {
    redirect(`/verify-2fa?next=${encodeURIComponent(next)}`);
  }
}

/** New non-admin accounts set up their profile first (strict false only). */
function assertOnboarded(user: User): void {
  if (user.impersonatedBy) return;
  if (user.role !== "admin" && user.onboarded === false) redirect("/welcome");
}

/** Guard: require a signed-in user, else redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.suspended && user.role !== "admin" && !user.impersonatedBy)
    redirect("/login?suspended=1");
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
  if (user.suspended && user.role !== "admin" && !user.impersonatedBy)
    redirect("/login?suspended=1");
  assertOnboarded(user);
  await assertTwofa(user, rolePath(role));
  if (user.role !== role && user.role !== "admin") redirect(rolePath(user.role));
  return user;
}

/**
 * Guard for the money pages (payments, promos, broadcast, settings, finance
 * exports): limited scopes are bounced back to their own console.
 */
export async function requireFinanceAdmin(): Promise<User> {
  const user = await requireRole("admin");
  if (user.adminScope === "support") redirect("/admin/support");
  if (user.adminScope === "content") redirect("/admin/blog");
  return user;
}

/**
 * Guard for the ops side of the admin console — everything except the blog.
 * An invited writer ("content" scope) exists to publish articles and nothing
 * else: bookings, users and payments are none of a freelancer's business, so
 * every ops page sends them straight back to the one console they own.
 */
export async function requireOpsAdmin(): Promise<User> {
  const user = await requireRole("admin");
  if (user.adminScope === "content") redirect("/admin/blog");
  return user;
}

/**
 * Guard for /admin/blog and the blog actions: full admins and invited writers.
 * Support agents stay on the ticket desk — publishing to the public site was
 * never part of their lockdown's allowed list.
 */
export async function requireContentAdmin(): Promise<User> {
  const user = await requireRole("admin");
  if (user.adminScope === "support") redirect("/admin/support");
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
