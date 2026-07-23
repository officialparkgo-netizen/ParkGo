import type { Claim, ClaimStatus, Role } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { addNotification } from "@/lib/data/store";

const g = globalThis as unknown as { __parkgoClaims?: Claim[] };
const mockClaims: Claim[] = (g.__parkgoClaims ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Claim {
  return {
    id: r.id,
    bookingId: r.booking_id,
    bookingRef: r.booking_ref ?? r.booking_id,
    openedBy: r.opened_by,
    openedByRole: (r.role ?? "traveller") as Role,
    description: r.description,
    status: (r.status ?? "open") as ClaimStatus,
    resolution: r.resolution ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fileClaim(input: {
  bookingId: string;
  bookingRef: string;
  openedBy: string;
  openedByRole: Role;
  description: string;
}): Promise<Claim | null> {
  const description = input.description.trim().slice(0, 2000);
  if (!description) return null;
  if (!IS_LIVE) {
    const claim: Claim = {
      id: `clm_${mockClaims.length + 1}`,
      bookingId: input.bookingId,
      bookingRef: input.bookingRef,
      openedBy: input.openedBy,
      openedByRole: input.openedByRole,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    mockClaims.unshift(claim);
    return claim;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("claims")
      .insert({
        booking_id: input.bookingId,
        booking_ref: input.bookingRef,
        opened_by: input.openedBy,
        role: input.openedByRole,
        description,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    return fromRow(data);
  } catch {
    return null;
  }
}

export async function listAllClaims(): Promise<Claim[]> {
  if (!IS_LIVE) return [...mockClaims];
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

export async function listClaimsForBooking(bookingId: string): Promise<Claim[]> {
  if (!IS_LIVE) return mockClaims.filter((c) => c.bookingId === bookingId);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("claims")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

/** Admin decision; notifies the claimant with the resolution note. */
export async function setClaimStatus(
  id: string,
  status: ClaimStatus,
  resolution?: string
): Promise<Claim | null> {
  const note = resolution?.trim().slice(0, 1000) || undefined;
  let claim: Claim | null = null;

  if (!IS_LIVE) {
    const c = mockClaims.find((x) => x.id === id);
    if (!c) return null;
    c.status = status;
    if (note) c.resolution = note;
    c.updatedAt = new Date().toISOString();
    claim = c;
    addNotification({
      userId: c.openedBy,
      title: `Claim ${c.bookingRef} ${status.replace("_", " ")}`,
      body: note ?? `Your claim is now ${status.replace("_", " ")}.`,
      kind: "system",
    });
    return claim;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("claims")
      .update({
        status,
        ...(note ? { resolution: note } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (!data) return null;
    claim = fromRow(data);
    await admin.from("notifications").insert({
      user_id: claim.openedBy,
      title: `Claim ${claim.bookingRef} ${status.replace("_", " ")}`,
      body: note ?? `Your claim is now ${status.replace("_", " ")}.`,
      kind: "system",
    });
    return claim;
  } catch {
    return claim;
  }
}
