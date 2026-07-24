import type { Host, Space } from "@/types";

/**
 * Listing quality: eight equally-weighted completeness checks. Failing checks
 * come back as i18n tip keys so the edit page can say exactly what to fix.
 * Purely presentational — search ranking is untouched.
 */
export interface ListingQuality {
  pct: number;
  tips: string[]; // i18n keys of the failing checks
}

export function computeListingQuality(
  space: Pick<
    Space,
    | "photos"
    | "accessRules"
    | "pricePerHour"
    | "cctv"
    | "liveCamera"
    | "covered"
    | "evCharger"
    | "weekendUpliftPct"
    | "customPrices"
    | "dimensions"
  >,
  host?: Pick<Host, "bio"> | null
): ListingQuality {
  const checks: Array<[boolean, string]> = [
    [space.photos.filter((p) => p.startsWith("http")).length >= 3, "host.quality.tip.photos"],
    [!!host?.bio?.trim(), "host.quality.tip.bio"],
    [(space.accessRules ?? "").trim().length >= 40, "host.quality.tip.access"],
    [(space.pricePerHour ?? 0) > 0, "host.quality.tip.hourly"],
    [space.cctv || space.liveCamera || !!space.covered, "host.quality.tip.security"],
    [!!space.evCharger, "host.quality.tip.ev"],
    [
      (space.weekendUpliftPct ?? 0) > 0 || Object.keys(space.customPrices ?? {}).length > 0,
      "host.quality.tip.pricing",
    ],
    [space.dimensions.lengthM > 0 && space.dimensions.widthM > 0, "host.quality.tip.size"],
  ];
  const passed = checks.filter(([ok]) => ok).length;
  return {
    pct: Math.round((passed / checks.length) * 100),
    tips: checks.filter(([ok]) => !ok).map(([, key]) => key),
  };
}

/**
 * Median live daily rate of OTHER listings at the same airport — the "area
 * average" a host compares their price against. Null when there is nothing
 * to compare with.
 */
export function areaMedianPrice(
  own: Pick<Space, "id" | "airportSlug">,
  all: Array<Pick<Space, "id" | "airportSlug" | "status" | "pricePerDay">>
): number | null {
  const peers = all
    .filter((s) => s.airportSlug === own.airportSlug && s.status === "live" && s.id !== own.id)
    .map((s) => s.pricePerDay)
    .sort((a, b) => a - b);
  if (peers.length === 0) return null;
  const mid = Math.floor(peers.length / 2);
  return peers.length % 2 ? peers[mid] : Math.round((peers[mid - 1] + peers[mid]) / 2);
}
