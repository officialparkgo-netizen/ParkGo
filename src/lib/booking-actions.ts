"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Booking, BookingBundle, PaymentMethod, VehicleProfile } from "@/types";
import { getCurrentUser, requireFinanceAdmin, requireRole, requireUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import { confirmHandover, getAirport, getBooking } from "@/lib/data/store";
import {
  getHostById,
  getSpaceById,
  reviewSpaceListing,
  setSpacePausedAdmin,
} from "@/lib/data/hosts";
import { reviewVerificationLive } from "@/lib/data/verifications";
import {
  applyBookingExtension,
  cancelBooking,
  createBookingLive,
  getBookingById,
  isSpaceAvailable,
} from "@/lib/data/bookings";
import { createSpaceReview } from "@/lib/data/reviews";
import { getPaymentGateway } from "@/lib/services/payments";
import { priceBundle } from "@/lib/pricing";
import {
  isStripeConfigured,
  createBookingCheckoutSession,
  createExtensionCheckoutSession,
} from "@/lib/stripe";

/** Checkout: create a booking + take (mock) payment, then go to confirmation. */
/**
 * Deduct exactly what the pricing actually allowed. `applyPromoToPrice` clamps
 * a discount to the platform's share, so the credit spent can be less than the
 * credit offered — charging the full offer would quietly burn the difference.
 */
async function settleCredit(
  userId: string,
  promo: { id: string } | undefined,
  discount: number | undefined
) {
  if (promo?.id !== "credit" || !discount || discount <= 0) return;
  const { adjustCredit } = await import("@/lib/data/users");
  await adjustCredit(userId, -discount);
}

export async function createBookingAction(formData: FormData) {
  const spaceId = String(formData.get("spaceId") || "");

  /**
   * Guest checkout: no account needed to get this far. If nobody is signed in
   * we make the account from the details the form already collects, and carry
   * straight on to payment. An email that already belongs to somebody stops
   * here and goes to sign-in — adopting it would be an account takeover.
   */
  let user = await getCurrentUser();
  if (!user) {
    const { createGuestAccount } = await import("@/lib/guest-checkout");
    const result = await createGuestAccount({
      name: String(formData.get("guestName") || ""),
      email: String(formData.get("guestEmail") || ""),
      phone: String(formData.get("guestPhone") || ""),
    });
    if (!result.ok) {
      const back = new URLSearchParams({
        from: String(formData.get("startAt") || "").slice(0, 10),
        to: String(formData.get("endAt") || "").slice(0, 10),
        guest: result.reason,
      });
      redirect(`/app/book/${spaceId}?${back.toString()}`);
    }
    user = result.user;
    const { sendGuestWelcome } = await import("@/lib/guest-checkout");
    await sendGuestWelcome(user);
  }

  const space = await getSpaceById(spaceId);
  if (!space) throw new Error("Unknown space");
  // Only live listings are bookable — paused/pending/rejected spaces are
  // hidden from search but still reachable by direct link.
  if (space.status !== "live") redirect(`/app/search?airport=${space.airportSlug}`);

  // Hosts can refuse specific guests — bounce before any money moves.
  const owningHost = await getHostById(space.hostId);
  if (owningHost?.blockedGuests?.includes(user.id)) {
    redirect(`/app/space/${spaceId}?blocked=1`);
  }

  const transferOn = formData.get("transfer") === "1";
  const transferTime = String(formData.get("transferTime") || "");
  const bundle: BookingBundle = {
    parking: true,
    transfer: transferOn,
    ev: formData.get("ev") === "1" && !!space.evCharger,
    ...(transferOn
      ? {
          transferReturn: formData.get("transferReturn") === "1",
          ...(/^\d{2}:\d{2}$/.test(transferTime) ? { transferTime } : {}),
        }
      : {}),
  };
  const startAt = String(formData.get("startAt") || new Date().toISOString());
  const endAt = String(formData.get("endAt") || new Date().toISOString());
  const method = (String(formData.get("method") || "card") as PaymentMethod);

  /**
   * Paid extras. Care services are matched against the listing rather than
   * trusted from the form — otherwise the price of the wash is whatever the
   * buyer posts.
   */
  const careIds = formData.getAll("care").map(String);
  const extras = {
    protection: formData.get("protection") === "1",
    care: (space.careServices ?? []).filter((c) => careIds.includes(c.id)),
  };
  const assistance = String(formData.get("assistance") || "").trim().slice(0, 400) || undefined;
  // Group booking: the extra cars typed at checkout, on top of the account's.
  const vehicles = parseVehicles(formData);
  // Expensing it to the company the traveller belongs to.
  const organisationId =
    formData.get("billToCompany") === "1" ? user.organisationId : undefined;
  const flightNumber = String(formData.get("flightNumber") || "").trim().toUpperCase();

  // Dates must make sense: drop-off from today onward, pick-up after drop-off.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (
    new Date(startAt).getTime() < todayStart.getTime() ||
    new Date(endAt).getTime() <= new Date(startAt).getTime()
  ) {
    redirect(`/app/space/${spaceId}?dates=invalid`);
  }

  // Capacity: bounce back with a clear message when the space is full.
  const available = await isSpaceAvailable(spaceId, startAt, endAt, space.capacity ?? 1);
  if (!available) {
    redirect(`/app/space/${spaceId}?soldout=1`);
  }

  // Optional promo code — invalid codes bounce back to checkout with a notice.
  const promoRaw = String(formData.get("promo") || "").trim();
  let promo: { id: string; code: string; kind: "percent" | "fixed"; value: number } | undefined;
  if (promoRaw) {
    const { findActivePromo } = await import("@/lib/data/promos");
    const found = await findActivePromo(promoRaw);
    if (!found) {
      const back = new URLSearchParams({
        from: startAt.slice(0, 10),
        to: endAt.slice(0, 10),
        promo: "invalid",
      });
      redirect(`/app/book/${spaceId}?${back.toString()}`);
    }
    promo = { id: found.id, code: found.code, kind: found.kind, value: found.value };
  }

  /**
   * Referral credit. Spent as a fixed discount the platform absorbs, exactly
   * like a promo — the host's payout is untouched either way. Only applied
   * when no promo code was used, because a booking carries one discount line.
   */
  if (!promo && (user.creditPence ?? 0) > 0) {
    const { creditToApply } = await import("@/lib/referrals");
    const { getPlatformSettings } = await import("@/lib/data/settings");
    const cfg = await getPlatformSettings();
    const currency = getAirport(space.airportSlug)?.country === "IE" ? "EUR" : "GBP";
    const preview = priceBundle(
      space,
      bundle,
      startAt,
      endAt,
      currency,
      {
        serviceFee: cfg.serviceFee,
        parkingCommissionBps: cfg.parkingCommissionBps,
        transferCommissionBps: cfg.transferCommissionBps,
      },
      extras
    );
    const spend = creditToApply(user.creditPence ?? 0, preview.total);
    if (spend > 0) promo = { id: "credit", code: "CREDIT", kind: "fixed", value: spend };
  }

  // Loyalty tier, earned by finishing trips. Worked out server-side from the
  // bookings themselves — a tier is not something the form gets to claim.
  const { completedTripCount } = await import("@/lib/data/rewards");
  const completedTrips = await completedTripCount(user);

  const common = {
    travellerId: user.id,
    spaceId,
    bundle,
    startAt,
    endAt,
    method,
    promo,
    extras,
    vehicles,
    assistance,
    organisationId,
    completedTrips,
    ...(flightNumber ? { flight: { number: flightNumber, scheduledArrival: endAt, status: "scheduled" as const } } : {}),
  };

  // Stripe path: create a pending booking, then redirect to Stripe Checkout.
  // The /api/stripe/confirm route marks it paid on return.
  if (isStripeConfigured()) {
    const pending = await createBookingLive(common, {
      status: "requested",
      recordPayment: false,
    });
    if (promo && promo.id !== "credit") {
      const { incrementPromoUse } = await import("@/lib/data/promos");
      await incrementPromoUse(promo.id);
    }
    await settleCredit(user.id, promo, pending.price.discount);
    const prepaid = await settlePrepayment(pending, formData, user.id);
    // Split to the host's connected account when they've onboarded payouts.
    const host = await getHostById(space.hostId);
    const url = await createBookingCheckoutSession(
      { ...pending, ...prepaid },
      space,
      host?.payoutAccountRef,
      { id: user.stripeCustomerId, email: user.email }
    );
    redirect(url);
  }

  // Mock path: create the booking (computes the split) + simulate the charge.
  const booking = await createBookingLive(common);
  if (promo && promo.id !== "credit") {
    const { incrementPromoUse } = await import("@/lib/data/promos");
    await incrementPromoUse(promo.id);
  }
  await settleCredit(user.id, promo, booking.price.discount);
  const prepaid = await settlePrepayment(booking, formData, user.id);
  await getPaymentGateway().charge({
    bookingRef: booking.reference,
    // Only the part that still has to reach the card. The split is unchanged:
    // the host is owed the same whether a gift card paid for it or not.
    amount: Math.max(0, booking.price.total - (prepaid.prepaid ?? 0)),
    currency: booking.price.currency,
    method,
    split: booking.price.split,
  });

  revalidatePath("/app");
  redirect(`/app/booking/${booking.id}?new=1`);
}

