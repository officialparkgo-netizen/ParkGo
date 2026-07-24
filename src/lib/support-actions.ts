"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { SupportMessage } from "@/types";
import { requireRole } from "@/lib/auth";
import { createSupportTicket, setSupportTicketResolved } from "@/lib/data/support";
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
}

/** Escalate a chat to a human agent: store the ticket + email the team. */
export async function submitSupportTicket(input: {
  name?: string;
  email: string;
  topic?: string;
  transcript: SupportMessage[];
}): Promise<SupportSubmitResult> {
  const email = String(input.email || "").trim();
  if (!email.includes("@")) return { ok: false };

  const transcript = (Array.isArray(input.transcript) ? input.transcript : [])
    .slice(-30)
    .map((m) => ({
      role: m.role === "bot" ? ("bot" as const) : ("user" as const),
      text: String(m.text || "").slice(0, 2000),
    }));

  try {
    const { sendOpsAlert } = await import("@/lib/ops-alerts");
    await sendOpsAlert(`🎧 New support ticket from ${String(input.name || email)}`);
    const ticket = await createSupportTicket({
      name: String(input.name || "").trim().slice(0, 120),
      email: email.slice(0, 200),
      topic: String(input.topic || "other").slice(0, 40),
      transcript,
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
