"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { BookingBundle, PaymentMethod } from "@/types";
import { requireUser, requireRole } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import { confirmHandover, getBooking } from "@/lib/data/store";
import { getHostById, getSpaceById, reviewSpaceListing } from "@/lib/data/hosts";
import { reviewVerificationLive } from "@/lib/data/verifications";
import { cancelBooking, createBookingLive, getBookingById } from "@/lib/data/bookings";
import { createSpaceReview } from "@/lib/data/reviews";
import { getPaymentGateway } from "@/lib/services/payments";
import { isStripeConfigured, createBookingCheckoutSession } from "@/lib/stripe";

/** Checkout: create a booking + take (mock) payment, then go to confirmation. */
export async function createBookingAction(formData: FormData) {
  const user = await requireUser();
  const spaceId = String(formData.get("spaceId") || "");
  const space = await getSpaceById(spaceId);
  if (!space) throw new Error("Unknown space");

  const bundle: BookingBundle = {
    parking: true,
    transfer: formData.get("transfer") === "1",
    ev: formData.get("ev") === "1" && !!space.evCharger,
  };
  const startAt = String(formData.get("startAt") || new Date().toISOString());
  const endAt = String(formData.get("endAt") || new Date().toISOString());
  const method = (String(formData.get("method") || "card") as PaymentMethod);

  // Stripe path: create a pending booking, then redirect to Stripe Checkout.
  // The /api/stripe/confirm route marks it paid on return.
  if (isStripeConfigured()) {
    const pending = await createBookingLive(
      { travellerId: user.id, spaceId, bundle, startAt, endAt, method },
      { status: "requested", recordPayment: false }
    );
    // Split to the host's connected account when they've onboarded payouts.
    const host = await getHostById(space.hostId);
    const url = await createBookingCheckoutSession(pending, space, host?.payoutAccountRef);
    redirect(url);
  }

  // Mock path: create the booking (computes the split) + simulate the charge.
  const booking = await createBookingLive({
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
  revalidatePath("/admin");
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
  const booking = await getBookingById(bookingId);
  if (!booking || booking.travellerId !== user.id) return { error: "Booking not found." };
  if (rating < 1 || rating > 5) {
    const { t } = await getI18n();
    return { error: t("err.rating") };
  }

  // Reviewable once the trip is over (or explicitly completed), once per booking.
  const finished =
    booking.status === "completed" ||
    ((booking.status === "paid" || booking.status === "active") &&
      new Date(booking.endAt).getTime() < Date.now());
  if (booking.status === "reviewed") return { error: "You've already reviewed this trip." };
  if (!finished) return { error: "You can review after your trip ends." };

  const review = await createSpaceReview({
    bookingId,
    authorId: user.id,
    spaceId: booking.spaceId,
    rating,
    comment,
  });
  if (!review) return { error: "You've already reviewed this trip." };

  revalidatePath(`/app/booking/${bookingId}/track`);
  revalidatePath(`/app/space/${booking.spaceId}`);
  revalidatePath("/app");
  return { ok: true };
}

/** Traveller: cancel a booking (free >24h before drop-off; late fee within 24h). */
export async function cancelBookingAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const result = await cancelBooking(bookingId, user.id);

  revalidatePath("/app");
  revalidatePath(`/app/booking/${bookingId}`);
  revalidatePath("/host");
  revalidatePath("/admin");

  if (!result.ok) {
    redirect(`/app/booking/${bookingId}?cancelError=1`);
  }
  redirect(`/app/booking/${bookingId}?cancelled=1&refund=${result.refund}`);
}

/** Admin: approve or reject a verification (host or transfer provider). */
export async function reviewVerificationAction(formData: FormData) {
  const admin = await requireRole("admin");
  const id = String(formData.get("verificationId") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") return;
  await reviewVerificationLive(
    id,
    decision,
    admin.id,
    String(formData.get("notes") || "") || undefined
  );
  revalidatePath("/admin");
  revalidatePath("/host");
}

/** Admin: approve or reject a single listing (goes live / rejected + notifies host). */
export async function reviewSpaceAction(formData: FormData) {
  const admin = await requireRole("admin");
  const spaceId = String(formData.get("spaceId") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") return;
  const space = await reviewSpaceListing(spaceId, decision, admin.id);
  revalidatePath("/admin");
  revalidatePath("/host");
  revalidatePath("/app/search");
  if (space) revalidatePath(`/airports/${space.airportSlug}`);
}
