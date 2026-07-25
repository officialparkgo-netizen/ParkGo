/**
 * Parsing helpers for inbound support email.
 *
 * Kept apart from the webhook route so they can be tested without dragging in
 * the database layer — and because the awkward part of accepting email is the
 * parsing, not the plumbing.
 */

/** Pull "SP-1A2B3C" out of a subject line. */
export function refFromSubject(subject: string): string | null {
  return subject.match(/\bSP-[A-Z0-9]{4,10}\b/i)?.[0]?.toUpperCase() ?? null;
}

/**
 * Strip the quoted history most mail clients bolt onto a reply. Everything
 * from the first attribution line down is the old conversation, which is
 * already in the thread — appending it again would double the transcript on
 * every round trip.
 */
export function stripQuotedReply(body: string): string {
  const cut = body.search(
    /^\s*(>|On .+ wrote:|-----Original Message-----|Am .+ schrieb|________________)/m
  );
  const head = cut === -1 ? body : body.slice(0, cut);
  return head.replace(/\s+$/, "").slice(0, 2000);
}

/** "Ada Lovelace <ada@x.com>" → "ada@x.com" */
export function addressOf(from: string): string {
  return (from.match(/<([^>]+)>/)?.[1] ?? from).trim().toLowerCase();
}

/** The public reference for a ticket id, mirroring supportRef(). */
export function refOf(ticketId: string): string {
  return `SP-${ticketId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`;
}

/** Last resort when a sender's mail client gave us HTML and no plain part. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    // Tags either side of a line break leave stray padding on every line.
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A message the webhook can act on, whatever provider shape it arrived in. */
export interface InboundMessage {
  from: string;
  subject: string;
  /** Empty when the provider only sent metadata and the body must be fetched. */
  text: string;
  /** Resend only: the id to call the receiving API with. */
  emailId?: string;
}

/**
 * Normalise a webhook body.
 *
 * Two shapes are accepted. Resend wraps everything in `{type, data}` and only
 * sends metadata on `email.received` — the body has to be fetched afterwards,
 * so `text` comes back empty and `emailId` is set. Any other provider (or our
 * own tests) can post `{from, subject, text}` directly.
 *
 * Returns null for anything we should acknowledge and ignore — Resend fires
 * this same endpoint for delivery events we have no use for, and answering
 * with an error would just make it retry them forever.
 */
export function normaliseInbound(payload: unknown): InboundMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;

  if (typeof p.type === "string") {
    if (p.type !== "email.received") return null;
    const d = (p.data ?? {}) as Record<string, unknown>;
    const from = addressOf(String(d.from ?? ""));
    if (!from) return null;
    return {
      from,
      subject: String(d.subject ?? ""),
      text: typeof d.text === "string" ? d.text : "",
      emailId: typeof d.email_id === "string" ? d.email_id : undefined,
    };
  }

  const from = addressOf(String(p.from ?? ""));
  if (!from) return null;
  const text =
    typeof p.text === "string" && p.text
      ? p.text
      : typeof p.html === "string"
        ? htmlToText(p.html)
        : "";
  return { from, subject: String(p.subject ?? ""), text };
}
