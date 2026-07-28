import type {
  CareService,
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
/** Runtime fee overrides (from /admin/settings); defaults = code constants. */
export interface PriceConfig {
  serviceFee: Pence;
  parkingCommissionBps: number;
  transferCommissionBps: number;
}

/** Cancellation protection premium as a share of the stay, in basis points. */
export const PROTECTION_BPS = 800;

/** What the traveller adds on top of the stay itself. */
export interface BundleExtras {
  /** Buy cancellation protection. */
  protection?: boolean;
  /** Care services chosen from the ones this host offers. */
  care?: CareService[];
}

export function priceBundle(
  space: Space,
  bundle: BookingBundle,
  startAt: string,
  endAt: string,
  currency: "GBP" | "EUR" = "GBP",
  cfg?: PriceConfig,
  extras?: BundleExtras
): PriceBreakdown {
  const parking: Pence = isHourlyStay(space, startAt, endAt)
    ? Math.min(hoursBetween(startAt, endAt) * (space.pricePerHour as Pence), space.pricePerDay)
    : dailyParkingTotal(space, startAt, endAt);
  const transfer: Pence = bundle.transfer
    ? TRANSFER_BASE_FARE * (bundle.transferReturn ? 2 : 1)
    : 0;
  const ev: Pence = bundle.ev ? evCost(space.evCharger) : 0;
  const serviceFee: Pence = cfg?.serviceFee ?? SERVICE_FEE;
  // Protection is priced off the stay, not the whole bundle: it covers the
  // booking being cancelled, and the transfer and service fee are refundable
  // anyway.
  const protection: Pence = extras?.protection ? bps(parking, PROTECTION_BPS) : 0;
  const care: Pence = (extras?.care ?? []).reduce((n, c) => n + Math.max(0, c.pricePence), 0);

  const total = parking + transfer + ev + serviceFee + protection + care;
  const split = computeSplit({ parking, transfer, ev, serviceFee, protection, care }, cfg);

  return { parking, transfer, ev, serviceFee, protection, care, total, split, currency };
}

/**
 * Daily parking total, day by day. Per-date custom prices win outright;
 * otherwise Saturdays and Sundays get the host's weekend uplift (percent).
 * Equals pricePerDay × days when neither applies, so existing prices are
 * untouched.
 */
export function dailyParkingTotal(
  space: Pick<Space, "pricePerDay" | "weekendUpliftPct" | "customPrices">,
  startAt: string,
  endAt: string
): Pence {
  const days = daysBetween(startAt, endAt);
  const pct = space.weekendUpliftPct ?? 0;
  const custom = space.customPrices ?? {};
  if (pct <= 0 && Object.keys(custom).length === 0) return space.pricePerDay * days;
  const start = new Date(startAt);
  let total = 0;
  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + i * 86_400_000);
    const key = day.toISOString().slice(0, 10);
    const override = custom[key];
    if (typeof override === "number" && override > 0) {
      total += Math.round(override);
      continue;
    }
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    total += weekend && pct > 0
      ? Math.round(space.pricePerDay * (1 + Math.min(pct, 100) / 100))
      : space.pricePerDay;
  }
  return total;
}

/**
 * Split the gross into platform commission + host/driver payouts.
 * Commission is taken per-line (parking vs transfer); the flat service fee is
 * pure platform revenue. EV revenue follows the parking commission (the host
 * owns the charger).
 */
export function computeSplit(
  lines: {
    parking: Pence;
    transfer: Pence;
    ev: Pence;
    serviceFee: Pence;
    /** Cancellation protection premium — the platform carries the risk. */
    protection?: Pence;
    /** Car care — the host does the work, so it is theirs net of commission. */
    care?: Pence;
  },
  cfg?: PriceConfig
): PaymentSplit {
  const protection = lines.protection ?? 0;
  const care = lines.care ?? 0;
  const parkingCommission = bps(
    lines.parking + lines.ev + care,
    cfg?.parkingCommissionBps ?? COMMISSION.parkingBps
  );
  const transferCommission = bps(
    lines.transfer,
    cfg?.transferCommissionBps ?? COMMISSION.transferBps
  );

  // Protection is pure platform revenue: ParkGo refunds the traveller when it
  // is claimed, so ParkGo keeps the premium.
  const platform = parkingCommission + transferCommission + lines.serviceFee + protection;
  const hostPayout = lines.parking + lines.ev + care - parkingCommission;
  const driverPayout = lines.transfer - transferCommission;

  return { platform, hostPayout, driverPayout };
}

/**
 * Apply a promo discount to a computed price. The discount is absorbed by the
 * platform share (host and driver payouts stay whole), so it is capped at the
 * platform's cut — the split keeps reconciling with the new total.
 */
export function applyPromoToPrice(
  price: PriceBreakdown,
  promo: { code: string; kind: "percent" | "fixed"; value: number }
): PriceBreakdown {
  const raw =
    promo.kind === "percent"
      ? Math.round((price.total * Math.min(Math.max(promo.value, 0), 100)) / 100)
      : Math.max(promo.value, 0);
  const discount = Math.min(raw, price.split.platform);
  if (discount <= 0) return price;
  return {
    ...price,
    total: price.total - discount,
    split: { ...price.split, platform: price.split.platform - discount },
    promoCode: promo.code,
    discount,
  };
}

/** Sanity invariant used in tests: payouts + platform === total. */
export function splitReconciles(price: PriceBreakdown): boolean {
  const { platform, hostPayout, driverPayout } = price.split;
  return platform + hostPayout + driverPayout === price.total;
}
