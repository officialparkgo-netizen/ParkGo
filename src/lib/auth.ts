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
import { getUserProfile } from "@/lib/data/users";

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
    return getUserProfile(user.id);
  }

  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getUser(id) ?? null;
}

/** Guard: require a signed-in user, else redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Guard: require a specific role, else redirect (login or that role's home). */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${rolePath(role)}`);
  if (user.role !== role) redirect(rolePath(user.role));
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
