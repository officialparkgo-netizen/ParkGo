import type { Review } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  addReview as mockAddReview,
  getAllReviews as mockGetAllReviews,
  getReviewsForSpace as mockGetReviewsForSpace,
  setBookingStatus as mockSetBookingStatus,
  setReviewHidden as mockSetReviewHidden,
} from "@/lib/data/store";

const COLS = "*";

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Review {
  return {
    id: r.id,
    bookingId: r.booking_id,
    authorId: r.author_id,
    authorRole: r.author_role,
    subjectId: r.subject_id,
    subjectType: r.subject_type,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.created_at,
    hidden: !!r.hidden,
    reply: r.reply ?? undefined,
    repliedAt: r.replied_at ?? undefined,
    photos: Array.isArray(r.photos) ? r.photos.filter((p: unknown) => typeof p === "string") : undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** All reviews (admin audit feed). */
export async function listAllReviews(): Promise<Review[]> {
  if (!IS_LIVE) return mockGetAllReviews();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("reviews")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map(fromRow);
}

/** Reviews for a space, newest first (admin-hidden ones excluded). */
export async function listReviewsForSpace(spaceId: string): Promise<Review[]> {
  if (!IS_LIVE) return mockGetReviewsForSpace(spaceId).filter((r) => !r.hidden);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("reviews")
    .select(COLS)
    .eq("subject_id", spaceId)
    .eq("subject_type", "space")
    .order("created_at", { ascending: false });
  return (data ?? []).map(fromRow).filter((r) => !r.hidden);
}

/** Admin moderation: hide or restore a review on public pages. */
export async function setReviewHiddenAdmin(reviewId: string, hidden: boolean): Promise<boolean> {
  if (!IS_LIVE) return !!mockSetReviewHidden(reviewId, hidden);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { error } = await supabaseAdmin()
    .from("reviews")
    .update({ hidden })
    .eq("id", reviewId);
  return !error;
}

/**
 * Traveller review of a space: insert the review, mark the booking reviewed,
 * and roll the space's headline rating/review count forward.
 */
export async function createSpaceReview(input: {
  bookingId: string;
  authorId: string;
  spaceId: string;
  rating: number;
  comment: string;
  /** Storage URLs uploaded by the submit action (max 3, enforced there). */
  photos?: string[];
}): Promise<Review | null> {
  if (!IS_LIVE) {
    const review = mockAddReview({
      bookingId: input.bookingId,
      authorId: input.authorId,
      authorRole: "traveller",
      subjectId: input.spaceId,
      subjectType: "space",
      rating: input.rating,
      comment: input.comment,
      ...(input.photos?.length ? { photos: input.photos } : {}),
    });
    mockSetBookingStatus(input.bookingId, "reviewed");
    return review;
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  // One review per booking.
  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("booking_id", input.bookingId)
    .maybeSingle();
  if (existing) return null;

  let { data: row, error } = await admin
    .from("reviews")
    .insert({
      booking_id: input.bookingId,
      author_id: input.authorId,
      author_role: "traveller",
      subject_id: input.spaceId,
      subject_type: "space",
      rating: input.rating,
      comment: input.comment,
      ...(input.photos?.length ? { photos: input.photos } : {}),
    })
    .select(COLS)
    .single();
  if (error && input.photos?.length) {
    // Migration 0029 not applied yet — save the words, drop the pictures.
    ({ data: row, error } = await admin
      .from("reviews")
      .insert({
        booking_id: input.bookingId,
        author_id: input.authorId,
        author_role: "traveller",
        subject_id: input.spaceId,
        subject_type: "space",
        rating: input.rating,
        comment: input.comment,
      })
      .select(COLS)
      .single());
  }
  if (error || !row) return null;

  await admin.from("bookings").update({ status: "reviewed" }).eq("id", input.bookingId);

  // Recompute the space's headline rating.
  const { data: all } = await admin
    .from("reviews")
    .select("rating")
    .eq("subject_id", input.spaceId)
    .eq("subject_type", "space");
  if (all?.length) {
    const avg = Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10;
    await admin
      .from("spaces")
      .update({ rating: avg, review_count: all.length })
      .eq("id", input.spaceId);
  }

  return fromRow(row);
}

/** Reviews left on any of a host's spaces (for /host/reviews). */
export async function listReviewsForHostSpaces(spaceIds: string[]): Promise<Review[]> {
  if (spaceIds.length === 0) return [];
  if (!IS_LIVE) {
    return mockGetAllReviews().filter(
      (r) => r.subjectType === "space" && spaceIds.includes(r.subjectId)
    );
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("reviews")
    .select(COLS)
    .in("subject_id", spaceIds)
    .eq("subject_type", "space")
    .order("created_at", { ascending: false });
  return (data ?? []).map(fromRow);
}

/** Host's public reply (one per review; overwrites are allowed). */
export async function setReviewReply(reviewId: string, reply: string): Promise<boolean> {
  const text = reply.trim().slice(0, 600);
  if (!text) return false;
  if (!IS_LIVE) {
    const r = mockGetAllReviews().find((x) => x.id === reviewId);
    if (!r) return false;
    r.reply = text;
    r.repliedAt = new Date().toISOString();
    return true;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { error } = await supabaseAdmin()
    .from("reviews")
    .update({ reply: text, replied_at: new Date().toISOString() })
    .eq("id", reviewId);
  return !error;
}
