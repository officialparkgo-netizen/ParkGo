import type { Booking, Payment, PaymentMethod, PaymentSplit } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { applyPromoToPrice, priceBundle } from "@/lib/pricing";
import { shortRef } from "@/lib/utils";
import { getSpaceById } from "@/lib/data/hosts";
import {
  createBooking as mockCreateBooking,
  extendBooking as mockExtendBooking,
  getBooking as mockGetBooking,
  getBookingsByTraveller as mockGetBookingsByTraveller,
  getBookingsForHost as mockGetBookingsForHost,
  getPaymentsForHost as mockGetPaymentsForHost,
  getAllBookings as mockGetAllBookings,
  getAllPayments as mockGetAllPayments,
  setBookingStatus as mockSetBookingStatus,
  setPaymentPayoutStatus as mockSetPaymentPayoutStatus,
  addNotification as mockAddNotification,
  getAirport,
  type CreateBookingInput,
} from "@/lib/data/store";

/** Late-cancellation fee (within 24h of drop-off): 20% of the total. */
export const CANCEL_FEE_BPS = 2000;
export const CANCEL_FREE_WINDOW_MS = 24 * 60 * 60 * 1000;

// "*" keeps selects working across schema versions — columns added by later
// migrations (approval, bay_index …) simply come back null on older DBs.
const BOOKING_COLS = "*";
const PAYMENT_COLS =
  "id, booking_id, provider, method, amount, currency, split, payout_status, created_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function bookingFromRow(r: any): Booking {
  return {
    id: r.id,
    reference: r.reference,
    travellerId: r.traveller_id,
    spaceId: r.space_id,
    bundle: r.bundle,
    startAt: r.start_at,
    endAt: r.end_at,
    status: r.status,
    price: r.price,
    qrToken: r.qr_token,
    transferId: r.transfer_id ?? undefined,
    approval: r.approval ?? undefined,
    approvalDeadline: r.approval_deadline ?? undefined,
    bayIndex: r.bay_index ?? undefined,
    createdAt: r.created_at,
  };
}

