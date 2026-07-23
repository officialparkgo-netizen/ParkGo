import { createHmac } from "crypto";

/**
 * Stateless admin 2FA: 6-digit codes derived from an HMAC over the user id
 * and a 5-minute time window (current + previous window accepted), plus a
 * signed session value for the post-verification cookie. No storage needed,
 * so it works across serverless instances. Pure functions — unit-tested.
 */

export const ADMIN_2FA_WINDOW_MS = 5 * 60 * 1000;
export const ADMIN_2FA_SESSION_MS = 8 * 60 * 60 * 1000;

export function admin2faSecret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-2fa-secret"
  );
}

function hmac(payload: string, secret = admin2faSecret()): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function codeForWindow(userId: string, window: number, secret?: string): string {
  const digest = hmac(`code:${userId}:${window}`, secret);
  return String(parseInt(digest.slice(0, 8), 16) % 1_000_000).padStart(6, "0");
}

export function currentAdminCode(userId: string, now = Date.now(), secret?: string): string {
  return codeForWindow(userId, Math.floor(now / ADMIN_2FA_WINDOW_MS), secret);
}

export function verifyAdminCode(
  userId: string,
  code: string,
  now = Date.now(),
  secret?: string
): boolean {
  const w = Math.floor(now / ADMIN_2FA_WINDOW_MS);
  const c = code.trim();
  if (!/^\d{6}$/.test(c)) return false;
  return c === codeForWindow(userId, w, secret) || c === codeForWindow(userId, w - 1, secret);
}

export function makeAdmin2faSession(userId: string, now = Date.now(), secret?: string): string {
  const exp = now + ADMIN_2FA_SESSION_MS;
  return `${userId}.${exp}.${hmac(`sess:${userId}:${exp}`, secret)}`;
}

export function isValidAdmin2faSession(
  value: string | undefined,
  userId: string,
  now = Date.now(),
  secret?: string
): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [uid, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= now || uid !== userId) return false;
  return sig === hmac(`sess:${uid}:${exp}`, secret);
}
