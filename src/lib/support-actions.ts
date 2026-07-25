"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { SupportMessage } from "@/types";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { createSupportTicket, setSupportTicketResolved } from "@/lib/data/support";
import { deskState, detectPriority, formatWait } from "@/lib/support-hours";
import { detectLocale } from "@/lib/support-lang";
import { tooManyRecent } from "@/lib/support-queue";
import { getPlatformSettings } from "@/lib/data/settings";
import { countRecentTicketsByEmail } from "@/lib/data/support";
import { isEmailConfigured, sendEmail, emailShell } from "@/lib/email";
import {
  makeSupportToken,
  SUPPORT_COOKIE,
  SUPPORT_COOKIE_MAX_AGE,
  supportRef,
} from "@/lib/support-thread";
import { COMPANY } from "@/lib/seo";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export interface SupportSubmitResult {
  ok: boolean;
  /** Short reference shown to the user (e.g. "SP-1A2B3C"). */
  ref?: string;
  /** Set when the spam brake refused this one. */
  rateLimited?: boolean;
}

/** Escalate a chat to a human agent: store the ticket + email the team. */
export async function submitSupportTicket(input: {
  name?: string;
  email?: string;
  topic?: string;
  transcript: SupportMessage[];
  /** Callback request: a number to ring instead of typing. */
  phone?: string;
  callbackAt?: string;
}): Promise<SupportSubmitResult> {
  // A signed-in customer never has to retype who they are, and the ticket is
  // tied to their account so the agent can see the booking behind the question.
  // Their session — not the posted form — is the source of truth for identity.
  const me = await getCurrentUser().catch(() => null);
  const email = String((me?.email || input.email) ?? "").trim();
  if (!email.includes("@")) return { ok: false };
  const name = String((me?.name || input.name) ?? "").trim().slice(0, 120);

  const transcript = (Array.isArray(input.transcript) ? input.transcript : [])
    .slice(-30)
    .map((m) => ({
      role: m.role === "bot" ? ("bot" as const) : ("user" as const),
      text: String(m.text || "").slice(0, 2000),
    }));

  const said = transcript.filter((m) => m.role === "user").map((m) => m.text).join(" ");
  // "My car is stuck behind the gate" jumps the queue ahead of "how do I get
  // a VAT receipt" — read from what the visitor actually typed.
  const priority = detectPriority(said);
  // Which language to answer in. A signed-in user's saved locale beats a guess.
  const locale = me?.locale ?? detectLocale(said);
  const phone = String(input.phone || "").replace(/[^\d+ ]/g, "").trim().slice(0, 24);
  const callbackAt =
    input.callbackAt && !Number.isNaN(Date.parse(input.callbackAt))
      ? new Date(input.callbackAt).toISOString()
      : undefined;

  try {
    const settings = await getPlatformSettings().catch(() => null);

    // Spam brake. A frustrated second chat is normal; forty in an hour is a
    // script. Counted per sender, and a failure to count never blocks anyone.
    const recent = await countRecentTicketsByEmail(email).catch(() => 0);
    if (tooManyRecent(recent, settings?.supportMaxPerHour ?? 6)) {
      return { ok: false, rateLimited: true };
    }

    // Hand it straight to whoever is on duty and least busy, so nothing lands
    // in an unowned pile. Falls back to nobody when the whole team is off.
    let assignedTo: string | undefined;
    if (settings?.supportAutoAssign !== false) {
      try {
        const { listAdminUsers } = await import("@/lib/data/users");
        const { listSupportTickets } = await import("@/lib/data/support");
        const { pickAssignee } = await import("@/lib/support-assign");
        const [team, queue] = await Promise.all([listAdminUsers(), listSupportTickets()]);
        assignedTo = pickAssignee(team, queue)?.name;
      } catch {
        // unassigned is a valid state — the queue still shows it
      }
    }

    const { sendOpsAlert } = await import("@/lib/ops-alerts");
    await sendOpsAlert(
      `${priority === "urgent" ? "🚨 URGENT" : "🎧 New"} support ticket from ${name || email}` +
        (phone ? ` · callback ${phone}` : "")
    );

    // Urgent chats and callback requests reach phones, not just open tabs.
    if (priority === "urgent" || phone) {
      try {
        const { listAdminUsers } = await import("@/lib/data/users");
        const { pushToUsers } = await import("@/lib/push");
        const team = await listAdminUsers();
        await pushToUsers(team.map((u) => u.id), {
          title: phone ? "Callback requested" : "Urgent support chat",
          body: `${name || email}${phone ? ` · ${phone}` : ""}`,
          url: "/admin/support?show=urgent",
          urgent: true,
        });
      } catch {
        // push is an extra channel, never the only one
      }
    }
    const ticket = await createSupportTicket({
      name,
      email: email.slice(0, 200),
      topic: String(input.topic || "other").slice(0, 40),
      transcript,
      userId: me?.id,
      priority,
      locale,
      assignedTo,
      ...(phone ? { phone } : {}),
      ...(callbackAt ? { callbackAt } : {}),
      ...(phone ? { tags: ["callback"] } : {}),
    });

    // Forward to the team inbox — best-effort, the ticket is already stored.
    if (isEmailConfigured()) {
      const lines = transcript
        .map(
          (m) =>
            `<p style="margin:4px 0;"><strong>${m.role === "bot" ? "Assistant" : "Visitor"}:</strong> ${escapeHtml(m.text)}</p>`
        )
        .join("");
      await sendEmail(
        COMPANY.infoEmail,
        `Support chat · ${ticket.topic} · ${ticket.name || email}`,
        emailShell(
          `<h2 style="margin:0 0 12px">New support ticket</h2>
           <p><strong>From:</strong> ${escapeHtml(ticket.name || "—")} &lt;${escapeHtml(email)}&gt;</p>
           <p><strong>Topic:</strong> ${escapeHtml(ticket.topic)} · <strong>Ref:</strong> ${escapeHtml(ticket.id)}</p>
           <hr style="border:none;border-top:1px solid #ECEDEF;margin:12px 0;" />
           ${lines}`
        ),
        { replyTo: email }
      ).catch(() => {});
    }

    // The confirmation lives in the stored transcript so widget and server
    // never diverge — the live poll treats the server as the single truth.
    try {
      const { getI18n } = await import("@/lib/i18n");
      const { t } = await getI18n();
      const { appendSupportThreadMessage } = await import("@/lib/data/support");
      await appendSupportThreadMessage(
        ticket.id,
        "bot",
        `${t("support.sent")} ${supportRef(ticket.id)}. ${t("support.sentNote")}`
      );

      // Out of hours, say so in the thread itself. The header banner is easy
      // to miss, and a written "we're back at 08:00" is what stops someone
      // sitting there watching a chat nobody is going to answer tonight.
      const desk = settings ? deskState(settings) : null;
      if (desk && !desk.open) {
        await appendSupportThreadMessage(
          ticket.id,
          "bot",
          t("support.desk.closedReply").replace("{wait}", formatWait(desk.opensInMinutes))
        );
      }
      if (phone) {
        await appendSupportThreadMessage(
          ticket.id,
          "bot",
          t("support.callback.queued").replace("{phone}", phone)
        );
      }
    } catch {
      // cosmetic only
    }

    // Signed cookie → the visitor's live thread keeps working, account or not.
    try {
      const store = await cookies();
      store.set(SUPPORT_COOKIE, makeSupportToken(ticket.id), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SUPPORT_COOKIE_MAX_AGE,
      });
    } catch {
      // widget still shows the ref; live chat just won't resume next visit
    }

    return { ok: true, ref: supportRef(ticket.id) };
  } catch {
    return { ok: false };
  }
}

/** Admin: mark a ticket handled. */
export async function resolveSupportTicketAction(formData: FormData) {
  const admin = await requireRole("admin");
  const id = String(formData.get("ticketId") || "");
  if (id) {
    await setSupportTicketResolved(id);
    const { recordAdminAction } = await import("@/lib/data/admin-actions");
    await recordAdminAction(admin, "support.resolved", "user", id);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/support");
}
