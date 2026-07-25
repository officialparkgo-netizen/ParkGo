import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  appendSupportThreadMessage,
  getSupportTicketById,
  listSupportTickets,
} from "@/lib/data/support";
import { addressOf, refFromSubject, refOf, stripQuotedReply } from "@/lib/support-inbound";

export const dynamic = "force-dynamic";

/**
 * Inbound email → support thread.
 *
 * We email the visitor whenever an agent replies. Until now, hitting Reply in
 * their mail client sent the answer into a void. This endpoint takes the
 * forwarded message from the mail provider (Resend inbound, or any webhook
 * that can POST the same shape) and appends it to the right conversation, so
 * a customer can carry on the chat entirely by email.
 *
 * Disabled until SUPPORT_INBOUND_SECRET is set — an unauthenticated endpoint
 * that writes into customer conversations is not something to leave open.
 */
function authorised(request: NextRequest): boolean {
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

export async function POST(request: NextRequest) {
  if (!authorised(request)) {
    return Response.json({ error: "not enabled" }, { status: 404 });
  }

  let payload: { from?: unknown; subject?: unknown; text?: unknown; html?: unknown } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "bad payload" }, { status: 400 });
  }

  const from = addressOf(String(payload.from ?? ""));
  const subject = String(payload.subject ?? "");
  const raw = String(payload.text ?? "");
  const body = stripQuotedReply(raw);
  if (!from || !body) return Response.json({ error: "empty" }, { status: 400 });

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
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      const { IS_LIVE } = await import("@/lib/config");
      if (IS_LIVE) {
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
    await sendOpsAlert(`📧 Email reply on ${ref ?? target.id} from ${from}`);
  } catch {
    // best-effort
  }

  const fresh = await getSupportTicketById(target.id);
  return Response.json({ ok: true, ticketId: target.id, status: fresh?.status ?? "open" });
}