function paymentFromRow(r: any): Payment {
  return {
    id: r.id,
    bookingId: r.booking_id,
    provider: r.provider,
    method: r.method,
    amount: r.amount,
    currency: r.currency,
    split: r.split,
    payoutStatus: r.payout_status,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Create a booking + payment record. Live mode writes to Supabase (payment is
 * recorded with provider 'mock' until Stripe is wired). Mock mode uses the seed
 * store. The transfer job is fulfilled by the external operator API, so no
 * transfer row is written here.
 */
/** Paid/active bookings overlapping a window vs the space's capacity. */
export async function isSpaceAvailable(
  spaceId: string,
  startAt: string,
  endAt: string,
  capacity: number
): Promise<boolean> {
  // Host-blocked days close the space in both modes.
  const space = await getSpaceById(spaceId);
  const { isRangeBlocked } = await import("@/lib/utils");
  if (isRangeBlocked(space?.blockedDates, startAt, endAt)) return false;

  if (!IS_LIVE) return true; // demo data isn't capacity-managed
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { count } = await supabaseAdmin()
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("space_id", spaceId)
    .in("status", ["paid", "active"])
    .lt("start_at", endAt)
    .gt("end_at", startAt);
  return (count ?? 0) < Math.max(1, capacity);
}

export async function createBookingLive(
  input: CreateBookingInput,
  opts: { status?: Booking["status"]; recordPayment?: boolean } = {}
): Promise<Booking> {
  // Fees are DB-configurable (/admin/settings) — thread them into pricing.
  if (!input.priceCfg) {
    const { getPlatformSettings } = await import("@/lib/data/settings");
    const cfg = await getPlatformSettings();
    input = {
      ...input,
      priceCfg: {
        serviceFee: cfg.serviceFee,
        parkingCommissionBps: cfg.parkingCommissionBps,
        transferCommissionBps: cfg.transferCommissionBps,
      },
    };
  }
  if (!IS_LIVE) {
    const b = mockCreateBooking(input);
    if (b.approval !== "pending") {
      const { sendAutoWelcome } = await import("@/lib/data/booking-messages");
      await sendAutoWelcome(b);
    }
    return b;
  }

  const status = opts.status ?? "paid";
  const recordPayment = opts.recordPayment ?? true;

  const space = await getSpaceById(input.spaceId);
  if (!space) throw new Error(`Unknown space: ${input.spaceId}`);

  // Final availability guard (search also filters, but re-check at write time).
  const available = await isSpaceAvailable(
    input.spaceId,
    input.startAt,
    input.endAt,
    space.capacity ?? 1
  );
  if (!available) throw new Error("SPACE_FULL");

  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  let price = priceBundle(space, input.bundle, input.startAt, input.endAt, currency, input.priceCfg);
  if (input.promo) price = applyPromoToPrice(price, input.promo);
  const reference = shortRef(`${input.spaceId}|${input.travellerId}|${new Date().toISOString()}`);
  const qrToken = `${reference}|${space.id}|${input.travellerId}`;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { data: bRow, error } = await admin
    .from("bookings")
    .insert({
      reference,
      traveller_id: input.travellerId,
      space_id: input.spaceId,
      bundle: input.bundle,
      start_at: input.startAt,
      end_at: input.endAt,
      status,
      price,
      qr_token: qrToken,
      // Only present when the host switched request-to-book on — which
      // requires migration 0021, so the columns are guaranteed to exist.
      ...(space.requestToBook
        ? {
            approval: "pending",
            approval_deadline: new Date(Date.now() + 86_400_000).toISOString(),
          }
        : {}),
    })
    .select(BOOKING_COLS)
    .single();
  if (error || !bRow) throw new Error(`booking failed: ${error?.message}`);
  const booking = bookingFromRow(bRow);

  // Mock/no-Stripe path records the payment immediately; the Stripe path records
  // it on payment confirmation instead (see markBookingPaid).
  if (recordPayment) {
    await admin.from("payments").insert({
      booking_id: booking.id,
      provider: "mock",
      method: input.method ?? "card",
      amount: price.total,
      currency,
      split: price.split,
      payout_status: "pending",
    });
    const pendingApproval = booking.approval === "pending";
    await admin.from("notifications").insert({
      user_id: input.travellerId,
      title: pendingApproval ? "Request sent to host" : "Booking confirmed",
      body: pendingApproval
        ? `${reference} · the host has 24h to accept (full refund otherwise).`
        : `${reference} · QR ready in your wallet.`,
      kind: "booking",
    });
    await notifyHostOfBooking(
      booking,
      pendingApproval ? "New booking request" : "New booking"
    );
    const { sendBookingConfirmedEmails } = await import("@/lib/booking-emails");
    await sendBookingConfirmedEmails(booking);
    if (!pendingApproval) {
      const { sendAutoWelcome } = await import("@/lib/data/booking-messages");
      await sendAutoWelcome(booking);
    }
  }

  return booking;
}

/** Notify the host that owns the booked space (best-effort). */
async function notifyHostOfBooking(booking: Booking, title: string): Promise<void> {
  if (!IS_LIVE) return;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data: space } = await admin
      .from("spaces")
      .select("host_id, title")
      .eq("id", booking.spaceId)
      .maybeSingle();
    if (!space) return;
    const { data: host } = await admin
      .from("hosts")
      .select("user_id")
      .eq("id", space.host_id)
      .maybeSingle();
    if (!host?.user_id) return;
    await admin.from("notifications").insert({
      user_id: host.user_id,
      title: `${title} · ${booking.reference}`,
      body: `“${space.title}” · ${new Date(booking.startAt).toDateString()} → ${new Date(
        booking.endAt
      ).toDateString()}`,
      kind: "booking",
    });
  } catch {
    // notification failures must never break the booking flow
  }
}

