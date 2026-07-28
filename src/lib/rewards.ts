import type { GiftCard, Pence, PriceBreakdown, TripPass } from "@/types";

/**
 * Rewards a traveller has earned, and the two ways a booking can be paid for
 * with money that was already handed over.
 *
 * The distinction matters and is easy to get wrong: a **discount** reduces what
 * the booking is worth, so the platform absorbs it and the split has to be
 * recomputed. A **prepayment** — credit, a gift card, a trip pass — does not
 * change what the booking is worth at all. The host is still owed their full
 * share; only the amount charged to the card today goes down. Treating a gift
 * card as a discount would quietly pay hosts less for the same stay.
 */

// -----------------------------------------------------------------------------
// Loyalty
// -----------------------------------------------------------------------------

export interface LoyaltyTier {
  key: "none" | "silver" | "gold" | "platinum";
  label: string;
  /** Trips completed to reach this tier. */
  from: number;
  /** Automatic discount on the parking line, in basis points. */
  discountBps: number;
}

/**
 * Earned by completing trips, not by spending. A traveller who books five
 * cheap short stays is exactly as loyal as one who books two long ones, and
 * rewarding spend would push the programme towards the customers who need it
 * least.
 */
export const LOYALTY_TIERS: LoyaltyTier[] = [
  { key: "none", label: "", from: 0, discountBps: 0 },
  { key: "silver", label: "Silver", from: 3, discountBps: 300 },
  { key: "gold", label: "Gold", from: 8, discountBps: 600 },
  { key: "platinum", label: "Platinum", from: 20, discountBps: 1000 },
];

export function tierFor(completedTrips: number): LoyaltyTier {
  let out = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) if (completedTrips >= t.from) out = t;
  return out;
}

/** Trips still needed for the next tier, or null at the top. */
export function tripsToNextTier(completedTrips: number): { tier: LoyaltyTier; need: number } | null {
  const next = LOYALTY_TIERS.find((t) => t.from > completedTrips);
  return next ? { tier: next, need: next.from - completedTrips } : null;
}

/**
 * Apply the tier discount. Absorbed by the platform exactly like a promo code,
 * and capped at the platform's own cut so host and driver payouts stay whole —
 * a loyalty programme must never be funded out of someone else's earnings.
 */
export function applyLoyaltyToPrice(price: PriceBreakdown, completedTrips: number): PriceBreakdown {
  const tier = tierFor(completedTrips);
  if (tier.discountBps <= 0) return price;
  const raw = Math.round((price.parking * tier.discountBps) / 10_000);
  const discount = Math.min(raw, price.split.platform);
  if (discount <= 0) return price;
  return {
    ...price,
    total: price.total - discount,
    split: { ...price.split, platform: price.split.platform - discount },
    discount: (price.discount ?? 0) + discount,
  };
}

// -----------------------------------------------------------------------------
// Prepayments
// -----------------------------------------------------------------------------

/** Stripe will not take a charge below this, so something must remain payable. */
export const MIN_CHARGE: Pence = 100;

export interface Prepayment {
  /** Account credit to spend. */
  credit?: Pence;
  giftCard?: Pick<GiftCard, "code" | "balancePence">;
  /** Whole days left on a pass, and how many this stay needs. */
  pass?: { id: string; daysLeft: number; dayValue: Pence };
  daysBooked?: number;
}

export interface PrepaymentPlan {
  fromCredit: Pence;
  fromGiftCard: Pence;
  fromPass: Pence;
  /** Days the pass covers — deducted from the pass, not refunded as money. */
  passDays: number;
  /** What still has to reach the card. */
  charge: Pence;
}

/**
 * Work out what a booking is actually charged after everything already paid
 * for is applied.
 *
 * Order is deliberate: the pass first (it was bought for exactly this and
 * expires), then the gift card (someone else's money, and it may also expire),
 * then account credit (ours, and it never expires). Spending the perishable
 * balances first is what stops a traveller losing them.
 */
export function planPrepayment(total: Pence, p: Prepayment): PrepaymentPlan {
  let remaining = Math.max(0, total);
  const room = () => Math.max(0, remaining - MIN_CHARGE);

  let passDays = 0;
  let fromPass = 0;
  if (p.pass && p.daysBooked && p.pass.daysLeft > 0 && p.pass.dayValue > 0) {
    const usable = Math.min(p.pass.daysLeft, p.daysBooked);
    const value = Math.min(usable * p.pass.dayValue, room());
    // Only whole days come off the pass, so never charge for a part-day.
    passDays = p.pass.dayValue > 0 ? Math.floor(value / p.pass.dayValue) : 0;
    fromPass = passDays * p.pass.dayValue;
    remaining -= fromPass;
  }

  const fromGiftCard = Math.min(p.giftCard?.balancePence ?? 0, room());
  remaining -= fromGiftCard;

  const fromCredit = Math.min(p.credit ?? 0, room());
  remaining -= fromCredit;

  return { fromCredit, fromGiftCard, fromPass, passDays, charge: remaining };
}

// -----------------------------------------------------------------------------
// Gift cards
// -----------------------------------------------------------------------------

/** No O/I/0/1 — these are read off a screen and typed by hand. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function giftCardCode(seed: string): string {
  // FNV-1a, same approach as the referral codes, so a given seed is stable.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 12; i += 1) {
    out += CODE_ALPHABET[h % CODE_ALPHABET.length];
    h = Math.imul(h ^ (i + 1), 0x01000193) >>> 0;
    if (i === 3 || i === 7) out += "-";
  }
  return out;
}

export const GIFT_CARD_AMOUNTS: Pence[] = [2500, 5000, 10000, 20000];

export function isRedeemable(card: Pick<GiftCard, "balancePence"> | null | undefined): boolean {
  return !!card && card.balancePence > 0;
}

// -----------------------------------------------------------------------------
// Trip pass
// -----------------------------------------------------------------------------

export interface PassOffer {
  days: number;
  /** What a day is worth when spent. */
  dayValue: Pence;
  price: Pence;
  savingBps: number;
}

/**
 * Days bought up front for someone who parks regularly. Priced off the
 * destination's own cheapest daily rate rather than a fixed figure, so a pass
 * is never worth more than the parking it buys.
 */
export function passOffers(cheapestDayRate: Pence): PassOffer[] {
  const mk = (days: number, savingBps: number): PassOffer => {
    const dayValue = cheapestDayRate;
    const full = dayValue * days;
    return {
      days,
      dayValue,
      price: Math.round(full * (1 - savingBps / 10_000)),
      savingBps,
    };
  };
  return [mk(5, 500), mk(10, 1000), mk(20, 1500)];
}

export function passDaysLeft(pass: Pick<TripPass, "daysTotal" | "daysUsed">): number {
  return Math.max(0, pass.daysTotal - pass.daysUsed);
}

export function passExpired(pass: Pick<TripPass, "expiresAt">, now = new Date()): boolean {
  return new Date(pass.expiresAt).getTime() < now.getTime();
}
