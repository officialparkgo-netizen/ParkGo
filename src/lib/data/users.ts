import type { User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { getUser as getUserMock } from "@/lib/data/store";

type UserRow = {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string | null;
  locale: string;
  vehicle: unknown;
  corporate_account_id: string | null;
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
    createdAt: r.created_at,
  };
}

const PROFILE_COLS =
  "id, role, name, email, phone, locale, vehicle, corporate_account_id, created_at";

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
