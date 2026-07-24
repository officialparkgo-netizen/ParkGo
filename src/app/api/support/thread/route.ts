import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  appendSupportThreadMessage,
  getSupportTicketById,
} from "@/lib/data/support";
import { parseSupportToken, supportRef, SUPPORT_COOKIE } from "@/lib/support-thread";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const access = await resolveAccess(request);
  if (!access) return Response.json({ error: "not found" }, { status: 404 });
  const ticket = await getSupportTicketById(access.ticketId);
  if (!ticket) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({
    ticket: {
      id: ticket.id,
      ref: supportRef(ticket.id),
      status: ticket.status,
      assignedTo: ticket.assignedTo ?? null,
      name: ticket.name,
      transcript: ticket.transcript,
    },
  });
}

export async function POST(request: NextRequest) {
  const access = await resolveAccess(request);
  if (!access) return Response.json({ error: "not found" }, { status: 404 });

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    // fall through to the empty guard
  }
  if (!text.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const ok = await appendSupportThreadMessage(access.ticketId, access.role, text);
  if (!ok) return Response.json({ error: "failed" }, { status: 500 });

  if (access.role === "agent") {
    // Log it and nudge the visitor by email, best-effort.
    try {
      const { recordAdminAction } = await import("@/lib/data/admin-actions");
      if (access.user) {
        await recordAdminAction(access.user, "support.replied", "user", access.ticketId);
      }
      const ticket = await getSupportTicketById(access.ticketId);
      const { isEmailConfigured, sendEmail, emailShell } = await import("@/lib/email");
      if (ticket?.email && isEmailConfigured()) {
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
      }
    } catch {
      // best-effort extras only
    }
  }

  const ticket = await getSupportTicketById(access.ticketId);
  return Response.json({
    ticket: ticket && {
      id: ticket.id,
      ref: supportRef(ticket.id),
      status: ticket.status,
      assignedTo: ticket.assignedTo ?? null,
      name: ticket.name,
      transcript: ticket.transcript,
    },
  });
}
