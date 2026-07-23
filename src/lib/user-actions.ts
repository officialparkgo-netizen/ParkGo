"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth";
import {
  getUserProfile,
  setUserRoleAdmin,
  setUserSuspendedAdmin,
  setUserTwofa,
} from "@/lib/data/users";

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
