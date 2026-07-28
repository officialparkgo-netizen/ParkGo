import { NextRequest } from "next/server";
import type { SupportMessage, SupportTicket } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import {
  addTicketNote,
  appendSupportThreadMessage,
  getSupportTicketById,
  markTicketRead,
  setTicketCsat,
  setTicketSnooze,
  setTicketTags,
  setTicketTyping,
} from "@/lib/data/support";
import { cleanTags } from "@/lib/support-queue";
import { signTranscript } from "@/lib/storage";
import { parseSupportToken, supportRef, SUPPORT_COOKIE } from "@/lib/support-thread";

export const dynamic = "force-dynamic";

/** A "typing…" stamp older than this is treated as a closed tab, not a typist. */
const TYPING_TTL_MS = 8000;

/**
 * Live support chat. Admins pass ?id= and write as "agent"; visitors are
 * identified by the signed cookie set when their ticket was created and
 * write as "user". Both sides poll GET — no reloads anywhere.
 */
async function resolveAccess(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const user = await getCurrentUser();
    if (user?.role === "admin") return { ticketId: id, role: "agent" as const, user };
    return null;
  }
  const ticketId = parseSupportToken(request.cookies.get(SUPPORT_COOKIE)?.value);
  return ticketId ? { ticketId, role: "user" as const, user: null } : null;
}

/**
 * The thread as one side sees it. "Typing" only ever reports the *other* side
 * — nobody needs telling they are typing — and only while the stamp is fresh.
 * "Seen" is the other side's read receipt.
 */
async function view(ticket: SupportTicket, as: "user" | "agent") {
  const other = as === "user" ? "agent" : "user";
  const typingFresh =
    ticket.typingBy === other &&
    !!ticket.typingAt &&
    Date.now() - +new Date(ticket.typingAt) < TYPING_TTL_MS;
  return {
    id: ticket.id,
    ref: supportRef(ticket.id),
    status: ticket.status,
    priority: ticket.priority ?? "normal",
    assignedTo: ticket.assignedTo ?? null,
    name: ticket.name,
    // Attachment links are short-lived, so they are minted per read.
    // The English rendering of a visitor's own message is for the team; it
    // would only clutter their widget with a worse copy of what they typed.
    transcript: await signTranscript(
      as === "agent"
        ? ticket.transcript
        : ticket.transcript.map(({ translated: _t, sourceLocale: _s, ...m }) => m)
    ),
    typing: typingFresh,
    seenAt: (as === "user" ? ticket.agentReadAt : ticket.userReadAt) ?? null,
    csat: ticket.csat ?? null,
    // Internal notes and tags exist only for the team.
    ...(as === "agent"
      ? {
          notes: ticket.notes ?? [],
          tags: ticket.tags ?? [],
          snoozeUntil: ticket.snoozeUntil ?? null,
        }
      : {}),
  };
}

/**
 * Polling *is* reading — but only write a receipt when there is something new
 * to read, otherwise every open thread would hammer the database once per
 * poll tick just to restate what it already said.
 */
function hasUnread(ticket: SupportTicket, as: "user" | "agent"): boolean {
  const other = as === "user" ? "agent" : "user";
  const last = ticket.transcript[ticket.transcript.length - 1];
  // Nothing to acknowledge unless the other side spoke last.
  if (!last || last.role !== other) return false;
  const readAt = as === "user" ? ticket.userReadAt : ticket.agentReadAt;
  if (!readAt) return true;
  // Pre-attachment messages carry no timestamp; one receipt is enough for them.
  return !!last.at && +new Date(last.at) > +new Date(readAt);
}

export async function GET(request: NextRequest) {
  const access = await resolveAccess(request);
  if (!access) return Response.json({ error: "not found" }, { status: 404 });
  const ticket = await getSupportTicketById(access.ticketId);
  if (!ticket) return Response.json({ error: "not found" }, { status: 404 });
  if (hasUnread(ticket, access.role)) {
    await markTicketRead(access.ticketId, access.role).catch(() => {});
  }
  return Response.json({ ticket: await view(ticket, access.role) });
}