/** Mark a booking paid and record the payment (idempotent). Used after Stripe. */
export async function markBookingPaid(
  bookingId: string,
  payment: {
    amount: number;
    currency: string;
    split: PaymentSplit;
    method: PaymentMethod;
    provider: "stripe" | "mock";
    /** Provider reference (Stripe payment intent) — enables refunds. */
    externalRef?: string | null;
  }
): Promise<void> {
  if (!IS_LIVE) {
    mockSetBookingStatus(bookingId, "paid");
    return;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  await admin.from("bookings").update({ status: "paid" }).eq("id", bookingId);

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (existing) return; // already recorded (e.g. page refresh)

  await admin.from("payments").insert({
    booking_id: bookingId,
    provider: payment.provider,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
    split: payment.split,
    payout_status: "pending",
    ...(payment.externalRef ? { external_ref: payment.externalRef } : {}),
  });
  await admin.from("notifications").insert({
    user_id: (await admin.from("bookings").select("traveller_id").eq("id", bookingId).maybeSingle())
      .data?.traveller_id,
    title: "Booking confirmed",
    body: "Payment received · your QR is ready in your wallet.",
    kind: "booking",
  });

  const booking = await getBookingById(bookingId);
  if (booking) {
    const pendingApproval = booking.approval === "pending";
    await notifyHostOfBooking(
      booking,
      pendingApproval ? "New booking request" : "New booking"
    );
    const { sendBookingConfirmedEmails } = await import("@/lib/booking-emails");
    await sendBookingConfirmedEmails(booking);
    if (!pendingApproval) {
      const { sendAutoWelcome } = await import("@/lib/data/booking-messages");
      await sendAutoWelcome(booking);
    }
  }
}

/**
 * Reprice a booking for a later pick-up and apply the extension: update the
 * window + stored price, record the extra charge as a second payment row, and
 * notify both sides. Idempotent — a repeat call with the same (or an earlier)
 * end date is a no-op, so the Stripe confirm + webhook paths can both fire.
 */
export async function applyBookingExtension(
  bookingId: string,
  newEndAt: string,
  payment: { provider: "stripe" | "mock"; externalRef?: string | null }
): Promise<Booking | null> {
  if (!IS_LIVE) return mockExtendBooking(bookingId, newEndAt) ?? null;

  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  if (booking.status !== "paid" && booking.status !== "active") return null;
  if (new Date(newEndAt) <= new Date(booking.endAt)) return booking; // already applied

  const space = await getSpaceById(booking.spaceId);
  if (!space) return null;
  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  const newPrice = priceBundle(space, booking.bundle, booking.startAt, newEndAt, currency);
  const extra = newPrice.total - booking.price.total;
  if (extra <= 0) return booking;
  const deltaSplit: PaymentSplit = {
    platform: newPrice.split.platform - booking.price.split.platform,
    hostPayout: newPrice.split.hostPayout - booking.price.split.hostPayout,
    driverPayout: newPrice.split.driverPayout - booking.price.split.driverPayout,
  };

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { error } = await admin
    .from("bookings")
    .update({ end_at: newEndAt, price: newPrice })
    .eq("id", bookingId);
  if (error) return null;

  await admin.from("payments").insert({
    booking_id: bookingId,
    provider: payment.provider,
    method: "card",
    amount: extra,
    currency,
    split: deltaSplit,
    payout_status: "pending",
    ...(payment.externalRef ? { external_ref: payment.externalRef } : {}),
  });

  await admin.from("notifications").insert({
    user_id: booking.travellerId,
    title: "Booking extended",
    body: `${booking.reference} now ends ${new Date(newEndAt).toDateString()}.`,
    kind: "booking",
  });
  const extended = { ...booking, endAt: newEndAt, price: newPrice };
  await notifyHostOfBooking(extended, "Booking extended");

  return extended;
}

export type CancelResult =
  | { ok: true; refund: number; feeApplied: boolean }
  | { ok: false; error: string };

/**
 * Traveller cancellation. Free (full refund) until 24h before drop-off; within
 * 24h a late fee (CANCEL_FEE_BPS) is kept and the rest refunded. Refunds are
 * issued via Stripe when the payment has a stored payment-intent reference.
 */
export async function cancelBooking(
  bookingId: string,
  travellerId: string
): Promise<CancelResult> {
  const booking = await getBookingById(bookingId);
  if (!booking || booking.travellerId !== travellerId) {
    return { ok: false, error: "Booking not found." };
  }
  if (booking.status !== "paid" && booking.status !== "requested") {
    return { ok: false, error: "This booking can no longer be cancelled." };
  }
  const now = Date.now();
  const start = new Date(booking.startAt).getTime();
  if (now >= start) {
    return { ok: false, error: "The booking has already started." };
  }

  // Policy is DB-configurable (/admin/settings); constants are the defaults.
  const { getPlatformSettings } = await import("@/lib/data/settings");
  const policy = await getPlatformSettings();
  const feeApplied = start - now < policy.cancelWindowHours * 3_600_000;
  const fee = feeApplied
    ? Math.round((booking.price.total * policy.cancelFeeBps) / 10_000)
    : 0;
  const refund = Math.max(0, booking.price.total - fee);

  if (!IS_LIVE) {
    mockSetBookingStatus(bookingId, "cancelled");
    return { ok: true, refund, feeApplied };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  // Issue Stripe refunds across every charge on the booking (an extended
  // booking has two payment intents). Newest first, until the refundable
  // amount is used up — the late fee, when applied, is kept from the oldest.
  const { data: pays } = await admin
    .from("payments")
    .select("id, provider, amount, external_ref")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  let remaining = refund;
  for (const pay of pays ?? []) {
    if (remaining <= 0) break;
    if (pay.provider === "stripe" && pay.external_ref) {
      const amount = Math.min(remaining, pay.amount);
      try {
        const { getStripe } = await import("@/lib/stripe");
        await getStripe().refunds.create({ payment_intent: pay.external_ref, amount });
        remaining -= amount;
      } catch {
        return { ok: false, error: "Refund could not be processed — please contact support." };
      }
    }
  }

  await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);

  // Mark the payments refunded so they drop out of earnings / payouts due.
  // Supabase returns (not throws) errors, so a missing enum value (migration
  // 0006 not run yet) degrades gracefully — the UI also filters by booking
  // status as a fallback.
  await admin.from("payments").update({ payout_status: "refunded" }).eq("booking_id", bookingId);

  await admin.from("notifications").insert({
    user_id: travellerId,
    title: "Booking cancelled",
    body: feeApplied
      ? `${booking.reference} cancelled. Late fee applied; refund issued for the remainder.`
      : `${booking.reference} cancelled. Full refund issued.`,
    kind: "booking",
  });
  await notifyHostOfBooking(booking, "Booking cancelled");

  // Tell every admin (compliance visibility).
  try {
    const { data: admins } = await admin.from("users").select("id").eq("role", "admin");
    if (admins?.length) {
      await admin.from("notifications").insert(
        admins.map((a) => ({
          user_id: a.id,
          title: `Booking cancelled · ${booking.reference}`,
          body: feeApplied
            ? `Late cancellation — 20% fee kept, refund issued for the remainder.`
            : `Free cancellation — full refund issued.`,
          kind: "booking",
        }))
      );
    }
  } catch {
    // admin alert failures must not block the cancellation
  }

  const { sendBookingCancelledEmails } = await import("@/lib/booking-emails");
  await sendBookingCancelledEmails(booking, refund, feeApplied);

  return { ok: true, refund, feeApplied };
}

/**
 * Admin cancellation (support cases): full refund, no late fee, allowed for
 * any booking that hasn't finished. Mirrors the traveller flow's refund and
 * notification behaviour.
 */
export async function adminCancelBooking(bookingId: string): Promise<CancelResult> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  if (!["requested", "paid", "active"].includes(booking.status)) {
    return { ok: false, error: "This booking can no longer be cancelled." };
  }
  const refund = booking.price.total;

  if (!IS_LIVE) {
    mockSetBookingStatus(bookingId, "cancelled");
    mockAddNotification({
      userId: booking.travellerId,
      title: "Booking cancelled by ParkGo",
      body: `${booking.reference} was cancelled by our support team. Full refund issued.`,
      kind: "booking",
    });
    return { ok: true, refund, feeApplied: false };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  // Refund every Stripe charge on the booking, newest first.
  const { data: pays } = await admin
    .from("payments")
    .select("id, provider, amount, external_ref")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  let remaining = refund;
  for (const pay of pays ?? []) {
    if (remaining <= 0) break;
    if (pay.provider === "stripe" && pay.external_ref) {
      const amount = Math.min(remaining, pay.amount);
      try {
        const { getStripe } = await import("@/lib/stripe");
        await getStripe().refunds.create({ payment_intent: pay.external_ref, amount });
        remaining -= amount;
      } catch {
        return { ok: false, error: "Refund could not be processed." };
      }
    }
  }

  await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  await admin.from("payments").update({ payout_status: "refunded" }).eq("booking_id", bookingId);

  await admin.from("notifications").insert({
    user_id: booking.travellerId,
    title: "Booking cancelled by ParkGo",
    body: `${booking.reference} was cancelled by our support team. Full refund issued.`,
    kind: "booking",
  });
  await notifyHostOfBooking(booking, "Booking cancelled");

  const { sendBookingCancelledEmails } = await import("@/lib/booking-emails");
  await sendBookingCancelledEmails(booking, refund, false);

  return { ok: true, refund, feeApplied: false };
}

/**
 * Admin goodwill refund: refund part of the total without cancelling.
 * Live mode refunds the newest Stripe charge; the platform absorbs it
 * (splits stay unchanged — track it via the admin action log).
 */
export async function adminPartialRefund(
  bookingId: string,
  amount: number
): Promise<{ ok: boolean; error?: string }> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  if (amount <= 0 || amount > booking.price.total) {
    return { ok: false, error: "Amount out of range." };
  }

  if (!IS_LIVE) {
    mockAddNotification({
      userId: booking.travellerId,
      title: "Refund issued",
      body: `We refunded part of ${booking.reference} as a goodwill gesture.`,
      kind: "booking",
    });
    return { ok: true };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();
  const { data: pays } = await admin
    .from("payments")
    .select("id, provider, amount, external_ref")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  const stripePay = (pays ?? []).find((p) => p.provider === "stripe" && p.external_ref);
  if (stripePay) {
    try {
      const { getStripe } = await import("@/lib/stripe");
      await getStripe().refunds.create({
        payment_intent: stripePay.external_ref,
        amount: Math.min(amount, stripePay.amount),
      });
    } catch {
      return { ok: false, error: "Stripe refund failed." };
    }
  }
  await admin.from("notifications").insert({
    user_id: booking.travellerId,
    title: "Refund issued",
    body: `We refunded part of ${booking.reference} as a goodwill gesture.`,
    kind: "booking",
  });
  return { ok: true };
}

/**
 * Admin support tool: move a booking's dates (price unchanged — pair with a
 * partial refund or promo when the value changes materially).
 */
export async function adminUpdateBookingDates(
  bookingId: string,
  startAt: string,
  endAt: string
): Promise<{ ok: boolean; error?: string }> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  if (!["requested", "paid", "active"].includes(booking.status)) {
    return { ok: false, error: "This booking can no longer be changed." };
  }
  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    return { ok: false, error: "Pick-up must be after drop-off." };
  }

  if (!IS_LIVE) {
    const b = mockGetBooking(bookingId);
    if (!b) return { ok: false, error: "Booking not found." };
    b.startAt = startAt;
    b.endAt = endAt;
    mockAddNotification({
      userId: booking.travellerId,
      title: "Booking dates updated",
      body: `${booking.reference} now runs ${new Date(startAt).toDateString()} → ${new Date(endAt).toDateString()}.`,
      kind: "booking",
    });
    return { ok: true };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("bookings")
    .update({ start_at: startAt, end_at: endAt })
    .eq("id", bookingId);
  if (error) return { ok: false, error: "Update failed." };
  await admin.from("notifications").insert({
    user_id: booking.travellerId,
    title: "Booking dates updated",
    body: `${booking.reference} now runs ${new Date(startAt).toDateString()} → ${new Date(endAt).toDateString()}.`,
    kind: "booking",
  });
  return { ok: true };
}

