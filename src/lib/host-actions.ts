"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createSpace, getHostByUserId } from "@/lib/data/store";

/** Host: create a new listing (enters admin verification as pending_review). */
export async function createSpaceAction(formData: FormData) {
  const user = await requireRole("host");
  const host = getHostByUserId(user.id);
  if (!host) throw new Error("No host profile");

  const evEnabled = formData.get("ev") === "1";
  const kw = Number(formData.get("evKw") || 7);
  const pricePerDay = Math.round(Number(formData.get("pricePerDay") || 10) * 100);

  createSpace({
    hostId: host.id,
    title: String(formData.get("title") || "Untitled space"),
    airportSlug: String(formData.get("airportSlug") || "heathrow"),
    approxArea: String(formData.get("approxArea") || ""),
    exactAddress: String(formData.get("exactAddress") || ""),
    pricePerDay,
    maxVehicleSize: (String(formData.get("maxVehicleSize") || "large") as
      | "small"
      | "medium"
      | "large"
      | "van"),
    cctv: formData.get("cctv") === "1",
    liveCamera: formData.get("liveCamera") === "1",
    evCharger: evEnabled
      ? { connector: "Type 2", kw, pricePerKwh: 38 }
      : null,
    accessRules: String(formData.get("accessRules") || ""),
    lengthM: Number(formData.get("lengthM") || 5),
    widthM: Number(formData.get("widthM") || 2.5),
  });

  revalidatePath("/host");
  revalidatePath("/admin");
  redirect("/host?listed=1");
}
