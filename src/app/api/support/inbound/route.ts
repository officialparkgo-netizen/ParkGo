import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  appendSupportThreadMessage,
  getSupportTicketById,
  listSupportTickets,
} from "@/lib/data/support";
import {
  htmlToText,
  normaliseInbound,
  refFromSubject,
  refOf,
  stripQuotedReply,
} from "@/lib/support-inbound";
import { svixHeaders, verifySvixSignature } from "@/lib/svix";

export const dynamic = "force-dynamic";

/**
 * Inbound email → support thread.
 *
 * We email the visitor whenever an agent replies. Without this, hitting Reply
 * in their mail client sends the answer into a void. The mail provider forwards
 * the message here and it lands in the right conversation, so a customer can
 * carry on the chat entirely by email.
 *
 * Two ways in, both closed by default:
 *
 * - **Resend** signs with Svix and cannot send a custom header, so set
 *   RESEND_WEBHOOK_SECRET (the `whsec_…` from the webhook's page). Its
 *   `email.received` event carries metadata only, so the body is fetched from
 *   the receiving API afterwards.
 * - **Anything else** can post `{from, subject, text}` with the shared secret
 *   in `X-ParkGo-Secret` (SUPPORT_INBOUND_SECRET).
 *
 * With neither secret configured the endpoint 404s and accepts nothing.
 */
function sharedSecretOk(request: NextRequest): boolean {
  const expected = process.env.SUPPORT_INBOUND_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get("x-parkgo-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorised(request: NextRequest, rawBody: string): boolean {
  const svix = svixHeaders(request.headers);
  const resendSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (svix.signature && resendSecret) {
    return verifySvixSignature(rawBody, svix, resendSecret);
  }
  return sharedSecretOk(request);
}

/**
 * Resend's `email.received` gives us metadata only, so the actual message has
 * to be collected separately. Returns an empty string on any failure — the
 * caller then has nothing to append, which is the honest outcome.
 */
async function fetchResendBody(emailId: string): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch(
      `https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`,
      { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return "";
    const json = (await res.json()) as Record<string, unknown>;
    // Some endpoints wrap the row in `data`, others return it flat.
    const row = ((json.data as Record<string, unknown>) ?? json) || {};
    if (typeof row.text === "string" && row.text.trim()) return row.text;
    if (typeof row.html === "string") return htmlToText(row.html);
    return "";
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  // Read the body as text: Svix signs the exact bytes, and re-serialising
  // parsed JSON would break the signature.
  const rawBody = await request.text();
  if (!authorised(request, rawBody)) {
    return Response.json({ error: "not enabled" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "bad payload" }, { status: 400 });
  }

  const message = normaliseInbound(payload);
  // Delivery events and anything else we don't handle: acknowledge so the
  // provider stops retrying, but do nothing.
  if (!message) return Response.json({ ok: true, ignored: true });

  const { from, subject, emailId } = message;
  const raw = message.text || (emailId ? await fetchResendBody(emailId) : "");
  const body = stripQuotedReply(raw);
  if (!body) return Response.json({ ok: true, ignored: "empty" });

  // Prefer the reference in the subject; fall back to this sender's most
  // recent open chat, which is what a fresh email from them means.
  const tickets = await listSupportTickets().catch(() => []);
  const ref = refFromSubject(subject);
  const byRef = ref ? tickets.find((t) => refOf(t.id) === ref) : undefined;
  const target =
    byRef ??
    tickets.find((t) => t.status === "open" && t.email.toLowerCase() === from) ??
    tickets.find((t) => t.email.toLowerCase() === from);

  if (!target) return Response.json({ error: "no thread" }, { status: 202 });

  // Only the person the ticket belongs to may write into it by email —
  // otherwise a spoofed subject line would let anyone post as the customer.
  if (target.email.toLowerCase() !== from) {
    return Response.json({ error: "sender mismatch" }, { status: 202 });
  }

  const ok = await appendSupportThreadMessage(target.id, "user", body);
  if (!ok) return Response.json({ error: "failed" }, { status: 500 });

  // A reply by email means the customer is not finished — bring a resolved
  // conversation back into the queue rather than letting it sit closed.
  if (target.status === "resolved") {
    const { setTicketSnooze } = await import("@/lib/data/support");
    await setTicketSnooze(target.id, null).catch(() => {});
    try {
      const { IS_LIVE } = await import("@/lib/config");
      if (IS_LIVE) {
        const { supabaseAdmin } = await import("@/lib/supabase/server");
        await supabaseAdmin()
          .from("support_tickets")
          .update({ status: "open" })
          .eq("id", target.id);
      } else {
        const { patchSupportTicket } = await import("@/lib/data/store");
        patchSupportTicket(target.id, { status: "open" });
      }
    } catch {
      // the message landed; the status flip is a nicety
    }
  }

  try {
    const { sendOpsAlert } = await import("@/lib/ops-alerts");
    await sendOpsAlert(`📧 Email reply on ${ref ?? refOf(target.id)} from ${from}`);
  } catch {
    // best-effort
  }

  const fresh = await getSupportTicketById(target.id);
  return Response.json({ ok: true, ticketId: target.id, status: fresh?.status ?? "open" });
}