/**
 * Host check-in/check-out: paid → active (car arrived) and active → completed
 * (car collected). The booking must sit on one of the host's own spaces.
 */
export async function hostSetBookingStatus(
  bookingId: string,
  hostId: string,
  next: "active" | "completed"
): Promise<{ ok: boolean; error?: string }> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  const space = await getSpaceById(booking.spaceId);
  if (!space || space.hostId !== hostId) return { ok: false, error: "Not your booking." };
  const allowed =
    (next === "active" && booking.status === "paid") ||
    (next === "completed" && (booking.status === "active" || booking.status === "paid"));
  if (!allowed) return { ok: false, error: "This step isn't available right now." };

  if (!IS_LIVE) {
    mockSetBookingStatus(bookingId, next);
  } else {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("bookings")
      .update({ status: next })
      .eq("id", bookingId);
    if (error) return { ok: false, error: "Update failed." };
  }

  const note =
    next === "active"
      ? { title: "Car checked in", body: `${booking.reference}: your car has arrived safely.` }
      : { title: "Car collected", body: `${booking.reference}: thanks for parking with ParkGo — leave a review!` };
  if (!IS_LIVE) {
    mockAddNotification({ userId: booking.travellerId, kind: "booking", ...note });
  } else {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin().from("notifications").insert({
        user_id: booking.travellerId,
        title: note.title,
        body: note.body,
        kind: "booking",
      });
    } catch {
      // notification is best-effort
    }
  }
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Request-to-book: host approval, decline (full refund) and the 24h sweep
// -----------------------------------------------------------------------------