/** Notify the visitor by email that the team has replied (best-effort). */
async function notifyVisitor(ticketId: string, text: string) {
  try {
    const ticket = await getSupportTicketById(ticketId);
    const { isEmailConfigured, sendEmail, emailShell } = await import("@/lib/email");
    if (!ticket?.email || !isEmailConfigured()) return;
    await sendEmail(
      ticket.email,
      `ParkGo support · ${supportRef(ticket.id)}`,
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">New reply from our team</h2>
         <p style="margin:0;white-space:pre-line">${text
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")}</p>
         <p style="margin:12px 0 0;font-size:12px;color:#878F96">Open the chat bubble on parkgo.ai to reply.</p>`
      )
    ).catch(() => {});
  } catch {
    // best-effort only
  }
}

export async function POST(request: NextRequest) {
  const access = await resolveAccess(request);
  if (!access) return Response.json({ error: "not found" }, { status: 404 });

  let text = "";
  let attachment: SupportMessage["attachment"];

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    if (!form) return Response.json({ error: "empty" }, { status: 400 });
    text = String(form.get("text") || "");
    const file = form.get("file");
    if (file instanceof File) {
      const { uploadSupportFile } = await import("@/lib/storage");
      attachment = (await uploadSupportFile(file, access.ticketId)) ?? undefined;
      // A rejected file (wrong type, too big) must not post as a bare message.
      if (!attachment) return Response.json({ error: "file" }, { status: 400 });
    }
  } else {
    let body: {
      text?: unknown;
      typing?: unknown;
      read?: unknown;
      csat?: unknown;
      csatComment?: unknown;
      note?: unknown;
      tags?: unknown;
      snoozeUntil?: unknown;
    } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      // fall through to the empty guard
    }

    // Presence and receipts are pings, not messages — answer and stop.
    if (body.typing === true) {
      await setTicketTyping(access.ticketId, access.role);
      return Response.json({ ok: true });
    }
    if (body.read === true) {
      await markTicketRead(access.ticketId, access.role);
      return Response.json({ ok: true });
    }
    if (body.csat === 1 || body.csat === -1) {
      // Only the visitor rates the service; agents can't grade themselves.
      if (access.role !== "user") return Response.json({ error: "forbidden" }, { status: 403 });
      await setTicketCsat(
        access.ticketId,
        body.csat,
        typeof body.csatComment === "string" ? body.csatComment : undefined
      );
      const ticket = await getSupportTicketById(access.ticketId);
      return Response.json({ ticket: ticket && (await view(ticket, access.role)) });
    }

    // Notes, tags and snooze are team-side controls, never visitor input.
    if (access.role === "agent") {
      if (typeof body.note === "string" && body.note.trim()) {
        await addTicketNote(access.ticketId, access.user?.name ?? "Team", body.note);
        const ticket = await getSupportTicketById(access.ticketId);
        return Response.json({ ticket: ticket && (await view(ticket, "agent")) });
      }
      if (Array.isArray(body.tags)) {
        await setTicketTags(access.ticketId, cleanTags(body.tags.map(String)));
        const ticket = await getSupportTicketById(access.ticketId);
        return Response.json({ ticket: ticket && (await view(ticket, "agent")) });
      }
      if (body.snoozeUntil !== undefined) {
        const until =
          typeof body.snoozeUntil === "string" && !Number.isNaN(Date.parse(body.snoozeUntil))
            ? body.snoozeUntil
            : null;
        await setTicketSnooze(access.ticketId, until);
        const ticket = await getSupportTicketById(access.ticketId);
        return Response.json({ ticket: ticket && (await view(ticket, "agent")) });
      }
    }

    text = typeof body.text === "string" ? body.text : "";
  }

  if (!text.trim() && !attachment) return Response.json({ error: "empty" }, { status: 400 });

  const ok = await appendSupportThreadMessage(
    access.ticketId,
    access.role,
    text,
    attachment
  );
  if (!ok) return Response.json({ error: "failed" }, { status: 500 });

  if (access.role === "agent") {
    try {
      const { recordAdminAction } = await import("@/lib/data/admin-actions");
      if (access.user) {
        await recordAdminAction(access.user, "support.replied", "user", access.ticketId);
      }
    } catch {
      // best-effort extras only
    }
    await notifyVisitor(access.ticketId, text || "📎 Attachment");
  }

  const ticket = await getSupportTicketById(access.ticketId);
  return Response.json({ ticket: ticket && (await view(ticket, access.role)) });
}
