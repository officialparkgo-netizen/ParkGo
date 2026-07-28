"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CareService, Space, VerificationDocument } from "@/types";
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

/** Hidden JSON field kept by the custom-prices editor: {"YYYY-MM-DD": pence}. */
function parseCustomPrices(formData: FormData): Record<string, number> {
  const raw = formData.get("customPrices");
  if (typeof raw !== "string" || !raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>).slice(0, 60)) {
      const pence = Math.round(Number(v));
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(pence) && pence > 0 && pence <= 500_000) {
        out[k] = pence;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function parseSpaceForm(formData: FormData) {
  const evEnabled = formData.get("ev") === "1";
  const kw = Number(formData.get("evKw") || 7);
  return {
    title: String(formData.get("title") || "Untitled space"),
    approxArea: String(formData.get("approxArea") || ""),
    exactAddress: String(formData.get("exactAddress") || ""),
    pricePerDay: Math.round(Number(formData.get("pricePerDay") || 10) * 100),
    // Optional hourly rate — empty means the space is daily-only.
    pricePerHour:
      Number(formData.get("pricePerHour")) > 0
        ? Math.round(Number(formData.get("pricePerHour")) * 100)
        : null,
    capacity: Math.max(1, Math.min(50, Math.round(Number(formData.get("capacity") || 1)))),
    maxVehicleSize: String(formData.get("maxVehicleSize") || "large") as Space["maxVehicleSize"],
    cctv: formData.get("cctv") === "1",
    liveCamera: formData.get("liveCamera") === "1",
    covered: formData.get("covered") === "1",
    evCharger: evEnabled ? { connector: "Type 2" as const, kw, pricePerKwh: 38 } : null,
    accessRules: String(formData.get("accessRules") || ""),
    weekendUpliftPct: Math.max(
      0,
      Math.min(100, Math.round(Number(formData.get("weekendUpliftPct") || 0)))
    ),
    customPrices: parseCustomPrices(formData),
    bayNames: String(formData.get("bayNames") || "")
      .split(",")
      .map((s) => s.trim().slice(0, 20))
      .filter(Boolean)
      .slice(0, 20),
    requestToBook: formData.get("requestToBook") === "1",
    careServices: parseCareServices(formData),
    lengthM: Number(formData.get("lengthM") || 5),
    widthM: Number(formData.get("widthM") || 2.5),
  };
}

/**
 * Car care the host offers, one "Label | price" line each. A free-text list
 * rather than a fixed menu — what a host with a jet wash can offer is not the
 * same as what a host with a garage and a compressor can.
 */
function parseCareServices(formData: FormData): CareService[] {
  return String(formData.get("careServices") || "")
    .split("\n")
    .map((line) => {
      const [rawLabel, rawPrice] = line.split("|");
      const label = (rawLabel ?? "").trim().slice(0, 60);
      const pounds = Number((rawPrice ?? "").replace(/[^0-9.]/g, ""));
      if (!label || !Number.isFinite(pounds) || pounds <= 0) return null;
      return {
        // Stable from the label, so editing the price of an existing service
        // does not orphan it on bookings that already reference the id.
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32),
        label,
        pricePence: Math.round(pounds * 100),
      };
    })
    .filter((c): c is CareService => !!c && !!c.id)
    .slice(0, 8);
}

/** Blocked days from the edit form (JSON array of "YYYY-MM-DD", capped). */
function parseBlockedDates(formData: FormData): string[] | undefined {
  const raw = formData.get("blockedDates");
  if (typeof raw !== "string") return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter(
      (d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
    ))].sort().slice(0, 120);
  } catch {
    return undefined;
  }
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
  const removePhotos = formData.getAll("removePhotos").map(String).filter(Boolean);
  const blockedDates = parseBlockedDates(formData);

  await updateSpaceForHost(spaceId, host.id, { ...fields, newPhotos, removePhotos, blockedDates });

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

  // Give the team a nudge — verification queues shouldn't rely on polling.
  try {
    const { sendOpsAlert } = await import("@/lib/ops-alerts");
    await sendOpsAlert(`📄 New host verification from ${host.displayName}`);
    const { notifyAdminsByEmail } = await import("@/lib/admin-suite-actions");
    await notifyAdminsByEmail(
      `New host verification · ${host.displayName}`,
      `<p><strong>${legalName || user.name}</strong> submitted ${documents.length} document(s) for review.</p>
       <p>Open the queue: <a href="https://www.parkgo.ai/admin/verification">parkgo.ai/admin/verification</a></p>`
    );
  } catch {
    // alert is best-effort
  }

  revalidatePath("/host");
  revalidatePath("/admin");
  revalidatePath("/admin/verification");
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
  const ok = await updateHostBio(host.id, String(formData.get("bio") || "").trim());
  revalidatePath("/host");
  revalidatePath("/account");
  redirect(`/account?hostbio=${ok ? "saved" : "error"}`);
}