async function notifyTraveller(travellerId: string, title: string, body: string): Promise<void> {
  if (!IS_LIVE) {
    mockAddNotification({ userId: travellerId, title, body, kind: "booking" });
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin()
      .from("notifications")
      .insert({ user_id: travellerId, title, body, kind: "booking" });
  } catch {
    // best-effort
  }
}

/** Host accepts a pending request — the booking is confirmed as it stands. */
export async function hostApproveBooking(
  bookingId: string,
  hostId: string
): Promise<{ ok: boolean; error?: string }> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  const space = await getSpaceById(booking.spaceId);
  if (!space || space.hostId !== hostId) return { ok: false, error: "Not your booking." };
  if (booking.approval !== "pending") return { ok: false, error: "Nothing to approve." };

  if (!IS_LIVE) {
    booking.approval = "approved";
    booking.approvalDeadline = undefined;
  } else {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("bookings")
      .update({ approval: "approved", approval_deadline: null })
      .eq("id", bookingId);
    if (error) return { ok: false, error: "Update failed." };
  }

  await notifyTraveller(
    booking.travellerId,
    "Booking approved",
    `${booking.reference}: the host accepted — your QR is ready in your wallet.`
  );
  try {
    const { sendBookingApprovedEmail } = await import("@/lib/booking-emails");
    await sendBookingApprovedEmail(booking);
  } catch {
    // email is best-effort
  }
  const { sendAutoWelcome } = await import("@/lib/data/booking-messages");
  await sendAutoWelcome(booking);
  return { ok: true };
}

