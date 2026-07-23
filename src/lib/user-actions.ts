"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@/types";
import { getCurrentUser, requireRole, requireUser, rolePath } from "@/lib/auth";
import {
  getUserProfile,
  setUserOnboarded,
  setUserRoleAdmin,
  setUserSuspendedAdmin,
  setUserTwofa,
  updateOwnProfile,
} from "@/lib/data/users";
import { createSupportTicket } from "@/lib/data/support";
import { uploadAvatar } from "@/lib/storage";

/** Shared profile-form parsing (account page + first-run welcome). */
function readProfileForm(formData: FormData, user: User) {
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const phone = String(formData.get("phone") || "").trim().slice(0, 30);

  let vehicle: User["vehicle"] | null | undefined;
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
  return { name, phone, vehicle };
}

async function readAvatar(formData: FormData, userId: string): Promise<string | undefined> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return undefined;
  return (await uploadAvatar(file, userId)) ?? undefined;
}

/** Self-service: edit own name, phone, photo and (travellers) vehicle. */
export async function updateOwnProfileAction(formData: FormData) {
  const user = await requireUser();
  const { name, phone, vehicle } = readProfileForm(formData, user);
  if (name.length < 2) redirect("/account?profile=invalid");
  const avatarUrl = await readAvatar(formData, user.id);

  await updateOwnProfile(user.id, { name, phone: phone || undefined, vehicle, avatarUrl });
  revalidatePath("/account");
  redirect("/account?profile=saved");
}

/** First-run onboarding: save the profile, then unlock the portal. */
export async function completeOnboardingAction(formData: FormData) {
  // getCurrentUser, not requireUser — the guard would bounce back to /welcome.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { name, phone, vehicle } = readProfileForm(formData, user);
  if (name.length < 2) redirect("/welcome?invalid=1");
  const avatarUrl = await readAvatar(formData, user.id);

  await updateOwnProfile(user.id, { name, phone: phone || undefined, vehicle, avatarUrl });
  await setUserOnboarded(user.id);
  revalidatePath("/account");
  redirect(rolePath(user.role));
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

/** Admin/host self-service: toggle their own email-code second factor. */
export async function setOwnTwofaAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "host") return;
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
