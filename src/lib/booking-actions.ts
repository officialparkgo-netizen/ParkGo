"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { BookingBundle, PaymentMethod } from "@/types";
import { requireUser, requireRole } from "@/lib/auth";
import {
  addReview,
  confirmHandover,
  createBooking,
  getBooking,
  getSpace,
  reviewVerification,
  setBookingStatus,
} from "@/lib/data/store";
import { getPaymentGateway } from "@/lib/services/payments";

/** Checkout: create a booking + take (mock) payment, then go to confirmation. */
export async function createBookingAction(formData: FormData) {
  const user = await requireUser();
  const spaceId = String(formData.get("spaceId") || "");
  const space = getSpace(spaceId);
  if (!space) throw new Error("Unknown space");

  const bundle: BookingBundle = {
    parking: true,
    transfer: formData.get("transfer") === "1",
    ev: formData.get("ev") === "1" && !!space.evCharger,
  };
  const startAt = String(formData.get("startAt") || new Date().toISOString());
  const endAt = String(formData.get("endAt") || new Date().toISOString());
  const method = (String(formData.get("method") || "card") as PaymentMethod);

  // Create the booking first (computes the split), then authorise via the gateway.
  const booking = createBooking({
    travellerId: user.id,
    spaceId,
    bundle,
    startAt,
    endAt,
    method,
  });
  await getPaymentGateway().charge({
    bookingRef: booking.reference,
    amount: booking.price.total,
    currency: booking.price.currency,
    method,
    split: booking.price.split,
  });

  revalidatePath("/app");
  redirect(`/app/booking/${booking.id}?new=1`);
}

export interface HandoverState {
  ok?: boolean;
  error?: string;
  confirmedAt?: string;
}

/** Verified handover: confirm the one-time code (both parties). */
export async function confirmHandoverAction(
  _prev: HandoverState,
  formData: FormData
): Promise<HandoverState> {
  await requireUser();
  const transferId = String(formData.get("transferId") || "");
  const code = String(formData.get("code") || "");
  const result = confirmHandover(transferId, code);
  if (!result.ok) return { error: result.error };

  const booking = getBooking(
    // find the booking for this transfer to revalidate its page
    formData.get("bookingId") ? String(formData.get("bookingId")) : ""
  );
  if (booking) revalidatePath(`/app/booking/${booking.id}/track`);
  revalidatePath("/transfer");
  return { ok: true, confirmedAt: result.transfer.handoverConfirmedAt };
}

export interface ReviewState {
  ok?: boolean;
  error?: string;
}

/** Traveller leaves a review for the space after a completed trip. */
export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "").trim();
  const booking = getBooking(bookingId);
  if (!booking || booking.travellerId !== user.id) return { error: "Booking not found." };
  if (rating < 1 || rating > 5) return { error: "Please choose a rating." };

  addReview({
    bookingId,
    authorId: user.id,
    authorRole: "traveller",
    subjectId: booking.spaceId,
    subjectType: "space",
    rating,
    comment,
  });
  setBookingStatus(bookingId, "reviewed");
  revalidatePath(`/app/booking/${bookingId}/track`);
  revalidatePath("/app");
  return { ok: true };
}

/** Admin: approve or reject a verification (host or transfer provider). */
export async function reviewVerificationAction(formData: FormData) {
  const admin = await requireRole("admin");
  const id = String(formData.get("verificationId") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") return;
  reviewVerification(id, decision, admin.id, String(formData.get("notes") || "") || undefined);
  revalidatePath("/admin");
}
