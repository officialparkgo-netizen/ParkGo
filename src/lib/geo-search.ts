import type { Space } from "@/types";

/**
 * Free-text destination search: "Gatwick", "LGW", "Lowfield Heath" or
 * "RH11 0PT" all resolve to somewhere we can show results for. Postcodes are
 * matched space-insensitively so RH110PT and "rh11 0pt" both hit.
 */
export interface DestLite {
  slug: string;
  name: string;
  code: string;
  kind?: string;
}

export type QueryResolution =
  | { kind: "destination"; slug: string }
  | { kind: "spaces"; slug: string; spaceIds: string[] }
  | { kind: "none" };

const strip = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** Great-circle distance in km (haversine). */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The destination we serve that's closest to a point (null when list empty). */
export function nearestDestination<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  dests: T[]
): T | null {
  let best: T | null = null;
  let bestD = Infinity;
  for (const d of dests) {
    const dist = distanceKm(lat, lng, d.lat, d.lng);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

export interface GeoHit {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Mapbox geocoding, UK & Ireland only. Silent no-op without a token or on
 * any failure — the rest of search keeps working exactly as before.
 */
export async function geocodeUk(q: string): Promise<GeoHit[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const query = q.trim();
  if (!token || query.length < 3) return [];
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
      `?access_token=${token}&country=GB,IE&limit=5&autocomplete=true&language=en` +
      `&types=postcode,place,locality,neighborhood,address,poi`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500), cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features?: Array<{ place_name?: string; center?: [number, number] }>;
    };
    return (data.features ?? [])
      .filter((f) => f.place_name && Array.isArray(f.center) && f.center.length === 2)
      .map((f) => ({ label: f.place_name as string, lat: f.center![1], lng: f.center![0] }));
  } catch {
    return [];
  }
}

export function resolveSearchQuery(
  qRaw: string,
  destinations: DestLite[],
  spaces: Array<
    Pick<Space, "id" | "airportSlug" | "approxArea" | "exactAddress" | "title" | "status">
  >
): QueryResolution {
  const q = qRaw.trim().toLowerCase();
  if (!q) return { kind: "none" };

  // 1. Destination by exact code or slug ("LGW", "heathrow").
  const byCode = destinations.find(
    (d) => d.code.toLowerCase() === q || d.slug === q
  );
  if (byCode) return { kind: "destination", slug: byCode.slug };
  if (q.length < 3) return { kind: "none" };

  // 2. Destination by name, either direction ("gatwick" ⊆ "Gatwick Airport",
  //    "london gatwick airport" ⊇ "Gatwick Airport").
  const byName = destinations.find((d) => {
    const name = d.name.toLowerCase();
    return name.includes(q) || q.includes(name);
  });
  if (byName) return { kind: "destination", slug: byName.slug };

  // 3. Live spaces by area, street or postcode.
  const qs = strip(q);
  const matches = spaces.filter((s) => {
    if (s.status !== "live") return false;
    const hay = `${s.title} ${s.approxArea} ${s.exactAddress}`.toLowerCase();
    return hay.includes(q) || strip(hay).includes(qs);
  });
  if (matches.length > 0) {
    // The destination with the most matching spaces wins; show only those.
    const counts = new Map<string, number>();
    for (const m of matches) counts.set(m.airportSlug, (counts.get(m.airportSlug) ?? 0) + 1);
    const slug = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return {
      kind: "spaces",
      slug,
      spaceIds: matches.filter((m) => m.airportSlug === slug).map((m) => m.id),
    };
  }
  return { kind: "none" };
}
