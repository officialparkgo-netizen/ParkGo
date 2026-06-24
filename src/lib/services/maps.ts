/**
 * Maps & live location helpers.
 * Mock mode renders an on-brand schematic map (<LiveMap/>) — no token, no
 * network. Live mode swaps in Mapbox or Google Maps using NEXT_PUBLIC_* tokens;
 * the projection helpers below are provider-agnostic.
 */
export type MapsProvider = "mock" | "mapbox" | "google";

export function mapsProvider(): MapsProvider {
  return (process.env.NEXT_PUBLIC_MAPS_PROVIDER as MapsProvider) || "mock";
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Project a set of points into a normalised 0–1 viewport (with padding). */
export function projectToViewport(points: GeoPoint[], pad = 0.12) {
  if (points.length === 0) return () => ({ x: 0.5, y: 0.5 });
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 0.01;
  const spanLng = maxLng - minLng || 0.01;
  return (p: GeoPoint) => ({
    x: pad + (1 - 2 * pad) * ((p.lng - minLng) / spanLng),
    // invert y so north is up
    y: pad + (1 - 2 * pad) * (1 - (p.lat - minLat) / spanLat),
  });
}

/** Haversine distance in km — handy for ETA estimates in mock mode. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