/** Shared decline path: cancel + refund everything (host or 24h auto). */
async function declineBookingCore(
  booking: Booking,
  auto: boolean
): Promise<{ ok: boolean; error?: string }> {
  const refund = booking.price.total;
  const note = auto
    ? {
        title: "Request expired — full refund",
        body: `${booking.reference}: the host didn't respond in 24h, so we've refunded you in full.`,
      }
    : {
        title: "Request declined — full refund",
        body: `${booking.reference}: the host can't take this booking. You've been refunded in full.`,
      };

  if (!IS_LIVE) {
    booking.approval = "declined";
    booking.approvalDeadline = undefined;
    mockSetBookingStatus(booking.id, "cancelled");
    await notifyTraveller(booking.travellerId, note.title, note.body);
    return { ok: true };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  // Refund Stripe charges (mock/manual payments are marked refunded below).
  const { data: pays } = await admin
    .from("payments")
    .select("id, provider, amount, external_ref")
    .eq("booking_id", booking.id)
    .order("created_at", { ascending: false });
  let remaining = refund;
  for (const pay of pays ?? []) {
    if (remaining <= 0) break;
    if (pay.provider === "stripe" && pay.external_ref) {
      const amount = Math.min(remaining, pay.amount);
      try {
        const { getStripe } = await import("@/lib/stripe");
        await getStripe().refunds.create({ payment_intent: pay.external_ref, amount });
        remaining -= amount;
      } catch {
        return { ok: false, error: "Refund could not be processed." };
      }
    }
  }

  const { error } = await admin
    .from("bookings")
    .update({ status: "cancelled", approval: "declined", approval_deadline: null })
    .eq("id", booking.id);
  if (error) return { ok: false, error: "Update failed." };
  await admin.from("payments").update({ payout_status: "refunded" }).eq("booking_id", booking.id);

  await notifyTraveller(booking.travellerId, note.title, note.body);
  try {
    const { sendBookingCancelledEmails } = await import("@/lib/booking-emails");
    await sendBookingCancelledEmails(booking, refund, false);
  } catch {
    // email is best-effort
  }
  return { ok: true };
}

/** Host turns a pending request down — traveller is refunded in full. */
export async function hostDeclineBooking(
  bookingId: string,
  hostId: string
): Promise<{ ok: boolean; error?: string }> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  const space = await getSpaceById(booking.spaceId);
  if (!space || space.hostId !== hostId) return { ok: false, error: "Not your booking." };
  if (booking.approval !== "pending") return { ok: false, error: "Nothing to decline." };
  return declineBookingCore(booking, false);
}

