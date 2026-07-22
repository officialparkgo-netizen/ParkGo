"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  getUserProfile,
  setUserRoleAdmin,
  setUserSuspendedAdmin,
} from "@/lib/data/users";

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
