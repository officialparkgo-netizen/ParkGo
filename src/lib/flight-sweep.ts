import "server-only";
import {
  applyFlightExtension,
  listFlightWatchedBookings,
  recordFlightCheck,
} from "@/lib/data/bookings";
import { extendedEndFor, isFlightTrackingConfigured, lookupFlight } from "@/lib/flights";

export interface FlightSweepResult {
  checked: number;
  extended: number;
  /** Extra owed to hosts that the platform's cut could not cover, in pence. */
  shortfallPence: number;
  skipped: "no-provider" | null;
}

/**
 * Check every watched flight and extend the bookings whose flight is late.
 *
 * Deliberately narrow: only bookings that already carry a flight number and
 * have not been extended yet, and only within the window where an extension
 * could still matter. Checking a flight three weeks out would burn the API
 * quota on information that will have changed by the time it is needed.
 */
export const WATCH_WINDOW_MS = 36 * 60 * 60 * 1000;

export async function runFlightSweep(now = new Date()): Promise<FlightSweepResult> {
  const out: FlightSweepResult = { checked: 0, extended: 0, shortfallPence: 0, skipped: null };
  if (!isFlightTrackingConfigured()) return { ...out, skipped: "no-provider" };

  const watched = await listFlightWatchedBookings(200);
  for (const booking of watched) {
    const flight = booking.flight;
    if (!flight) continue;

    // Only worth checking near the end of the stay: that is when a delay
    // changes anything, and an arrival already long past cannot be fixed.
    const endsAt = new Date(booking.endAt).getTime();
    const gap = endsAt - now.getTime();
    if (gap > WATCH_WINDOW_MS || gap < -WATCH_WINDOW_MS) continue;

    const status = await lookupFlight(flight.number, flight.scheduledArrival);
    out.checked += 1;
    if (status.status === "unknown") continue;

    const newEnd = extendedEndFor(booking.endAt, {
      status: status.status,
      estimatedArrival: status.estimatedArrival,
      extendedAt: flight.extendedAt,
    });

    if (!newEnd) {
      await recordFlightCheck(booking.id, status.status, status.estimatedArrival);
      continue;
    }

    const applied = await applyFlightExtension(booking.id, newEnd, {
      number: flight.number,
      estimatedArrival: status.estimatedArrival,
      status: status.status,
    });
    if (applied) {
      out.extended += 1;
      out.shortfallPence += applied.shortfall;
      const { sendFlightExtendedEmail } = await import("@/lib/booking-emails");
      await sendFlightExtendedEmail(applied.booking, flight.number);
    }
  }
  return out;
}