/**
 * Auto-decline requests whose 24h window has lapsed. Called lazily from the
 * host Today board and by the daily cron, so it must stay cheap + idempotent.
 */
export async function sweepExpiredApprovals(): Promise<number> {
  const now = Date.now();
  let swept = 0;

  if (!IS_LIVE) {
    const stale = mockGetAllBookings().filter(
      (b) =>
        b.approval === "pending" &&
        b.status === "paid" &&
        b.approvalDeadline &&
        new Date(b.approvalDeadline).getTime() < now
    );
    for (const b of stale) {
      const r = await declineBookingCore(b, true);
      if (r.ok) swept++;
    }
    return swept;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("bookings")
      .select(BOOKING_COLS)
      .eq("approval", "pending")
      .lt("approval_deadline", new Date(now).toISOString())
      .limit(50);
    for (const row of data ?? []) {
      const r = await declineBookingCore(bookingFromRow(row), true);
      if (r.ok) swept++;
    }
  } catch {
    // pre-0021 schema — nothing to sweep
  }
  return swept;
}

/** Host assigns (or clears) which bay a booking parks in. */
export async function setBookingBay(
  bookingId: string,
  hostId: string,
  bayIndex: number | null
): Promise<boolean> {
  const booking = await getBookingById(bookingId);
  if (!booking) return false;
  const space = await getSpaceById(booking.spaceId);
  if (!space || space.hostId !== hostId) return false;
  const bays = space.bayNames ?? [];
  if (bayIndex !== null && (bayIndex < 0 || bayIndex >= bays.length)) return false;

  if (!IS_LIVE) {
    booking.bayIndex = bayIndex ?? undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("bookings")
      .update({ bay_index: bayIndex })
      .eq("id", bookingId);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: manually mark a pending host/driver payout as paid (bank transfer). */
export async function markPayoutPaid(paymentId: string): Promise<boolean> {
  if (!IS_LIVE) return !!mockSetPaymentPayoutStatus(paymentId, "paid");
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { error } = await supabaseAdmin()
    .from("payments")
    .update({ payout_status: "paid" })
    .eq("id", paymentId);
  return !error;
}

/** Bookings on a host's spaces (abandoned checkouts excluded). */
export async function listBookingsForHost(hostId: string): Promise<Booking[]> {
  if (!IS_LIVE) return mockGetBookingsForHost(hostId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();
  const { data: spaces } = await admin.from("spaces").select("id").eq("host_id", hostId);
  const ids = (spaces ?? []).map((s) => s.id);
  if (ids.length === 0) return [];
  const { data } = await admin
    .from("bookings")
    .select(BOOKING_COLS)
    .in("space_id", ids)
    .neq("status", "requested")
    .order("created_at", { ascending: false });
  return (data ?? []).map(bookingFromRow);
}

/** Payments received on a host's spaces. */
export async function listPaymentsForHost(hostId: string): Promise<Payment[]> {
  if (!IS_LIVE) return mockGetPaymentsForHost(hostId);
  const bookings = await listBookingsForHost(hostId);
  const ids = bookings.map((b) => b.id);
  if (ids.length === 0) return [];
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("payments")
    .select(PAYMENT_COLS)
    .in("booking_id", ids)
    .order("created_at", { ascending: false });
  return (data ?? []).map(paymentFromRow);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!IS_LIVE) return mockGetBooking(id) ?? null;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("bookings").select(BOOKING_COLS).eq("id", id).maybeSingle();
  return data ? bookingFromRow(data) : null;
}

export async function listBookingsForTraveller(travellerId: string): Promise<Booking[]> {
  if (!IS_LIVE) return mockGetBookingsByTraveller(travellerId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("bookings")
    .select(BOOKING_COLS)
    .eq("traveller_id", travellerId)
    .order("start_at", { ascending: false });
  return (data ?? []).map(bookingFromRow);
}

export async function listAllBookings(): Promise<Booking[]> {
  if (!IS_LIVE) return mockGetAllBookings();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("bookings")
    .select(BOOKING_COLS)
    .order("created_at", { ascending: false });
  return (data ?? []).map(bookingFromRow);
}

export async function listAllPayments(): Promise<Payment[]> {
  if (!IS_LIVE) return mockGetAllPayments();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("payments")
    .select(PAYMENT_COLS)
    .order("created_at", { ascending: false });
  return (data ?? []).map(paymentFromRow);
}
