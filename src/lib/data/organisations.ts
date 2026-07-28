import type { Booking, Organisation, User } from "@/types";
import { IS_LIVE } from "@/lib/config";

/**
 * Company accounts: one organisation, an owner who is billed, and members who
 * book against it.
 *
 * Membership is stored on the user rather than in a join table because a
 * person can only book for one company at a time — someone who contracts for
 * two keeps two accounts, which is also what their finance teams want.
 */

const g = globalThis as unknown as {
  __parkgoOrganisations?: Organisation[];
};
const orgsMock = (g.__parkgoOrganisations ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Organisation {
  return {
    id: r.id,
    name: r.name,
    vatNumber: r.vat_number ?? undefined,
    billingEmail: r.billing_email,
    ownerId: r.owner_id,
    monthlyInvoice: r.monthly_invoice ?? false,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function createOrganisation(input: {
  ownerId: string;
  name: string;
  billingEmail: string;
  vatNumber?: string;
  monthlyInvoice?: boolean;
}): Promise<Organisation | null> {
  const name = input.name.trim().slice(0, 120);
  const billingEmail = input.billingEmail.trim().toLowerCase();
  if (!name || !billingEmail.includes("@")) return null;
  const vatNumber = input.vatNumber?.trim().toUpperCase().replace(/\s+/g, "") || undefined;

  if (!IS_LIVE) {
    const org: Organisation = {
      id: `org_${orgsMock.length + 1}`,
      name,
      vatNumber,
      billingEmail,
      ownerId: input.ownerId,
      monthlyInvoice: input.monthlyInvoice ?? false,
      createdAt: new Date().toISOString(),
    };
    orgsMock.push(org);
    await setMembership(input.ownerId, org.id, "owner");
    return org;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("organisations")
      .insert({
        name,
        vat_number: vatNumber ?? null,
        billing_email: billingEmail,
        owner_id: input.ownerId,
        monthly_invoice: input.monthlyInvoice ?? false,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    const org = fromRow(data);
    await setMembership(input.ownerId, org.id, "owner");
    return org;
  } catch {
    return null;
  }
}

export async function getOrganisation(id: string): Promise<Organisation | null> {
  if (!IS_LIVE) return orgsMock.find((o) => o.id === id) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("organisations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

export async function updateOrganisation(
  id: string,
  ownerId: string,
  patch: Partial<Pick<Organisation, "name" | "vatNumber" | "billingEmail" | "monthlyInvoice">>
): Promise<Organisation | null> {
  const org = await getOrganisation(id);
  // Only the owner changes the billing details — a member could otherwise
  // redirect the company's invoices to themselves.
  if (!org || org.ownerId !== ownerId) return null;

  const next: Organisation = {
    ...org,
    name: patch.name?.trim().slice(0, 120) || org.name,
    vatNumber:
      patch.vatNumber === undefined
        ? org.vatNumber
        : patch.vatNumber.trim().toUpperCase().replace(/\s+/g, "") || undefined,
    billingEmail: patch.billingEmail?.trim().toLowerCase() || org.billingEmail,
    monthlyInvoice: patch.monthlyInvoice ?? org.monthlyInvoice,
  };
  if (!next.billingEmail.includes("@")) return null;

  if (!IS_LIVE) {
    const i = orgsMock.findIndex((o) => o.id === id);
    if (i >= 0) orgsMock[i] = next;
    return next;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("organisations")
      .update({
        name: next.name,
        vat_number: next.vatNumber ?? null,
        billing_email: next.billingEmail,
        monthly_invoice: next.monthlyInvoice ?? false,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

/** Put someone on a company account, or take them off it with `null`. */
export async function setMembership(
  userId: string,
  organisationId: string | null,
  role: "owner" | "member" = "member"
): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.organisationId = organisationId ?? undefined;
    u.organisationRole = organisationId ? role : undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({
        organisation_id: organisationId,
        organisation_role: organisationId ? role : null,
      })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Invite by email: only an existing account can be added, silently otherwise. */
export async function addMemberByEmail(
  organisationId: string,
  ownerId: string,
  email: string
): Promise<{ ok: boolean; reason?: "not-owner" | "no-account" | "already-elsewhere" }> {
  const org = await getOrganisation(organisationId);
  if (!org || org.ownerId !== ownerId) return { ok: false, reason: "not-owner" };

  const target = await findUserByEmail(email.trim().toLowerCase());
  if (!target) return { ok: false, reason: "no-account" };
  // Belonging to two companies would make it ambiguous who gets the invoice.
  if (target.organisationId && target.organisationId !== organisationId) {
    return { ok: false, reason: "already-elsewhere" };
  }
  const ok = await setMembership(target.id, organisationId, "member");
  return { ok };
}

export async function removeMember(
  organisationId: string,
  ownerId: string,
  userId: string
): Promise<boolean> {
  const org = await getOrganisation(organisationId);
  if (!org || org.ownerId !== ownerId) return false;
  // The owner is the billing contact; removing them would orphan the account.
  if (userId === ownerId) return false;
  return setMembership(userId, null);
}

export async function listMembers(organisationId: string): Promise<User[]> {
  if (!IS_LIVE) {
    const { getAllUsers } = await import("@/lib/data/store");
    return getAllUsers().filter((u) => u.organisationId === organisationId);
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { userFromRow } = await import("@/lib/data/users");
    const { data } = await supabaseAdmin()
      .from("users")
      .select("*")
      .eq("organisation_id", organisationId)
      .limit(200);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return (data ?? []).map((r: any) => userFromRow(r));
  } catch {
    return [];
  }
}

/** The organisation this person books on, if any. */
export async function organisationForUser(user: Pick<User, "organisationId">): Promise<Organisation | null> {
  return user.organisationId ? getOrganisation(user.organisationId) : null;
}

/** Everything billed to the company in a month, for the invoice run. */
export async function listOrganisationBookings(
  organisationId: string,
  opts?: { from?: Date; to?: Date }
): Promise<Booking[]> {
  const { listAllBookings } = await import("@/lib/data/bookings");
  const all = await listAllBookings();
  const from = opts?.from?.getTime() ?? 0;
  const to = opts?.to?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return all
    .filter((b) => b.organisationId === organisationId)
    .filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= from && t <= to;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function findUserByEmail(email: string): Promise<User | null> {
  if (!IS_LIVE) {
    const { getUserByEmail } = await import("@/lib/data/store");
    return getUserByEmail(email) ?? null;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { userFromRow } = await import("@/lib/data/users");
    const { data } = await supabaseAdmin()
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return data ? userFromRow(data as any) : null;
  } catch {
    return null;
  }
}