/**
 * Spend a gift card and/or trip pass against a booking that already exists.
 *
 * Deliberately after creation: if the booking had failed, a balance deducted
 * first would be gone with nothing to show for it. Whatever comes back is what
 * was *actually* taken — a card someone else spent a second earlier yields
 * less than planned, and the card is charged for the difference.
 */
async function settlePrepayment(
  booking: Pick<Booking, "id" | "price" | "startAt" | "endAt">,
  formData: FormData,
  userId: string
): Promise<Pick<Booking, "prepaid" | "prepaidFrom">> {
  const code = String(formData.get("giftCard") || "").trim();
  const wantPass = formData.get("usePass") === "1";
  if (!code && !wantPass) return {};

  const { activeTripPass, findGiftCard, spendGiftCard, spendPassDays } = await import(
    "@/lib/data/rewards"
  );
  const { planPrepayment } = await import("@/lib/rewards");
  const { daysBetween } = await import("@/lib/utils");

  const card = code ? await findGiftCard(code) : null;
  const pass = wantPass ? await activeTripPass(userId) : null;
  const plan = planPrepayment(booking.price.total, {
    // Referral credit is NOT included here: it is platform-issued marketing
    // money and already applied above as a discount. A gift card is money a
    // customer handed over, so it reduces the charge without touching price.
    giftCard: card ? { code: card.code, balancePence: card.balancePence } : undefined,
    pass: pass
      ? { id: pass.id, daysLeft: pass.daysTotal - pass.daysUsed, dayValue: pass.dayValuePence }
      : undefined,
    daysBooked: Math.max(1, daysBetween(booking.startAt, booking.endAt)),
  });

  const from: NonNullable<Booking["prepaidFrom"]> = {};
  let prepaid = 0;
  if (pass && plan.passDays > 0) {
    const days = await spendPassDays(pass.id, plan.passDays);
    if (days > 0) {
      prepaid += days * pass.dayValuePence;
      from.passId = pass.id;
      from.passDays = days;
    }
  }
  if (card && plan.fromGiftCard > 0) {
    const took = await spendGiftCard(card.code, plan.fromGiftCard);
    if (took > 0) {
      prepaid += took;
      from.giftCard = card.code;
    }
  }
  if (prepaid <= 0) return {};

  const { setBookingPrepaid } = await import("@/lib/data/bookings");
  await setBookingPrepaid(booking.id, prepaid, from);
  return { prepaid, prepaidFrom: from };
}

