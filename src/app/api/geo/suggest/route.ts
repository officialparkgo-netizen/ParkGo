import { NextRequest } from "next/server";
import { geocodeUk } from "@/lib/geo-search";
import { getSuggestIndex } from "@/lib/suggest-index";
import { norm, suggestFromIndex, type SuggestRow } from "@/lib/suggest";

export const dynamic = "force-dynamic";

export type DestSuggestion = SuggestRow;

/**
 * Live destination suggestions for the search box.
 *
 * Two sources, in order: our own index (destinations plus the areas and
 * postcode districts of live listings — see src/lib/suggest.ts, which is also
 * where the rule about never exposing an exact address lives), then Mapbox
 * UK/IE geocoding for anything we don't serve. Without a Mapbox token the
 * second source is simply absent and the first still answers, which is the
 * state the site ships in today.
 */
export async function GET(request: NextRequest) {
  // Bounded before anything touches it: this is unauthenticated and called on
  // every keystroke, so a megabyte of "q" should cost nothing.
  const raw = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 64);
  if (raw.length < 2) return Response.json({ suggestions: [] });

  const local = suggestFromIndex(raw, await getSuggestIndex());

  // Geocoded places fill whatever room is left, minus anything we already
  // offer under the same name.
  const room = Math.max(0, 7 - local.length);
  let remote: SuggestRow[] = [];
  if (room > 0) {
    const seen = new Set(local.map((s) => norm(s.label)));
    remote = (await geocodeUk(raw))
      .filter((g) => !seen.has(norm(g.label)))
      .slice(0, room)
      .map((g) => ({ label: g.label, lat: g.lat, lng: g.lng, type: "place" as const }));
  }

  return Response.json(
    { suggestions: [...local, ...remote] },
    // `private` is deliberate: middleware may attach Set-Cookie on this path in
    // live mode, and the body reflects mutable listing state. Do not widen this
    // to a shared/CDN cache.
    { headers: { "cache-control": "private, max-age=60" } }
  );
}
