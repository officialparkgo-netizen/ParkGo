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

/** Why a geocode produced nothing — see geocodeUkDetailed. */
export type GeocodeOutcome =
  | { ok: true; hits: GeoHit[]; via: "v6" | "v5" }
  | {
      ok: false;
      reason: "no-token" | "too-short" | "http" | "network" | "no-match";
      status?: number;
      via?: "v6" | "v5";
    };

/**
 * The two versions do not accept the same feature types, and sending v5's list
 * to v6 gets the whole request rejected. `poi` in particular does not exist in
 * v6 — Mapbox moved points of interest to the Search Box API — so a v6 call
 * asking for it fails and we silently end up on the legacy endpoint. `district`
 * and `street` are the v6 additions worth having for address-level queries.
 */
const V6_TYPES = "postcode,place,locality,neighborhood,district,street,address";
const V5_TYPES = "postcode,place,locality,neighborhood,address,poi";

/** v6 forward geocoding — the current API. */
function v6Url(query: string, token: string): string {
  const p = new URLSearchParams({
    q: query,
    access_token: token,
    country: "gb,ie",
    limit: "5",
    autocomplete: "true",
    language: "en",
    types: V6_TYPES,
  });
  return `https://api.mapbox.com/search/geocode/v6/forward?${p}`;
}

/** v5 — legacy, kept only as a fallback for older tokens. */
function v5Url(query: string, token: string): string {
  const p = new URLSearchParams({
    access_token: token,
    country: "gb,ie",
    limit: "5",
    autocomplete: "true",
    language: "en",
    types: V5_TYPES,
  });
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${p}`;
}

/** Both API versions, normalised to one shape. */
export function parseGeocode(version: "v6" | "v5", body: unknown): GeoHit[] {
  const features = (body as { features?: unknown[] })?.features;
  if (!Array.isArray(features)) return [];
  const out: GeoHit[] = [];
  for (const raw of features) {
    const f = raw as {
      place_name?: string;
      center?: [number, number];
      geometry?: { coordinates?: [number, number] };
      properties?: { full_address?: string; name?: string; place_formatted?: string };
    };
    let label: string | undefined;
    let coords: [number, number] | undefined;
    if (version === "v6") {
      const p = f.properties ?? {};
      label =
        p.full_address ??
        (p.name && p.place_formatted ? `${p.name}, ${p.place_formatted}` : p.name);
      coords = f.geometry?.coordinates;
    } else {
      label = f.place_name;
      coords = f.center;
    }
    if (!label || !Array.isArray(coords) || coords.length !== 2) continue;
    const [lng, lat] = coords;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    out.push({ label, lat, lng });
  }
  return out;
}

/**
 * Mapbox geocoding, UK & Ireland only.
 *
 * Tries v6 — the current forward-geocoding API — and falls back to v5 only when
 * v6 refuses the request outright. The old code called v5 exclusively, which is
 * Mapbox's legacy endpoint; a token issued today can be perfectly valid and
 * still get nothing back from it, and because every failure here returns an
 * empty array that looked exactly like "no results". Hence the outcome type:
 * a wrong token, a retired endpoint and a timeout are three different problems
 * and used to be indistinguishable from the outside.
 */
export async function geocodeUkDetailed(q: string): Promise<GeocodeOutcome> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const query = q.trim();
  if (!token) return { ok: false, reason: "no-token" };
  // Two characters is a real outward code — N1, E1, W1 — so don't refuse it.
  if (query.length < 2) return { ok: false, reason: "too-short" };

  let lastStatus: number | undefined;
  let lastVia: "v6" | "v5" | undefined;
  for (const via of ["v6", "v5"] as const) {
    try {
      const res = await fetch(via === "v6" ? v6Url(query, token) : v5Url(query, token), {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      });
      if (!res.ok) {
        lastStatus = res.status;
        lastVia = via;
        continue; // 401/403/404 on v6 → worth trying the legacy path once
      }
      const hits = parseGeocode(via, await res.json());
      if (hits.length > 0) return { ok: true, hits, via };
      lastVia = via;
    } catch {
      lastVia = via;
      return { ok: false, reason: "network", via };
    }
  }
  return lastStatus !== undefined
    ? { ok: false, reason: "http", status: lastStatus, via: lastVia }
    : { ok: false, reason: "no-match", via: lastVia };
}

/** Hits only. Silent on every failure — callers that want to know use the detailed form. */
export async function geocodeUk(q: string): Promise<GeoHit[]> {
  const res = await geocodeUkDetailed(q);
  return res.ok ? res.hits : [];
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
