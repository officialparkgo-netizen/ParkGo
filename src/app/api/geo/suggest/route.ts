import { NextRequest } from "next/server";
import { getAirports } from "@/lib/data/store";
import { geocodeUk } from "@/lib/geo-search";

export const dynamic = "force-dynamic";

export interface DestSuggestion {
  label: string;
  /** Set for destinations we serve directly. */
  slug?: string;
  /** Set for geocoded places (search shows the nearest served destination). */
  lat?: number;
  lng?: number;
}

/**
 * Live destination suggestions for the search box: our own airports/places
 * first, then Mapbox UK/IE geocoding (postcodes, towns, streets) when a
 * token is configured. Without a token only local suggestions come back.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return Response.json({ suggestions: [] });

  const local: DestSuggestion[] = getAirports()
    .filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q)
    )
    .slice(0, 4)
    .map((a) => ({
      label: !a.kind || a.kind === "airport" ? `${a.name} (${a.code})` : a.name,
      slug: a.slug,
    }));

  const remote: DestSuggestion[] = (await geocodeUk(q)).map((g) => ({
    label: g.label,
    lat: g.lat,
    lng: g.lng,
  }));

  // Local first; drop remote rows that duplicate a served destination name.
  const seen = new Set(local.map((s) => s.label.toLowerCase()));
  const suggestions = [
    ...local,
    ...remote.filter((s) => !seen.has(s.label.toLowerCase())),
  ].slice(0, 7);

  return Response.json(
    { suggestions },
    { headers: { "cache-control": "private, max-age=60" } }
  );
}
