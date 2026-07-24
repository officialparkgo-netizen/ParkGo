import type { WaitlistEntry } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import { addWaitlist as addWaitlistMock, getWaitlist as getWaitlistMock } from "@/lib/data/store";

/**
 * Waitlist data access — the first real DB-backed path.
 *
 * In live mode this reads/writes the Supabase `waitlist` table (public insert,
 * admin read per the RLS policy); in mock mode it uses the in-memory seed store.
 * Both branches return the same shape, so callers don't care which is active.
 */

type WaitlistRow = {
  id: string;
  email: string;
  role: string;
  airport: string | null;
  created_at: string;
  invited_at?: string | null;
  referred_by?: string | null;
};

function fromRow(r: WaitlistRow): WaitlistEntry {
  return {
    id: r.id,
    email: r.email,
    role: r.role as WaitlistEntry["role"],
    airport: r.airport ?? undefined,
    createdAt: r.created_at,
    invitedAt: r.invited_at ?? undefined,
    referredBy: r.referred_by ?? undefined,
  };
}

export async function addWaitlistEntry(
  entry: Omit<WaitlistEntry, "id" | "createdAt">
): Promise<WaitlistEntry> {
  if (!IS_LIVE) return addWaitlistMock(entry);

  const { data, error } = await supabaseAdmin()
    .from("waitlist")
    .insert({
      email: entry.email,
      role: entry.role,
      airport: entry.airport ?? null,
      ...(entry.referredBy ? { referred_by: entry.referredBy } : {}),
    })
    .select("*")
    .single();

  if (error) throw new Error(`waitlist insert failed: ${error.message}`);
  return fromRow(data as WaitlistRow);
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  if (!IS_LIVE) return getWaitlistMock();

  const { data, error } = await supabaseAdmin()
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`waitlist read failed: ${error.message}`);
  return (data as WaitlistRow[]).map(fromRow);
}

/** Mark a signup as invited (best-effort in live before migration 0019). */
export async function markWaitlistInvited(id: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { markWaitlistInvited: mockMark } = await import("@/lib/data/store");
    return !!mockMark(id);
  }
  try {
    const { error } = await supabaseAdmin()
      .from("waitlist")
      .update({ invited_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
