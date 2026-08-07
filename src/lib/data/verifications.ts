import type { Verification, VerificationDocument } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getPendingVerifications as mockGetPendingVerifications,
  getVerifications as mockGetVerifications,
  reviewVerification as mockReviewVerification,
} from "@/lib/data/store";

const COLS =
  "id, subject_id, subject_type, status, documents, submitted_at, reviewed_at, reviewer_id, notes, reverify_due_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Verification {
  return {
    id: r.id,
    subjectId: r.subject_id,
    subjectType: r.subject_type,
    status: r.status,
    documents: (r.documents ?? []) as VerificationDocument[],
    submittedAt: r.submitted_at ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
    reviewerId: r.reviewer_id ?? undefined,
    notes: r.notes ?? undefined,
    reverifyDueAt: r.reverify_due_at ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Host KYC submission: create the verification and mark the host in_review. */
export async function submitHostVerification(
  hostId: string,
  documents: VerificationDocument[],
  notes?: string
): Promise<Verification | null> {
  if (!IS_LIVE) return null; // mock demo hosts are pre-seeded

  // Last line of defence against duplicates: even if two submits race past
  // the page, only one pending verification may exist per host.
  if (await hasPendingHostVerification(hostId)) return null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("verifications")
    .insert({
      subject_id: hostId,
      subject_type: "host",
      status: "in_review",
      documents,
      submitted_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .select(COLS)
    .single();
  if (error || !data) return null;

  await admin.from("hosts").update({ verification_status: "in_review" }).eq("id", hostId);
  return fromRow(data);
}

/** Does this host already have a verification awaiting review? */
export async function hasPendingHostVerification(hostId: string): Promise<boolean> {
  if (!IS_LIVE) return false;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("verifications")
    .select("id")
    .eq("subject_id", hostId)
    .in("status", ["pending", "in_review"])
    .limit(1);
  return (data ?? []).length > 0;
}

export async function listPendingVerificationsLive(): Promise<Verification[]> {
  if (!IS_LIVE) return mockGetPendingVerifications();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("verifications")
    .select(COLS)
    .in("status", ["pending", "in_review"])
    .order("submitted_at", { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function listAllVerificationsLive(): Promise<Verification[]> {
  if (!IS_LIVE) return mockGetVerifications();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("verifications")
    .select(COLS)
    .order("submitted_at", { ascending: false });
  return (data ?? []).map(fromRow);
}

/**
 * Admin decision on a verification. Propagates to the host (verification_status),
 * flips the host's pending listings live on approval, and notifies the host.
 */
export async function reviewVerificationLive(
  id: string,
  decision: "approved" | "rejected",
  reviewerId: string,
  notes?: string
): Promise<void> {
  if (!IS_LIVE) {
    mockReviewVerification(id, decision, reviewerId, notes);
    return;
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { data: v } = await admin
    .from("verifications")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewer_id: reviewerId,
      notes: notes ?? null,
    })
    .eq("id", id)
    .select(COLS)
    .single();
  if (!v) return;

  if (v.subject_type === "host") {
    await admin.from("hosts").update({ verification_status: decision }).eq("id", v.subject_id);
    if (decision === "approved") {
      await admin
        .from("spaces")
        .update({ status: "live" })
        .eq("host_id", v.subject_id)
        .eq("status", "pending_review");
    }
    const { data: host } = await admin
      .from("hosts")
      .select("user_id")
      .eq("id", v.subject_id)
      .maybeSingle();
    if (host?.user_id) {
      await admin.from("notifications").insert({
        user_id: host.user_id,
        title: decision === "approved" ? "Verification approved 🎉" : "Verification declined",
        body:
          decision === "approved"
            ? "You're verified — you can now list spaces and they'll go live after review."
            : notes
              ? `Reason: ${notes} — please fix this and resubmit your documents.`
              : "Your verification needs attention. Please review your details and resubmit.",
        kind: "verification",
      });
    }
  }
}

/** Newest verification record for a host (drives the /host/verify status UI). */
export async function latestVerificationForHost(hostId: string): Promise<Verification | null> {
  if (!IS_LIVE) {
    const all = mockGetVerifications().filter(
      (v) => v.subjectType === "host" && v.subjectId === hostId
    );
    return (
      [...all].sort((a, b) =>
        (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")
      )[0] ?? null
    );
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("verifications")
    .select(COLS)
    .eq("subject_type", "host")
    .eq("subject_id", hostId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? fromRow(data) : null;
}
