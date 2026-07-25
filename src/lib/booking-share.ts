import { createHmac, timingSafeEqual } from "crypto";

/**
 * Share a booking with whoever is actually dropping the car off.
 *
 * The person who paid is often not the person at the barrier at 5am. Rather
 * than making them forward a screenshot, they hand out a signed link that
 * shows the entry pass and nothing else — no trips list, no payment details,
 * no ability to cancel or message. It expires with the stay.
 */
function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

function sign(bookingId: string, expiresAt: number): string {
  return createHmac("sha256", secret())
    .update(`share.${bookingId}.${expiresAt}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Token for a booking, valid until `expiresAt` (epoch ms). Callers pass the
 * end of the stay plus a day of slack, so a delayed flight doesn't lock the
 * second driver out at the worst moment.
 */
export function makeShareToken(bookingId: string, expiresAt: number): string {
  const exp = Math.floor(expiresAt);
  return `${bookingId}.${exp}.${sign(bookingId, exp)}`;
}

/** Booking id for a valid, unexpired token; null otherwise. */
export function parseShareToken(
  token: string | undefined | null,
  now: number = Date.now()
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [bookingId, expRaw, provided] = parts;
  const exp = Number(expRaw);
  if (!bookingId || !Number.isFinite(exp) || exp <= 0) return null;
  if (now > exp) return null;

  const expected = sign(bookingId, exp);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return bookingId;
}

/** A share stays usable for a day past pick-up. */
export const SHARE_GRACE_MS = 24 * 60 * 60 * 1000;

export function shareExpiryFor(endAt: string): number {
  return new Date(endAt).getTime() + SHARE_GRACE_MS;
}
