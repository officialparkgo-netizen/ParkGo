import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Staff invite links: a signed, single-use, expiring token that lets an
 * invited teammate set their own password.
 *
 * The signature covers a per-invite nonce stored on the user row, so the link
 * dies the moment the password is set (the nonce is cleared) or a new invite
 * is sent (the nonce is rotated). The "teaminvite" prefix keeps it separate
 * from the impersonation / iCal / support tokens that share the same secret.
 */

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // a week to click it

function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

function sig(userId: string, exp: number, nonce: string): string {
  return createHmac("sha256", secret())
    .update(`teaminvite.${userId}.${exp}.${nonce}`)
    .digest("hex")
    .slice(0, 32);
}

/** Fresh nonce to store on the user row alongside a new invite. */
export function newInviteNonce(): string {
  return randomBytes(16).toString("hex");
}

export function makeInviteToken(userId: string, nonce: string, now = Date.now()): string {
  const exp = now + INVITE_TTL_MS;
  return `${userId}.${exp}.${sig(userId, exp, nonce)}`;
}

/** The user id a token claims to be for — unverified, just for the lookup. */
export function peekInviteUserId(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  return parts[0] || null;
}

export type InviteFailure = "malformed" | "expired" | "invalid";

/**
 * Verify a token against the nonce currently stored for that user. Returns the
 * user id on success; a reason otherwise (so the page can say "expired" vs
 * "already used" without leaking anything useful to an attacker).
 */
export function verifyInviteToken(
  token: string | undefined | null,
  storedNonce: string | undefined | null,
  now = Date.now()
): { ok: true; userId: string } | { ok: false; reason: InviteFailure } {
  if (!token) return { ok: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [userId, expRaw, mac] = parts;
  const exp = Number(expRaw);
  if (!userId || !Number.isFinite(exp)) return { ok: false, reason: "malformed" };
  if (exp < now) return { ok: false, reason: "expired" };
  // No stored nonce = the invite was already used or revoked.
  if (!storedNonce) return { ok: false, reason: "invalid" };

  const expected = sig(userId, exp, storedNonce);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, userId };
}

/**
 * Who an invite link may belong to. Anything else (a traveller, a plain host,
 * a suspended account) can never be the target of a set-password link.
 */
export function inviteeKind(
  user: Pick<
    { role: string; suspended?: boolean; cohostHostId?: string },
    "role" | "suspended" | "cohostHostId"
  > | null
): "staff" | "cohost" | null {
  if (!user || user.suspended) return null;
  if (user.role === "admin") return "staff";
  if (user.role === "host" && user.cohostHostId) return "cohost";
  return null;
}

/** Where each kind of teammate belongs once signed in. */
export function inviteeHome(kind: "staff" | "cohost", adminScope?: string): string {
  if (kind === "cohost") return "/host/today";
  return adminScope === "support" ? "/admin/support" : "/admin";
}

/** Minimum length we accept for a staff password. */
export const MIN_PASSWORD_LENGTH = 8;

export function passwordProblem(password: string, confirm: string): "short" | "mismatch" | null {
  if (password.length < MIN_PASSWORD_LENGTH) return "short";
  if (password !== confirm) return "mismatch";
  return null;
}
