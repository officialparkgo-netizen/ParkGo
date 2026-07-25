import type { SpaceAlert } from "@/types";
import { IS_LIVE } from "@/lib/config";

/**
 * Saved spaces and price/availability watches.
 *
 * Both are traveller-owned lists keyed by user, so they share a file. Mock
 * mode keeps them on globalThis like the rest of the demo data; live mode uses
 * the `saved_spaces` and `space_alerts` tables from migration 0025.
 */

const g = globalThis as unknown as {
  __parkgoSaved?: { userId: string; spaceId: string; createdAt: string }[];
  __parkgoAlerts?: SpaceAlert[];
};
const savedMock = (g.__parkgoSaved ??= []);
const alertsMock = (g.__parkgoAlerts ??= []);

// ---------------------------------------------------------------- saved -----

/** Space ids this traveller has kept, newest first. */
export async function listSavedSpaceIds(userId: string): Promise<string[]> {
  if (!IS_LIVE) {
    return savedMock
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => r.spaceId);
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("saved_spaces")
      .select("space_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r) => r.space_id as string);
  } catch {
    return [];
  }
}

/** Toggle a save. Returns the state afterwards, so the caller can render it. */
export async function toggleSavedSpace(userId: string, spaceId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const i = savedMock.findIndex((r) => r.userId === userId && r.spaceId === spaceId);
    if (i >= 0) {
      savedMock.splice(i, 1);
      return false;
    }
    savedMock.push({ userId, spaceId, createdAt: new Date().toISOString() });
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data: existing } = await admin
      .from("saved_spaces")
      .select("space_id")
      .eq("user_id", userId)
      .eq("space_id", spaceId)
      .maybeSingle();
    if (existing) {
      await admin.from("saved_spaces").delete().eq("user_id", userId).eq("space_id", spaceId);
      return false;
    }
    await admin.from("saved_spaces").insert({ user_id: userId, space_id: spaceId });
    return true;
  } catch {
    return false;
  }
}

export async function isSpaceSaved(userId: string, spaceId: string): Promise<boolean> {
  return (await listSavedSpaceIds(userId)).includes(spaceId);
}

// --------------------------------------------------------------- alerts -----

type AlertRow = {
  id: string;
  user_id: string;
  space_id: string | null;
  airport_slug: string | null;
  start_at: string | null;
  end_at: string | null;
  max_price_pence: number | null;
  notified_at: string | null;
  created_at: string;
};

function alertFromRow(r: AlertRow): SpaceAlert {
  return {
    id: r.id,
    userId: r.user_id,
    spaceId: r.space_id ?? undefined,
    airportSlug: r.airport_slug ?? undefined,
    startAt: r.start_at ?? undefined,
    endAt: r.end_at ?? undefined,
    maxPricePence: r.max_price_pence ?? undefined,
    notifiedAt: r.notified_at ?? undefined,
    createdAt: r.created_at,
  };
}

export async function createSpaceAlert(
  input: Omit<SpaceAlert, "id" | "createdAt" | "notifiedAt">
): Promise<SpaceAlert | null> {
  // A watch must be about something, or the sweep would match every listing.
  if (!input.spaceId && !input.airportSlug) return null;

  if (!IS_LIVE) {
    const row: SpaceAlert = {
      ...input,
      id: `al_${alertsMock.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    alertsMock.push(row);
    return row;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("space_alerts")
      .insert({
        user_id: input.userId,
        space_id: input.spaceId ?? null,
        airport_slug: input.airportSlug ?? null,
        start_at: input.startAt ?? null,
        end_at: input.endAt ?? null,
        max_price_pence: input.maxPricePence ?? null,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    return alertFromRow(data as AlertRow);
  } catch {
    return null;
  }
}

export async function listAlertsForUser(userId: string): Promise<SpaceAlert[]> {
  if (!IS_LIVE) {
    return alertsMock
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("space_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map((r) => alertFromRow(r as AlertRow));
  } catch {
    return [];
  }
}

/** Every watch still waiting to fire — the input to the sweep. */
export async function listPendingAlerts(): Promise<SpaceAlert[]> {
  if (!IS_LIVE) return alertsMock.filter((a) => !a.notifiedAt);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("space_alerts")
      .select("*")
      .is("notified_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    return (data ?? []).map((r) => alertFromRow(r as AlertRow));
  } catch {
    return [];
  }
}

export async function markAlertNotified(id: string): Promise<boolean> {
  const at = new Date().toISOString();
  if (!IS_LIVE) {
    const a = alertsMock.find((x) => x.id === id);
    if (!a) return false;
    a.notifiedAt = at;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("space_alerts")
      .update({ notified_at: at })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/** Traveller cancelling a watch they no longer want. */
export async function deleteSpaceAlert(id: string, userId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const i = alertsMock.findIndex((x) => x.id === id && x.userId === userId);
    if (i < 0) return false;
    alertsMock.splice(i, 1);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    // Scoped to the owner so an id from someone else's list does nothing.
    const { error } = await supabaseAdmin()
      .from("space_alerts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}
