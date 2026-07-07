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
};

function fromRow(r: WaitlistRow): WaitlistEntry {
  return {
    id: r.id,
    email: r.email,
    role: r.role as WaitlistEntry["role"],
    airport: r.airport ?? undefined,
    createdAt: r.created_at,
  };
}

export async function addWaitlistEntry(
  entry: Omit<WaitlistEntry, "id" | "createdAt">
): Promise<WaitlistEntry> {
  if (!IS_LIVE) return addWaitlistMock(entry);

  const { data, error } = await supabaseAdmin()
    .from("waitlist")
    .insert({ email: entry.email, role: entry.role, airport: entry.airport ?? null })
    .select("id, email, role, airport, created_at")
    .single();

  if (error) throw new Error(`waitlist insert failed: ${error.message}`);
  return fromRow(data as WaitlistRow);
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  if (!IS_LIVE) return getWaitlistMock();

  const { data, error } = await supabaseAdmin()
    .from("waitlist")
    .select("id, email, role, airport, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`waitlist read failed: ${error.message}`);
  return (data as WaitlistRow[]).map(fromRow);
}
