"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VehicleProfile } from "@/types";
import { requireUser } from "@/lib/auth";
import {
  createSpaceAlert,
  deleteSpaceAlert,
  toggleSavedSpace,
} from "@/lib/data/saved";
import { setUserBusiness, setUserVehicles } from "@/lib/data/users";

const SIZES: VehicleProfile["size"][] = ["small", "medium", "large", "van"];

/** Keep or un-keep a space. Returns nothing — the page re-renders the heart. */
export async function toggleSavedSpaceAction(formData: FormData) {
  const user = await requireUser();
  const spaceId = String(formData.get("spaceId") || "");
  if (!spaceId) return;
  await toggleSavedSpace(user.id, spaceId);
  revalidatePath("/app/saved");
  revalidatePath(`/app/space/${spaceId}`);
  revalidatePath("/app/search");
}

/**
 * Save the household's cars. Rows arrive as parallel arrays from the form;
 * a row with no registration is an empty slot and is dropped.
 */
export async function saveVehiclesAction(formData: FormData) {
  const user = await requireUser();
  const regs = formData.getAll("vehicleReg").map(String);
  const makes = formData.getAll("vehicleMake").map(String);
  const models = formData.getAll("vehicleModel").map(String);
  const colours = formData.getAll("vehicleColour").map(String);
  const sizes = formData.getAll("vehicleSize").map(String);
  const evs = formData.getAll("vehicleEv").map(String);

  const vehicles: VehicleProfile[] = regs
    .map((reg, i) => ({
      reg: reg.trim().toUpperCase().slice(0, 12),
      make: (makes[i] ?? "").trim().slice(0, 40),
      model: (models[i] ?? "").trim().slice(0, 40),
      colour: (colours[i] ?? "").trim().slice(0, 24),
      size: (SIZES.includes(sizes[i] as VehicleProfile["size"])
        ? sizes[i]
        : "medium") as VehicleProfile["size"],
      // Checkboxes only post when ticked, so the index-aligned read is on the
      // hidden companion field rather than the box itself.
      ev: evs[i] === "1",
    }))
    .filter((v) => v.reg);

  await setUserVehicles(user.id, vehicles);
  revalidatePath("/account");
  redirect("/account?saved=vehicles");
}

/** Company details for expensing a trip. Blank company clears the lot. */
export async function saveBusinessAction(formData: FormData) {
  const user = await requireUser();
  const company = String(formData.get("company") || "").trim().slice(0, 120);
  if (!company) {
    await setUserBusiness(user.id, null);
  } else {
    await setUserBusiness(user.id, {
      company,
      vatNumber: String(formData.get("vatNumber") || "").trim().slice(0, 40) || undefined,
      costCentre: String(formData.get("costCentre") || "").trim().slice(0, 60) || undefined,
    });
  }
  revalidatePath("/account");
  redirect("/account?saved=business");
}

/** Watch a space (or a whole airport under a price) and be told when it frees up. */
export async function createAlertAction(formData: FormData) {
  const user = await requireUser();
  const spaceId = String(formData.get("spaceId") || "") || undefined;
  const airportSlug = String(formData.get("airportSlug") || "") || undefined;
  const from = String(formData.get("from") || "");
  const to = String(formData.get("to") || "");
  const maxPricePounds = Number(formData.get("maxPrice"));

  const alert = await createSpaceAlert({
    userId: user.id,
    spaceId,
    airportSlug: spaceId ? undefined : airportSlug,
    startAt: /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00Z`).toISOString() : undefined,
    endAt: /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59Z`).toISOString() : undefined,
    maxPricePence:
      Number.isFinite(maxPricePounds) && maxPricePounds > 0
        ? Math.round(maxPricePounds * 100)
        : undefined,
  });

  revalidatePath("/app/saved");
  if (spaceId) redirect(`/app/space/${spaceId}?watch=${alert ? "on" : "error"}`);
  redirect(`/app/saved?watch=${alert ? "on" : "error"}`);
}

export async function deleteAlertAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("alertId") || "");
  if (id) await deleteSpaceAlert(id, user.id);
  revalidatePath("/app/saved");
}
