"use server";

import { z } from "zod";
import type { Role } from "@/types";
import { addWaitlist } from "@/lib/data/store";

export interface WaitlistState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["traveller", "host"]).default("traveller"),
  airport: z.string().optional(),
});

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "traveller",
    airport: formData.get("airport") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  addWaitlist({
    email: parsed.data.email,
    role: parsed.data.role as Role,
    airport: parsed.data.airport || undefined,
  });
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
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  if (!z.string().email().safeParse(email).success) {
    return { error: "Please enter a valid email address." };
  }
  if (message.trim().length < 5) {
    return { error: "Please add a short message." };
  }
  // Mock mode: would dispatch via the notifications/email provider in live mode.
  return { ok: true };
}
