import type { Pence } from "@/types";

/**
 * Referral credit.
 *
 * Both sides earn: the new traveller gets money off their first stay, the
 * referrer gets theirs only once that stay is actually paid for — otherwise a
 * ring of throwaway signups mints credit out of nothing.
 *
 * Credit is a platform marketing cost. It comes off what the traveller pays
 * and never off the host's payout, so a discounted booking earns the host
 * exactly what an undiscounted one would.
 */
export const REFERRAL_FRIEND_CREDIT: Pence = 500;
export const REFERRAL_REFERRER_CREDIT: Pence = 500;

/** Ambiguous characters are left out — these codes get read aloud and retyped. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * A stable, human-legible code for a user. Derived from their id so the same
 * account always shows the same code, with a salt so it can't be reversed
 * into the id.
 */
export function referralCodeFor(userId: string, salt = "parkgo"): string {
  let hash = 0x811c9dc5;
  const source = `${salt}:${userId}`;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let out = "";
  let n = hash;
  for (let i = 0; i < 6; i += 1) {
    out += CODE_ALPHABET[n % CODE_ALPHABET.length];
    n = Math.floor(n / CODE_ALPHABET.length) + i * 7;
  }
  return `PG${out}`;
}

/** Accept whatever the user pasted: spacing, case and stray punctuation. */
export function normaliseReferralCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

/**
 * How much credit to spend on this booking. Never more than is held, and
 * never more than the bill — credit is a discount, not a cash withdrawal.
 * A small floor keeps the payment above what the card networks will accept.
 */
export const MIN_CHARGE: Pence = 100;

export function creditToApply(available: Pence, total: Pence): Pence {
  const held = Math.max(0, Math.floor(available));
  if (held <= 0 || total <= MIN_CHARGE) return 0;
  return Math.min(held, total - MIN_CHARGE);
}

/** A referral only counts when it is somebody else's code and unused. */
export function canClaimReferral(
  code: string,
  referrer: { id: string } | null,
  claimant: { id: string; referredBy?: string }
): boolean {
  if (!normaliseReferralCode(code)) return false;
  if (!referrer) return false;
  if (referrer.id === claimant.id) return false;
  return !claimant.referredBy;
}
