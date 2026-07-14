"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createSpaceForHost,
  ensureHostForUser,
  setHostPayoutAccount,
  updateHostBio,
} from "@/lib/data/hosts";
import { isStripeConfigured, createHostOnboardingLink } from "@/lib/stripe";

/** Host: create a new listing (enters admin verification as pending_review). */
export async function createSpaceAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);

  const evEnabled = formData.get("ev") === "1";
  const kw = Number(formData.get("evKw") || 7);
  const pricePerDay = Math.round(Number(formData.get("pricePerDay") || 10) * 100);

  await createSpaceForHost({
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

  // Host profile (Airbnb-style intro) captured during onboarding.
  const bio = String(formData.get("bio") || "").trim();
  if (bio) await updateHostBio(host.id, bio);

  revalidatePath("/host");
  revalidatePath("/admin");
  redirect("/host?listed=1");
}

/** Host: start Stripe Connect onboarding to receive payouts. */
export async function connectPayoutsAction() {
  const user = await requireRole("host");
  if (!isStripeConfigured()) redirect("/host?payouts=unavailable");
  const host = await ensureHostForUser(user);
  const { url, accountId } = await createHostOnboardingLink({
    id: host.id,
    displayName: host.displayName,
    payoutAccountRef: host.payoutAccountRef,
  });
  if (accountId !== host.payoutAccountRef) {
    await setHostPayoutAccount(host.id, accountId);
  }
  redirect(url);
}

/** Host: update the public profile shown to guests (bio). */
export async function updateHostProfileAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  await updateHostBio(host.id, String(formData.get("bio") || "").trim());
  revalidatePath("/host");
}
