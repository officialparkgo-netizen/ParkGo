"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Locale, SupportMessage } from "@/types";
import { getCurrentUser, requireRole, requireOpsAdmin } from "@/lib/auth";
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

/**
 * Attach an English rendering to each thing the visitor said, so the agent
 * console can show both. Bot lines are already English and are left alone.
 *
 * One call per message rather than one for the joined text: the provider needs
 * to see each message whole, and joining them would hand the agent one wall of
 * prose with no idea which line was which.
 */
async function translateForTeam(
  transcript: { role: "bot" | "user"; text: string }[],
  locale: Locale
): Promise<SupportMessage[]> {
  const { isTranslationConfigured, translateForReader } = await import("@/lib/translate");
  if (!isTranslationConfigured()) return transcript;

  // Per message, not per ticket: an English-set account writing Arabic — or
  // Spanish, which no script gives away — still reaches the agent in English.
  return Promise.all(
    transcript.map(async (m) => {
      if (m.role !== "user") return m;
      try {
        const out = await translateForReader(m.text, "en", locale);
        if (!out) return m;
        const source = out.source ?? (locale !== "en" ? locale : undefined);
        return {
          ...m,
          translated: out.text.slice(0, 4000),
          ...(source ? { sourceLocale: source } : {}),
        };
      } catch {
        return m;
      }
    })
  );
}

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
  // Which language to answer in. What they actually typed beats everything —
  // an account set to English can still write Arabic — and the saved locale
  // only decides when the script is inconclusive (Latin text).
  const locale = detectLocale(said, me?.locale ?? "en");
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
        // Writers ("content" scope) never work the desk — no support pushes.
        const team = (await listAdminUsers()).filter((u) => u.adminScope !== "content");
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
    /**
     * Translate what the visitor said before the ticket is created.
     *
     * This transcript is the conversation they had with the bot, so it holds
     * the actual question — the single most important thing for the agent to
     * understand, and the one message that never passes through
     * `appendSupportThreadMessage`. Best-effort: a provider outage must not
     * stop a customer reaching support.
     */
    const translatedTranscript = await translateForTeam(transcript, locale);

    const ticket = await createSupportTicket({
      name,
      email: email.slice(0, 200),
      topic: String(input.topic || "other").slice(0, 40),
      transcript: translatedTranscript,
      userId: me?.id,
      priority,
      locale,
      assignedTo,
      ...(phone ? { phone } : {}),
      ...(callbackAt ? { callbackAt } : {}),
      ...(phone ? { tags: ["callback"] } : {}),
    });

    // A bell for the whole desk (agents + full admins, never writers). On
    // /notifications this kind links straight to the queue — the webhook and
    // email above only reach whoever watches those.
    try {
      const { listAdminUsers } = await import("@/lib/data/users");
      const { notifyUsers } = await import("@/lib/data/notifications");
      const team = (await listAdminUsers()).filter((u) => u.adminScope !== "content");
      await notifyUsers(team.map((u) => u.id), {
        title: `${priority === "urgent" ? "🚨 Urgent" : "🎧 New"} support ticket · ${supportRef(ticket.id)}`,
        body: `${ticket.name || email} · ${ticket.topic}${phone ? ` · callback ${phone}` : ""}`,
        kind: "support",
      });
    } catch {
      // the queue itself is the source of truth; a lost bell is cosmetic
    }

    // Forward to the team inbox — best-effort, the ticket is already stored.
    if (isEmailConfigured()) {
      // The team inbox is where most tickets are first read, so the English
      // goes here too — with the original underneath, never instead of it.
      const lines = translatedTranscript
        .map((m) => {
          const who = m.role === "bot" ? "Assistant" : "Visitor";
          const original = `<p style="margin:4px 0;"><strong>${who}:</strong> ${escapeHtml(m.text)}</p>`;
          if (!m.translated) return original;
          return (
            `<p style="margin:4px 0;"><strong>${who}:</strong> ${escapeHtml(m.translated)}` +
            `<br><span style="color:#878D96;font-size:12px">${escapeHtml(m.text)}</span></p>`
          );
        })
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
  const admin = await requireOpsAdmin();
  const id = String(formData.get("ticketId") || "");
  if (id) {
    await setSupportTicketResolved(id);
    const { recordAdminAction } = await import("@/lib/data/admin-actions");
    await recordAdminAction(admin, "support.resolved", "user", id);

    // Tell the visitor, in the thread, in THEIR language — the widget's
    // banner only exists while the tab is open; this line survives in the
    // transcript for whoever opens it tomorrow.
    try {
      const { getSupportTicketById, appendSupportThreadMessage } = await import(
        "@/lib/data/support"
      );
      const { translator } = await import("@/lib/i18n");
      const ticket = await getSupportTicketById(id);
      const { t: say } = translator(ticket?.locale ?? "en");
      await appendSupportThreadMessage(id, "bot", say("support.resolvedLine"));
    } catch {
      // the widget banner still announces it
    }
  }
  revalidatePath("/admin");
  revalidatePath("/admin/support");
}
