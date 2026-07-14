"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Space, VerificationDocument } from "@/types";
import { requireRole } from "@/lib/auth";
import {
  createSpaceForHost,
  ensureHostForUser,
  getSpaceById,
  setHostPayoutAccount,
  updateHostBio,
  updateSpaceForHost,
} from "@/lib/data/hosts";
import { submitHostVerification } from "@/lib/data/verifications";
import { uploadKycDoc, uploadSpacePhoto } from "@/lib/storage";
import { isStripeConfigured, createHostOnboardingLink } from "@/lib/stripe";

function parseSpaceForm(formData: FormData) {
  const evEnabled = formData.get("ev") === "1";
  const kw = Number(formData.get("evKw") || 7);
  return {
    title: String(formData.get("title") || "Untitled space"),
    approxArea: String(formData.get("approxArea") || ""),
    exactAddress: String(formData.get("exactAddress") || ""),
    pricePerDay: Math.round(Number(formData.get("pricePerDay") || 10) * 100),
    maxVehicleSize: String(formData.get("maxVehicleSize") || "large") as Space["maxVehicleSize"],
    cctv: formData.get("cctv") === "1",
    liveCamera: formData.get("liveCamera") === "1",
    evCharger: evEnabled ? { connector: "Type 2" as const, kw, pricePerKwh: 38 } : null,
    accessRules: String(formData.get("accessRules") || ""),
    lengthM: Number(formData.get("lengthM") || 5),
    widthM: Number(formData.get("widthM") || 2.5),
  };
}

async function uploadPhotos(formData: FormData, key: string): Promise<string[]> {
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files.slice(0, 6)) {
    const url = await uploadSpacePhoto(file, key);
    if (url) urls.push(url);
  }
  return urls;
}

/** Host: create a new listing (requires approved KYC; enters review as pending_review). */
export async function createSpaceAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);

  // KYC gate: only verified hosts can list.
  if (host.verificationStatus !== "approved") redirect("/host/verify");

  const fields = parseSpaceForm(formData);
  const photos = await uploadPhotos(formData, host.id);

  await createSpaceForHost(
    {
      hostId: host.id,
      airportSlug: String(formData.get("airportSlug") || "heathrow"),
      ...fields,
    },
    photos
  );

  // Host profile (Airbnb-style intro) captured during onboarding.
  const bio = String(formData.get("bio") || "").trim();
  if (bio) await updateHostBio(host.id, bio);

  revalidatePath("/host");
  revalidatePath("/admin");
  redirect("/host?listed=1");
}

/** Host: edit an existing listing (own listings only; rejected -> resubmitted). */
export async function updateSpaceAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const spaceId = String(formData.get("spaceId") || "");

  const existing = await getSpaceById(spaceId);
  if (!existing || existing.hostId !== host.id) redirect("/host");

  const fields = parseSpaceForm(formData);
  const newPhotos = await uploadPhotos(formData, host.id);

  await updateSpaceForHost(spaceId, host.id, { ...fields, newPhotos });

  revalidatePath("/host");
  revalidatePath("/admin");
  revalidatePath(`/app/space/${spaceId}`);
  redirect("/host?updated=1");
}

/** Host: submit KYC (identity + address) for admin review. */
export async function submitKycAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  if (host.verificationStatus === "approved") redirect("/host");

  const legalName = String(formData.get("legalName") || "").trim();
  const address = String(formData.get("address") || "").trim();

  const documents: VerificationDocument[] = [];
  const now = new Date().toISOString();

  const idFile = formData.get("idDoc");
  if (idFile instanceof File && idFile.size > 0) {
    const ref = await uploadKycDoc(idFile, host.id);
    if (ref) {
      documents.push({
        id: crypto.randomUUID(),
        type: "id",
        label: `Photo ID — ${legalName || user.name}`,
        fileRef: ref,
        uploadedAt: now,
      });
    }
  }
  const addressFile = formData.get("addressDoc");
  if (addressFile instanceof File && addressFile.size > 0) {
    const ref = await uploadKycDoc(addressFile, host.id);
    if (ref) {
      documents.push({
        id: crypto.randomUUID(),
        type: "address",
        label: "Proof of address",
        fileRef: ref,
        uploadedAt: now,
      });
    }
  }

  await submitHostVerification(
    host.id,
    documents,
    [legalName && `Legal name: ${legalName}`, address && `Address: ${address}`]
      .filter(Boolean)
      .join(" · ") || undefined
  );

  revalidatePath("/host");
  revalidatePath("/admin");
  redirect("/host?verify=submitted");
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