/** Extra cars typed at checkout for a group booking. */
function parseVehicles(formData: FormData): VehicleProfile[] | undefined {
  const regs = formData.getAll("vehicleReg").map((v) => String(v).trim().toUpperCase());
  const makes = formData.getAll("vehicleMake").map((v) => String(v).trim());
  const out: VehicleProfile[] = [];
  for (let i = 0; i < regs.length; i += 1) {
    if (!regs[i]) continue;
    out.push({
      make: makes[i] || "—",
      model: "",
      colour: "",
      reg: regs[i].slice(0, 12),
      size: "medium",
      ev: false,
    });
  }
  return out.length ? out : undefined;
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

/**
 * Traveller extends the pick-up date. The difference vs the original price is
 * charged: through Stripe Checkout when configured, instantly otherwise.
 */
export async function extendBookingAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const newEndDate = String(formData.get("newEnd") || "");
  const booking = await getBookingById(bookingId);

  if (!booking || booking.travellerId !== user.id) {
    redirect(`/app/booking/${bookingId}?extendError=1`);
  }
  if (booking.status !== "paid" && booking.status !== "active") {
    redirect(`/app/booking/${bookingId}?extendError=1`);
  }
  const newEnd = new Date(newEndDate);
  const currentEnd = new Date(booking.endAt);
  if (!newEndDate || isNaN(newEnd.getTime()) || newEnd <= currentEnd) {
    redirect(`/app/booking/${bookingId}?extendError=1`);
  }
  // Keep the original pick-up time of day on the new date.
  newEnd.setHours(currentEnd.getHours(), currentEnd.getMinutes(), 0, 0);
  const newEndAt = newEnd.toISOString();

  const space = await getSpaceById(booking.spaceId);
  if (!space) redirect(`/app/booking/${bookingId}?extendError=1`);

  // The extra window must still fit the space's capacity.
  const free = await isSpaceAvailable(space.id, booking.endAt, newEndAt, space.capacity ?? 1);
  if (!free) redirect(`/app/booking/${bookingId}?extendError=full`);

  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  const newPrice = priceBundle(space, booking.bundle, booking.startAt, newEndAt, currency);
  const extra = newPrice.total - booking.price.total;
  if (extra <= 0) redirect(`/app/booking/${bookingId}?extendError=1`);

  if (isStripeConfigured()) {
    const host = await getHostById(space.hostId);
    const url = await createExtensionCheckoutSession(
      booking,
      space,
      newEndAt,
      {
        amount: extra,
        hostShare: newPrice.split.hostPayout - booking.price.split.hostPayout,
      },
      host?.payoutAccountRef
    );
    redirect(url);
  }

  await applyBookingExtension(bookingId, newEndAt, { provider: "mock" });
  revalidatePath("/app");
  revalidatePath(`/app/booking/${bookingId}`);
  revalidatePath("/host");
  revalidatePath("/admin");
  redirect(`/app/booking/${bookingId}?extended=1`);
}

