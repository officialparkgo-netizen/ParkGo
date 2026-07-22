import type {
  BookingBundle,
  EvCharger,
  PaymentSplit,
  Pence,
  PriceBreakdown,
  Space,
} from "@/types";
import { daysBetween, hoursBetween } from "@/lib/utils";

/**
 * Commission configuration (basis points). Indicative figures from the business
 * plan: ~15–20% on parking, ~10–15% on transfers. Overridable via env in live
 * mode; these are the mock-mode defaults.
 */
export const COMMISSION = {
  parkingBps: Number(process.env.PARKGO_COMMISSION_PARKING_BPS ?? 1800), // 18%
  transferBps: Number(process.env.PARKGO_COMMISSION_TRANSFER_BPS ?? 1200), // 12%
};

/** Flat platform service fee added at checkout (pence). */
export const SERVICE_FEE: Pence = 299;

/** Indicative licensed-transfer base fare (pence) used in mock mode. */
export const TRANSFER_BASE_FARE: Pence = 2400;

/** Assumed EV top-up for pricing the EV add-on when kWh is unknown (kWh). */
const EV_ASSUMED_KWH = 30;

function bps(amount: Pence, basisPoints: number): Pence {
  return Math.round((amount * basisPoints) / 10_000);
}

/**
 * A stay bills hourly when the space offers an hourly rate and the window is
 * a same-day slot with actual clock times. Date-only (midnight-to-midnight)
 * windows always bill daily, so a degenerate same-day daily booking can never
 * slip into hourly pricing. Hourly parking is capped at the day rate, so a
 * long hourly stay never costs more than the same day booked daily.
 */
export function isHourlyStay(space: Space, startAt: string, endAt: string): boolean {
  if (!space.pricePerHour) return false;
  const s = new Date(startAt);
  const e = new Date(endAt);
  const sameDay = s.toISOString().slice(0, 10) === e.toISOString().slice(0, 10);
  const hasClockTime =
    s.getUTCHours() + s.getUTCMinutes() + e.getUTCHours() + e.getUTCMinutes() > 0;
  return sameDay && hasClockTime;
}

export function evCost(charger: EvCharger | null): Pence {
  if (!charger) return 0;
  return Math.round(charger.pricePerKwh * EV_ASSUMED_KWH);
}

/**
 * Compute the full bundle price + marketplace split for a booking.
 * Single price, single checkout — the differentiator in the brief.
 */
export function priceBundle(
  space: Space,
  bundle: BookingBundle,
  startAt: string,
  endAt: string,
  currency: "GBP" | "EUR" = "GBP"
): PriceBreakdown {
  const parking: Pence = isHourlyStay(space, startAt, endAt)
    ? Math.min(hoursBetween(startAt, endAt) * (space.pricePerHour as Pence), space.pricePerDay)
    : space.pricePerDay * daysBetween(startAt, endAt);
  const transfer: Pence = bundle.transfer
    ? TRANSFER_BASE_FARE * (bundle.transferReturn ? 2 : 1)
    : 0;
  const ev: Pence = bundle.ev ? evCost(space.evCharger) : 0;
  const serviceFee: Pence = SERVICE_FEE;

  const total = parking + transfer + ev + serviceFee;
  const split = computeSplit({ parking, transfer, ev, serviceFee });

  return { parking, transfer, ev, serviceFee, total, split, currency };
}

/**
 * Split the gross into platform commission + host/driver payouts.
 * Commission is taken per-line (parking vs transfer); the flat service fee is
 * pure platform revenue. EV revenue follows the parking commission (the host
 * owns the charger).
 */
export function computeSplit(lines: {
  parking: Pence;
  transfer: Pence;
  ev: Pence;
  serviceFee: Pence;
}): PaymentSplit {
  const parkingCommission = bps(lines.parking + lines.ev, COMMISSION.parkingBps);
  const transferCommission = bps(lines.transfer, COMMISSION.transferBps);

  const platform = parkingCommission + transferCommission + lines.serviceFee;
  const hostPayout = lines.parking + lines.ev - parkingCommission;
  const driverPayout = lines.transfer - transferCommission;

  return { platform, hostPayout, driverPayout };
}

/** Sanity invariant used in tests: payouts + platform === total. */
export function splitReconciles(price: PriceBreakdown): boolean {
  const { platform, hostPayout, driverPayout } = price.split;
  return platform + hostPayout + driverPayout === price.total;
}
