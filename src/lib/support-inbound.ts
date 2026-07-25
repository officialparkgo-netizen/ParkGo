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
