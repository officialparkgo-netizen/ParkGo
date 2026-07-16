"use server";

import { z } from "zod";
import type { Role } from "@/types";
import { addWaitlistEntry } from "@/lib/data/waitlist";
import { emailShell, isEmailConfigured, sendEmail } from "@/lib/email";
import { COMPANY } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export interface WaitlistState {
  ok?: boolean;
  error?: string;
}

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") || "");
  const roleRaw = String(formData.get("role") || "traveller");
  const role = (["traveller", "host"].includes(roleRaw) ? roleRaw : "traveller") as Role;
  const airport = String(formData.get("airport") || "") || undefined;

  if (!z.string().email().safeParse(email).success) {
    return { error: t("err.email") };
  }
  try {
    await addWaitlistEntry({ email, role, airport });
  } catch {
    return { error: t("err.message") };
  }
  return { ok: true };
}

export interface ContactState {
  ok?: boolean;
  error?: string;
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function sendContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const { t } = await getI18n();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  if (!z.string().email().safeParse(email).success) {
    return { error: t("err.email") };
  }
  if (message.trim().length < 5) {
    return { error: t("err.message") };
  }

  // Deliver to the team inbox (Resend). Reply-to is the sender, so answering
  // in the mail client goes straight back to them. No-op when email isn't
  // configured (mock/dev), where the success state alone is fine.
  if (isEmailConfigured()) {
    const html = emailShell(
      `<h2 style="margin:0 0 12px">New contact message</h2>
       <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name || "—")} &lt;${escapeHtml(email)}&gt;</p>
       <p style="white-space:pre-wrap;margin:16px 0 0">${escapeHtml(message.trim())}</p>`
    );
    const sent = await sendEmail(
      COMPANY.infoEmail,
      `Contact form · ${name || email}`,
      html,
      { replyTo: email }
    );
    if (!sent) return { error: t("err.message") };
  }
  return { ok: true };
}