/**
 * Move a booking's dates without cancelling and rebooking.
 *
 * Extend already covers "same start, later finish, pay the difference". This
 * covers the other shapes — a flight brought forward, a trip cut short, the
 * whole window shifted — and is deliberately limited to windows that cost the
 * same or less. Anything that costs more is a payment, and Extend is the path
 * that takes one; sending someone through a half-built top-up here would be
 * worse than telling them plainly.
 *
 * The difference comes back as ParkGo credit rather than a card refund: it is
 * instant, it needs no payment provider, and it is spendable on the next
 * booking. The host's payout is recomputed from the new dates, so nobody is
 * paid for days the car was not there.
 */
export async function amendBookingDatesAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const fromDate = String(formData.get("newStart") || "");
  const toDate = String(formData.get("newEnd") || "");
  const back: (why: string) => never = (why) =>
    redirect(`/app/booking/${bookingId}?amend=${why}`);

  const booking = await getBookingById(bookingId);
  if (!booking || booking.travellerId !== user.id) back("error");
  if (booking.status !== "paid" && booking.status !== "requested") back("error");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
    back("error");
  }

  // Keep the original times of day — only the dates are being moved.
  const oldStart = new Date(booking.startAt);
  const oldEnd = new Date(booking.endAt);
  const newStart = new Date(fromDate);
  const newEnd = new Date(toDate);
  newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
  newEnd.setHours(oldEnd.getHours(), oldEnd.getMinutes(), 0, 0);
  if (newEnd.getTime() <= newStart.getTime()) back("error");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (newStart.getTime() < today.getTime()) back("past");

  const space = await getSpaceById(booking.spaceId);
  if (!space) back("error");

  const startAt = newStart.toISOString();
  const endAt = newEnd.toISOString();

  // Capacity for the new window. The booking's own dates are moving, so the
  // check has to ignore this booking when counting what is already there.
  const free = await isSpaceAvailable(space.id, startAt, endAt, space.capacity ?? 1, bookingId);
  if (!free) back("full");

  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  const newPrice = priceBundle(space, booking.bundle, startAt, endAt, currency);
  const paid = booking.price.total;
  if (newPrice.total > paid) back("costsmore");

  const { amendBookingDates } = await import("@/lib/data/bookings");
  const result = await amendBookingDates(bookingId, startAt, endAt, newPrice);
  if (!result.ok) back("error");

  // Hand back the difference as credit.
  const refund = paid - newPrice.total;
  if (refund > 0) {
    const { adjustCredit } = await import("@/lib/data/users");
    await adjustCredit(user.id, refund);
  }

  revalidatePath("/app");
  revalidatePath(`/app/booking/${bookingId}`);
  revalidatePath("/host");
  redirect(`/app/booking/${bookingId}?amend=${refund > 0 ? "credited" : "done"}`);
}

