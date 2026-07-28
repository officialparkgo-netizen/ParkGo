import "server-only";
import type { FlightLink } from "@/types";

/**
 * Flight status, so a delayed landing extends the parking instead of
 * overrunning it.
 *
 * Gated on a provider key. Without one this returns "unknown" and the rest of
 * the system carries on unchanged — a booking with a flight number attached is
 * still perfectly valid, it just is not watched. The alternative, guessing at
 * arrival times, would extend stays that were never delayed and bill hosts'
 * spaces for time nobody used.
 */

export function isFlightTrackingConfigured(): boolean {
  return !!process.env.AVIATIONSTACK_KEY;
}

/**
 * IATA designator: a two-character carrier code with at most one digit in it,
 * then 1–4 flight digits. "BA2490", "EI21", "U28765".
 *
 * Deliberately not the looser "2–3 alphanumerics then digits": that accepts
 * BA12345, reading "BA1" as the carrier and "2345" as the number, and sends a
 * lookup for a flight that does not exist. Three-letter codes are ICAO, which
 * this provider's `flight_iata` parameter does not take.
 */
export function isFlightNumber(input: string): boolean {
  return /^(?:[A-Z]{2}|[A-Z]\d|\d[A-Z])\d{1,4}$/.test(input.trim().toUpperCase());
}

export interface FlightStatus {
  status: FlightLink["status"];
  /** Latest known arrival, when the provider gave one. */
  estimatedArrival?: string;
  scheduledArrival?: string;
}

/**
 * Look a flight up for a given date. The date matters: BA2490 flies most days,
 * and yesterday's delay says nothing about today's.
 */
export async function lookupFlight(
  flightNumber: string,
  dateIso: string
): Promise<FlightStatus> {
  const key = process.env.AVIATIONSTACK_KEY;
  const number = flightNumber.trim().toUpperCase();
  if (!key || !isFlightNumber(number)) return { status: "unknown" };

  const url = new URL("https://api.aviationstack.com/v1/flights");
  url.searchParams.set("access_key", key);
  url.searchParams.set("flight_iata", number);
  url.searchParams.set("flight_date", dateIso.slice(0, 10));
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { status: "unknown" };
    const body = (await res.json()) as {
      data?: {
        flight_status?: string;
        arrival?: { scheduled?: string; estimated?: string; actual?: string };
      }[];
    };
    const hit = body.data?.[0];
    if (!hit) return { status: "unknown" };

    const arrival = hit.arrival ?? {};
    const estimated = arrival.actual || arrival.estimated || arrival.scheduled;
    return {
      status: mapStatus(hit.flight_status, arrival.scheduled, estimated),
      estimatedArrival: estimated,
      scheduledArrival: arrival.scheduled,
    };
  } catch {
    // A provider outage must never break a booking page.
    return { status: "unknown" };
  }
}

/**
 * The provider says "active"/"landed"/"cancelled"; whether it is *delayed* is
 * ours to decide from the gap between scheduled and estimated. Fifteen minutes
 * is the usual industry threshold and is well inside the slack in a parking
 * booking, so anything under it is treated as on time.
 */
export const DELAY_THRESHOLD_MIN = 15;

function mapStatus(
  raw: string | undefined,
  scheduled: string | undefined,
  estimated: string | undefined
): FlightLink["status"] {
  if (raw === "cancelled") return "cancelled";
  if (raw === "landed") return "landed";
  if (scheduled && estimated) {
    const late = (new Date(estimated).getTime() - new Date(scheduled).getTime()) / 60_000;
    if (late >= DELAY_THRESHOLD_MIN) return "delayed";
  }
  if (raw === "scheduled" || raw === "active") return "scheduled";
  return "unknown";
}

/**
 * How much later the booking should end, given a flight's latest arrival.
 *
 * Returns null when nothing should change. The buffer is the time it actually
 * takes to clear the aircraft, walk the terminal, collect a bag and reach the
 * car — a booking that ends the minute the wheels touch down is a booking that
 * overruns.
 */
export const POST_LANDING_BUFFER_MIN = 90;

export function extendedEndFor(
  currentEndAt: string,
  flight: Pick<FlightLink, "status" | "estimatedArrival" | "extendedAt">
): string | null {
  // Once extended, never again: a flight that keeps slipping would otherwise
  // ratchet a stay out indefinitely without anyone agreeing to it.
  if (flight.extendedAt) return null;
  if (flight.status !== "delayed" && flight.status !== "landed") return null;
  if (!flight.estimatedArrival) return null;

  const needed = new Date(flight.estimatedArrival).getTime() + POST_LANDING_BUFFER_MIN * 60_000;
  const current = new Date(currentEndAt).getTime();
  if (!Number.isFinite(needed) || needed <= current) return null;

  // Round up to the next quarter hour so the new end time reads sensibly.
  const rounded = Math.ceil(needed / (15 * 60_000)) * (15 * 60_000);
  return new Date(rounded).toISOString();
}
