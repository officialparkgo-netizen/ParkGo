import { IS_LIVE } from "@/lib/config";

/**
 * Listing page views — the denominator for the host's views → bookings
 * conversion. Deliberately tiny: no user ids, just space + timestamp.
 */
interface SpaceView {
  spaceId: string;
  at: string;
}

const g = globalThis as unknown as { __parkgoSpaceViews?: SpaceView[] };
const mockViews: SpaceView[] = (g.__parkgoSpaceViews ??= []);

/** Fire-and-forget page-view log; never throws. */
export async function logSpaceView(spaceId: string): Promise<void> {
  if (!spaceId) return;
  if (!IS_LIVE) {
    mockViews.push({ spaceId, at: new Date().toISOString() });
    if (mockViews.length > 2000) mockViews.splice(0, mockViews.length - 2000);
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("space_views").insert({ space_id: spaceId });
  } catch {
    // analytics must never break the page
  }
}

/** Views per space since a cutoff, for the given spaces only. */
export async function countViewsSince(
  spaceIds: string[],
  sinceIso: string
): Promise<Map<string, number>> {
  const counts = new Map<string, number>(spaceIds.map((id) => [id, 0]));
  if (spaceIds.length === 0) return counts;

  if (!IS_LIVE) {
    for (const v of mockViews) {
      if (v.at >= sinceIso && counts.has(v.spaceId)) {
        counts.set(v.spaceId, (counts.get(v.spaceId) ?? 0) + 1);
      }
    }
    return counts;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("space_views")
      .select("space_id")
      .in("space_id", spaceIds)
      .gte("created_at", sinceIso)
      .limit(5000);
    for (const row of data ?? []) {
      const id = (row as { space_id: string }).space_id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  } catch {
    // pre-0021 schema — conversion simply shows 0 views
  }
  return counts;
}