/** Admin: approve or reject a verification (host or transfer provider). */
export async function reviewVerificationAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const id = String(formData.get("verificationId") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") return;
  const notes = String(formData.get("notes") || "").trim().slice(0, 300) || undefined;
  await reviewVerificationLive(id, decision, admin.id, notes);
  const { recordAdminAction } = await import("@/lib/data/admin-actions");
  await recordAdminAction(admin, `verification.${decision}`, "verification", id, notes);
  revalidatePath("/admin");
  revalidatePath("/admin/verification");
  revalidatePath("/host");
}

/** Admin: approve or reject a single listing (goes live / rejected + notifies host). */
export async function reviewSpaceAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const spaceId = String(formData.get("spaceId") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (decision !== "approved" && decision !== "rejected") return;
  const space = await reviewSpaceListing(spaceId, decision, admin.id);
  const { recordAdminAction } = await import("@/lib/data/admin-actions");
  await recordAdminAction(admin, `listing.${decision}`, "space", spaceId, space?.title);
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/host");
  revalidatePath("/app/search");
  if (space) revalidatePath(`/airports/${space.airportSlug}`);
}

/** Admin: pause a live listing (hide from search) or put it back live. */
export async function pauseSpaceAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const spaceId = String(formData.get("spaceId") || "");
  const state = String(formData.get("state") || "");
  if (!spaceId || (state !== "pause" && state !== "reactivate")) return;
  const space = await setSpacePausedAdmin(spaceId, state === "pause");
  const { recordAdminAction } = await import("@/lib/data/admin-actions");
  await recordAdminAction(
    admin,
    state === "pause" ? "listing.paused" : "listing.reactivated",
    "space",
    spaceId,
    space?.title
  );
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/host");
  revalidatePath("/app/search");
  if (space) revalidatePath(`/airports/${space.airportSlug}`);
}

/** Host: pause or reactivate their OWN listing (holiday mode). */
export async function pauseOwnSpaceAction(formData: FormData) {
  const user = await requireRole("host");
  const spaceId = String(formData.get("spaceId") || "");
  const state = String(formData.get("state") || "");
  if (!spaceId || (state !== "pause" && state !== "reactivate")) return;

  const { getHostForUser, getSpaceById } = await import("@/lib/data/hosts");
  const host = await getHostForUser(user);
  const space = await getSpaceById(spaceId);
  if (!host || !space || space.hostId !== host.id) return;

  const updated = await setSpacePausedAdmin(spaceId, state === "pause", false);
  revalidatePath("/host");
  revalidatePath("/app/search");
  if (updated) revalidatePath(`/airports/${updated.airportSlug}`);
}
