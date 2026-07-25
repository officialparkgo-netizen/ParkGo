import { createHmac, timingSafeEqual } from "crypto";

/**
 * Svix webhook signature verification.
 *
 * Resend (and a good many other providers) sign webhooks with Svix rather than
 * letting you set a custom header, so this is the only way to know a POST to
 * our inbound endpoint really came from them. Implemented directly against the
 * documented scheme instead of pulling in the SDK — it is one HMAC.
 *
 * The signed content is `id.timestamp.rawBody`, so the caller must hand over
 * the *raw* body: re-serialising parsed JSON changes a byte somewhere and the
 * signature stops matching.
 */

/** Reject anything older than this, so a captured POST can't be replayed. */
const TOLERANCE_SECONDS = 5 * 60;

export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

/**
 * Pull the three headers, accepting the white-labelled `webhook-` prefix that
 * Svix uses on higher plans as well as the default `svix-` one.
 */
export function svixHeaders(headers: Headers): SvixHeaders {
  const pick = (name: string) =>
    headers.get(`svix-${name}`) ?? headers.get(`webhook-${name}`);
  return { id: pick("id"), timestamp: pick("timestamp"), signature: pick("signature") };
}

export function verifySvixSignature(
  rawBody: string,
  headers: SvixHeaders,
  secret: string,
  now: number = Date.now()
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return false;
  if (Math.abs(now / 1000 - sentAt) > TOLERANCE_SECONDS) return false;

  // Secrets are handed out as `whsec_<base64>`; the bytes after the prefix are
  // the HMAC key.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (key.length === 0) return false;

  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  // The header is a space-delimited list of `v1,<signature>` — during a secret
  // rotation more than one is valid, and any match is enough.
  return signature.split(" ").some((entry) => {
    const [version, candidate] = entry.split(",");
    if (version !== "v1" || !candidate) return false;
    const a = Buffer.from(candidate);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
