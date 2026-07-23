"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth";
import {
  getUserProfile,
  setUserRoleAdmin,
  setUserSuspendedAdmin,
  setUserTwofa,
  updateOwnProfile,
} from "@/lib/data/users";
import { createSupportTicket } from "@/lib/data/support";

/** Self-service: edit own name, phone and (travellers) vehicle details. */
export async function updateOwnProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const phone = String(formData.get("phone") || "").trim().slice(0, 30);
  if (name.length < 2) redirect("/account?profile=invalid");

  let vehicle: typeof user.vehicle | null | undefined;
  if (user.role === "traveller") {
    const reg = String(formData.get("vehicleReg") || "").trim().toUpperCase().slice(0, 12);
    const make = String(formData.get("vehicleMake") || "").trim().slice(0, 40);
    const model = String(formData.get("vehicleModel") || "").trim().slice(0, 40);
    const colour = String(formData.get("vehicleColour") || "").trim().slice(0, 30);
    vehicle =
      reg || make || model || colour
        ? {
            reg,
            make,
            model,
            colour,
            // Size/EV aren't asked on the form — keep any existing values.
            size: user.vehicle?.size ?? "medium",
            ev: user.vehicle?.ev ?? false,
          }
        : null;
  }

  await updateOwnProfile(user.id, { name, phone: phone || undefined, vehicle });
  revalidatePath("/account");
  redirect("/account?profile=saved");
}

/** GDPR self-service: file a data-export or deletion request as a ticket. */
export async function requestPrivacyAction(formData: FormData) {
  const user = await requireUser();
  const kind = String(formData.get("kind")) === "delete" ? "delete" : "export";
  await createSupportTicket({
    name: user.name,
    email: user.email,
    topic: "privacy",
    transcript: [
      {
        role: "user",
        text:
          kind === "delete"
            ? "GDPR request: please delete my account and personal data."
            : "GDPR request: please send me a copy of my personal data.",
      },
    ],
  });
  redirect("/account?privacy=1");
}

/** Admin self-service: toggle their own email-code second factor. */
export async function setOwnTwofaAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "admin") return;
  const state = String(formData.get("state") || "");
  if (state !== "on" && state !== "off") return;

  await setUserTwofa(user.id, state === "on");
  if (state === "on") {
    // The session that just enabled it is already authenticated — grant it a
    // 2FA session so the toggle doesn't bounce straight into the code screen.
    // Every future sign-in requires the code.
    const { grantAdmin2faSession } = await import("@/lib/admin-2fa");
    await grantAdmin2faSession(user.id);
  }
  revalidatePath("/account");
  redirect(`/account?twofa=${state}`);
}

/** Admin: switch a member between the traveller and host portals. */
export async function setUserRoleAction(formData: FormData) {
  const admin = await requireRole("admin");
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");
  if (!userId || userId === admin.id) return;
  if (role !== "traveller" && role !== "host") return;

  const target = await getUserProfile(userId);
  if (!target || target.role === "admin") return;

  await setUserRoleAdmin(userId, role);
  revalidatePath("/admin");
}

/** Admin: suspend or restore an account. Admin accounts can't be suspended. */
export async function setUserSuspendedAction(formData: FormData) {
  const admin = await requireRole("admin");
  const userId = String(formData.get("userId") || "");
  const state = String(formData.get("state") || "");
  if (!userId || userId === admin.id) return;
  if (state !== "suspend" && state !== "restore") return;

  const target = await getUserProfile(userId);
  if (!target || target.role === "admin") return;

  await setUserSuspendedAdmin(userId, state === "suspend");
  revalidatePath("/admin");
}
