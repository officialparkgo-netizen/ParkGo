import type { Review } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  addReview as mockAddReview,
  getAllReviews as mockGetAllReviews,
  getReviewsForSpace as mockGetReviewsForSpace,
  setBookingStatus as mockSetBookingStatus,
} from "@/lib/data/store";

const COLS =
  "id, booking_id, author_id, author_role, subject_id, subject_type, rating, comment, created_at";

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

/** Reviews for a space, newest first. */
export async function listReviewsForSpace(spaceId: string): Promise<Review[]> {
  if (!IS_LIVE) return mockGetReviewsForSpace(spaceId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("reviews")
    .select(COLS)
    .eq("subject_id", spaceId)
    .eq("subject_type", "space")
    .order("created_at", { ascending: false });
  return (data ?? []).map(fromRow);
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

  const { data: row, error } = await admin
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
    .single();
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
