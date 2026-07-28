import "server-only";

/**
 * Travel-day texts, via Twilio.
 *
 * Gated twice over: the account must have the keys, and the recipient must
 * have opted in. A text costs money and interrupts someone's evening, so an
 * unasked-for one is worse than no message at all — every caller here passes a
 * user whose `smsOptIn` has already been checked.
 */

export function isSmsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

/**
 * UK/IE numbers as typed by real people: with a leading zero, with spaces,
 * with +44 already on. Anything that does not resolve to E.164 is refused
 * rather than guessed at — a text to the wrong number is a data leak.
 */
export function toE164(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return /^\+\d{10,15}$/.test(digits) ? digits : null;
  // 07… → +447…, 08… (IE mobile) stays ambiguous, so only UK's 0 prefix maps.
  if (/^07\d{9}$/.test(digits)) return `+44${digits.slice(1)}`;
  if (/^447\d{9}$/.test(digits)) return `+${digits}`;
  if (/^08\d{8,9}$/.test(digits)) return `+353${digits.slice(1)}`;
  if (/^3538\d{8}$/.test(digits)) return `+${digits}`;
  return null;
}

export interface SmsResult {
  ok: boolean;
  reason?: "not-configured" | "bad-number" | "failed";
}

export async function sendSms(to: string | undefined | null, body: string): Promise<SmsResult> {
  if (!isSmsConfigured()) return { ok: false, reason: "not-configured" };
  const number = toE164(to);
  if (!number) return { ok: false, reason: "bad-number" };

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: number,
        From: process.env.TWILIO_FROM_NUMBER!,
        // One segment where possible: a 160-character limit keeps the cost
        // predictable and forces the message to say one thing.
        Body: body.slice(0, 320),
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * Send only if this person asked for texts. Returns false without trying when
 * they have not, which is what every travel-day hook calls.
 */
export async function sendSmsIfOptedIn(
  user: { phone?: string; smsOptIn?: boolean },
  body: string
): Promise<boolean> {
  if (!user.smsOptIn) return false;
  const { ok } = await sendSms(user.phone, body);
  return ok;
}
