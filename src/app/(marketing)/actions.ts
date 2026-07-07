"use server";

import { z } from "zod";
import type { Role } from "@/types";
import { addWaitlistEntry } from "@/lib/data/waitlist";
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

export async function sendContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  if (!z.string().email().safeParse(email).success) {
    return { error: t("err.email") };
  }
  if (message.trim().length < 5) {
    return { error: t("err.message") };
  }
  // Mock mode: would dispatch via the notifications/email provider in live mode.
  return { ok: true };
}
