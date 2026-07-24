import { IS_LIVE } from "@/lib/config";

/**
 * Lightweight demand analytics: one row per search-results render.
 * No user identifiers on purpose — this is supply planning, not tracking.
 */

export interface SearchEvent {
  airportSlug: string;
  destName: string;
  results: number;
  createdAt: string;
}

const g = globalThis as unknown as { __parkgoSearchEvents?: SearchEvent[] };
const mockEvents: SearchEvent[] = (g.__parkgoSearchEvents ??= []);
const MOCK_CAP = 500;

/** Fire-and-forget log; must never slow down or break the search page. */
export async function logSearchEvent(input: {
  airportSlug: string;
  destName: string;
  results: number;
}): Promise<void> {
  try {
    if (!IS_LIVE) {
      mockEvents.push({ ...input, createdAt: new Date().toISOString() });
      if (mockEvents.length > MOCK_CAP) mockEvents.splice(0, mockEvents.length - MOCK_CAP);
      return;
    }
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("search_events").insert({
      airport_slug: input.airportSlug,
      dest_name: input.destName,
      results: input.results,
    });
  } catch {
    // analytics must never break the product
  }
}

export interface DestSearchStats {
  airportSlug: string;
  destName: string;
  searches: number;
  zeroResults: number;
}

/** Per-destination search counts (newest 2000 events in live mode). */
export async function listSearchStats(): Promise<DestSearchStats[]> {
  let events: SearchEvent[] = [];
  if (!IS_LIVE) {
    events = mockEvents;
  } else {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      const { data } = await supabaseAdmin()
        .from("search_events")
        .select("airport_slug, dest_name, results, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      events = (data ?? []).map((r) => ({
        airportSlug: r.airport_slug,
        destName: r.dest_name ?? r.airport_slug,
        results: r.results ?? 0,
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }
  const agg = new Map<string, DestSearchStats>();
  for (const e of events) {
    const row = agg.get(e.airportSlug) ?? {
      airportSlug: e.airportSlug,
      destName: e.destName,
      searches: 0,
      zeroResults: 0,
    };
    row.searches += 1;
    if (e.results === 0) row.zeroResults += 1;
    agg.set(e.airportSlug, row);
  }
  return [...agg.values()].sort((a, b) => b.searches - a.searches);
}
