"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addMemberByEmail,
  createOrganisation,
  getOrganisation,
  removeMember,
  updateOrganisation,
} from "@/lib/data/organisations";

/**
 * Company accounts. Everything here checks ownership against the stored
 * organisation rather than a hidden form field — a member who edits the
 * billing email is a member who redirects the invoices.
 */

export interface CompanyState {
  ok?: boolean;
  error?: string;
}

export async function createCompanyAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const user = await requireRole("traveller");
  if (user.organisationId) return { error: "You are already on a company account." };

  const org = await createOrganisation({
    ownerId: user.id,
    name: String(formData.get("name") || ""),
    billingEmail: String(formData.get("billingEmail") || ""),
    vatNumber: String(formData.get("vatNumber") || "") || undefined,
    monthlyInvoice: formData.get("monthlyInvoice") === "1",
  });
  if (!org) return { error: "Check the company name and billing email." };
  revalidatePath("/app/company");
  return { ok: true };
}

export async function updateCompanyAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const user = await requireRole("traveller");
  if (!user.organisationId) return { error: "No company account." };

  const org = await updateOrganisation(user.organisationId, user.id, {
    name: String(formData.get("name") || ""),
    billingEmail: String(formData.get("billingEmail") || ""),
    vatNumber: String(formData.get("vatNumber") || ""),
    monthlyInvoice: formData.get("monthlyInvoice") === "1",
  });
  if (!org) return { error: "Only the account owner can change these." };
  revalidatePath("/app/company");
  return { ok: true };
}

export async function addCompanyMemberAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const user = await requireRole("traveller");
  if (!user.organisationId) return { error: "No company account." };

  const result = await addMemberByEmail(
    user.organisationId,
    user.id,
    String(formData.get("email") || "")
  );
  if (result.ok) {
    revalidatePath("/app/company");
    return { ok: true };
  }
  // Distinguished so the message can be acted on: "no account" needs them to
  // sign up, "elsewhere" needs the other company to release them.
  return {
    error:
      result.reason === "no-account"
        ? "no-account"
        : result.reason === "already-elsewhere"
          ? "already-elsewhere"
          : "Only the account owner can add people.",
  };
}

export async function removeCompanyMemberAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const user = await requireRole("traveller");
  if (!user.organisationId) return { error: "No company account." };
  const ok = await removeMember(
    user.organisationId,
    user.id,
    String(formData.get("userId") || "")
  );
  revalidatePath("/app/company");
  return ok ? { ok: true } : { error: "That person cannot be removed." };
}

/** Read-only helper for the page: the org plus whether the viewer owns it. */
export async function companyContext(userId: string, organisationId?: string) {
  if (!organisationId) return null;
  const org = await getOrganisation(organisationId);
  return org ? { org, isOwner: org.ownerId === userId } : null;
}
