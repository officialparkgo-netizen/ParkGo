import type { User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getAllUsers as getAllUsersMock,
  getUser as getUserMock,
  setUserRole as mockSetUserRole,
  setUserSuspended as mockSetUserSuspended,
} from "@/lib/data/store";

type UserRow = {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string | null;
  locale: string;
  vehicle: unknown;
  corporate_account_id: string | null;
  suspended?: boolean | null;
  created_at: string;
};

export function userFromRow(r: UserRow): User {
  return {
    id: r.id,
    role: r.role as User["role"],
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    locale: r.locale as User["locale"],
    vehicle: (r.vehicle as User["vehicle"]) ?? undefined,
    corporateAccountId: r.corporate_account_id ?? undefined,
    suspended: !!r.suspended,
    createdAt: r.created_at,
  };
}

// "*" instead of an explicit column list so reads keep working while the
// `suspended` column migration (0013) hasn't been run yet.
const PROFILE_COLS = "*";

/** Profile row for a user id. Supabase in live mode, in-memory seed in mock. */
export async function getUserProfile(id: string): Promise<User | null> {
  if (!IS_LIVE) return getUserMock(id) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .select(PROFILE_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Batch profile lookup (e.g. traveller names on the host dashboard). */
export async function getUsersByIds(ids: string[]): Promise<Map<string, User>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, User>();
  if (unique.length === 0) return map;

  if (!IS_LIVE) {
    unique.forEach((id) => {
      const u = getUserMock(id);
      if (u) map.set(id, u);
    });
    return map;
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("users").select(PROFILE_COLS).in("id", unique);
  (data ?? []).forEach((r) => map.set(r.id, userFromRow(r as UserRow)));
  return map;
}

/** All registered users, newest first (admin overview). */
export async function listAllUsers(): Promise<User[]> {
  if (!IS_LIVE) return getAllUsersMock();

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("users")
    .select(PROFILE_COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map((r) => userFromRow(r as UserRow));
}

/** Admin: switch a member between traveller and host. Never touches admins. */
export async function setUserRoleAdmin(
  userId: string,
  role: "traveller" | "host"
): Promise<User | null> {
  if (!IS_LIVE) return mockSetUserRole(userId, role) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .update({ role })
    .eq("id", userId)
    .neq("role", "admin")
    .select(PROFILE_COLS)
    .single();
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Admin: suspend or restore an account (enforced at the sign-in guard). */
export async function setUserSuspendedAdmin(
  userId: string,
  suspended: boolean
): Promise<User | null> {
  if (!IS_LIVE) return mockSetUserSuspended(userId, suspended) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .update({ suspended })
    .eq("id", userId)
    .neq("role", "admin")
    .select(PROFILE_COLS)
    .single();
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Resolve the profile for a signed-in Supabase auth user, creating it from the
 * sign-up metadata if it's missing. Self-heals accounts whose profile row was
 * never created (e.g. signed up before the trigger existed, or a trigger
 * failure), so a valid session always resolves to a dashboard instead of
 * bouncing back to /login.
 */
export async function ensureUserProfile(authUser: AuthUserLike): Promise<User | null> {
  const existing = await getUserProfile(authUser.id);
  if (existing || !IS_LIVE) return existing;

  const meta = authUser.user_metadata ?? {};
  const role = (["traveller", "host", "admin"].includes(String(meta.role))
    ? String(meta.role)
    : "traveller") as User["role"];
  const name = String(
    meta.name || (authUser.email ? authUser.email.split("@")[0] : "") || "ParkGo user"
  );

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .upsert({ id: authUser.id, email: authUser.email ?? "", name, role }, { onConflict: "id" })
    .select(PROFILE_COLS)
    .single();

  if (error || !data) return null;
  return userFromRow(data as UserRow);
}
