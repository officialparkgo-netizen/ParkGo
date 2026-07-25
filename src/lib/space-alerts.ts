import type { Space, SpaceAlert } from "@/types";

/**
 * Matching watches against listings.
 *
 * Two kinds of watch, both answered by the same predicate: "this exact space,
 * on these dates" and "anything near this airport under this price". A watch
 * with no price and no dates is simply "tell me when this space is bookable
 * again", which is the common case after a sold-out search.
 *
 * Pure: availability is resolved by the caller, because only it can query
 * bookings. That keeps the interesting logic testable.
 */
export function alertMatches(
  alert: SpaceAlert,
  space: Space,
  opts: { available: boolean }
): boolean {
  if (alert.notifiedAt) return false;
  if (space.status !== "live") return false;
  if (!opts.available) return false;

  if (alert.spaceId && alert.spaceId !== space.id) return false;
  if (!alert.spaceId && alert.airportSlug && alert.airportSlug !== space.airportSlug) {
    return false;
  }
  if (alert.maxPricePence && space.pricePerDay > alert.maxPricePence) return false;
  return true;
}

/** A watch nobody has acted on for this long is stale — stop checking it. */
export const ALERT_TTL_DAYS = 60;

export function isStale(alert: SpaceAlert, now: number = Date.now()): boolean {
  if (alert.notifiedAt) return true;
  const age = now - +new Date(alert.createdAt);
  if (age > ALERT_TTL_DAYS * 86_400_000) return true;
  // A dated watch is pointless once those dates have passed.
  return !!alert.endAt && +new Date(alert.endAt) < now;
}

/** Watches still worth evaluating on this sweep. */
export function liveAlerts(alerts: SpaceAlert[], now: number = Date.now()): SpaceAlert[] {
  return alerts.filter((a) => !isStale(a, now));
}
