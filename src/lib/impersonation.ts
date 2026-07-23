/**
 * Support impersonation ("sign in as user").
 *
 * The admin keeps their real session; a short-lived signed cookie names the
 * user they are viewing as. getCurrentUser() swaps the returned user only when
 * the REAL session belongs to an admin, so the cookie is inert for everyone
 * else. Works identically in mock and live mode because the real auth session
 * is never touched.
 */
import { createHmac } from "crypto";

export const IMPERSONATE_COOKIE = "parkgo_impersonate";
export const IMPERSONATE_MS = 2 * 60 * 60 * 1000; // 2h

function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

function sig(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 24);
}

export function makeImpersonationToken(targetId: string, now = Date.now()): string {
  const exp = now + IMPERSONATE_MS;
  return `${targetId}.${exp}.${sig(`${targetId}.${exp}`)}`;
}

/** Returns the target user id for a valid, unexpired token; null otherwise. */
export function parseImpersonationToken(
  token: string | undefined | null,
  now = Date.now()
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, expRaw, mac] = parts;
  const exp = Number(expRaw);
  if (!id || !Number.isFinite(exp) || exp < now) return null;
  if (sig(`${id}.${exp}`) !== mac) return null;
  return id;
}
