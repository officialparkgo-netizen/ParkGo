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

/** Profile row for a user id. Supabase in live mode, in-memory seed in mock. */
export async function getUserProfile(id: string): Promise<User | null> {
  if (!IS_LIVE) return getUserMock(id) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .select("id, role, name, email, phone, locale, vehicle, corporate_account_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return userFromRow(data as UserRow);
}
