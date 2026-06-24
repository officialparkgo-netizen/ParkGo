import type {
  BookingBundle,
  EvCharger,
  PaymentSplit,
  Pence,
  PriceBreakdown,
  Space,
} from "@/types";
import { daysBetween } from "@/lib/utils";

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
  const nights = daysBetween(startAt, endAt);

  const parking: Pence = space.pricePerDay * nights;
  const transfer: Pence = bundle.transfer ? TRANSFER_BASE_FARE : 0;
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
