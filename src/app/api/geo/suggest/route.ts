import { NextRequest } from "next/server";
import { geocodeUkDetailed, type GeocodeOutcome } from "@/lib/geo-search";
import { getSuggestIndex } from "@/lib/suggest-index";
import { norm, suggestFromIndex, type SuggestRow } from "@/lib/suggest";

export const dynamic = "force-dynamic";

export type DestSuggestion = SuggestRow;

/** Turn a geocoder failure into the thing you would actually go and change. */
function geocodeHint(geo: Extract<GeocodeOutcome, { ok: false }>): string {
  switch (geo.reason) {
    case "no-token":
      return "NEXT_PUBLIC_MAPBOX_TOKEN is not set on the server. Add it in Vercel and redeploy.";
    case "http":
      if (geo.status === 401)
        return "Mapbox rejected the token. Check it is the public (pk.…) token and has not been rotated.";
      if (geo.status === 403)
        return "Mapbox refused the token. The usual cause is a URL restriction: this call is made server-side and sends no Referer, so either remove the URL restriction on the token or issue an unrestricted one for server use.";
      if (geo.status === 404)
        return "Mapbox returned 404 for both the v6 and v5 endpoints — check the token's account is active.";
      if (geo.status === 429) return "Mapbox rate limit reached for this token.";
      return `Mapbox returned HTTP ${geo.status}.`;
    case "network":
      return "Could not reach api.mapbox.com — a timeout, or outbound network is blocked.";
    case "no-match":
      return "Mapbox answered but had no result for that query.";
    case "too-short":
      return "Query too short to geocode.";
  }
}

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
  let geo: GeocodeOutcome | null = null;
  if (room > 0) {
    geo = await geocodeUkDetailed(raw);
    if (geo.ok) {
      const seen = new Set(local.map((s) => norm(s.label)));
      remote = geo.hits
        .filter((g) => !seen.has(norm(g.label)))
        .slice(0, room)
        .map((g) => ({ label: g.label, lat: g.lat, lng: g.lng, type: "place" as const }));
    }
  }

  // ?diag=1 reports whether geocoding is actually working. It returns only the
  // outcome — never the token, never a URL — because the alternative is what we
  // had before: a postcode search that quietly returns nothing whether the key
  // is missing, wrong, restricted, or the endpoint has moved.
  const diag =
    request.nextUrl.searchParams.get("diag") === "1"
      ? {
          geocoder: geo
            ? geo.ok
              ? { status: "ok" as const, via: geo.via, hits: geo.hits.length }
              : {
                  status: geo.reason,
                  ...(geo.status ? { http: geo.status } : {}),
                  via: geo.via,
                  hint: geocodeHint(geo),
                }
            : { status: "skipped" as const, why: "local results filled the list" },
          local: local.length,
        }
      : undefined;

  return Response.json(
    { suggestions: [...local, ...remote], ...(diag ? { diag } : {}) },
    // `private` is deliberate: middleware may attach Set-Cookie on this path in
    // live mode, and the body reflects mutable listing state. Do not widen this
    // to a shared/CDN cache.
    { headers: { "cache-control": "private, max-age=60" } }
  );
}
