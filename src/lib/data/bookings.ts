import type { Booking, Payment, PaymentMethod, PaymentSplit } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { priceBundle } from "@/lib/pricing";
import { shortRef } from "@/lib/utils";
import { getSpaceById } from "@/lib/data/hosts";
import {
  createBooking as mockCreateBooking,
  getBooking as mockGetBooking,
  getBookingsByTraveller as mockGetBookingsByTraveller,
  getBookingsForHost as mockGetBookingsForHost,
  getPaymentsForHost as mockGetPaymentsForHost,
  getAllBookings as mockGetAllBookings,
  getAllPayments as mockGetAllPayments,
  setBookingStatus as mockSetBookingStatus,
  getAirport,
  type CreateBookingInput,
} from "@/lib/data/store";

/** Late-cancellation fee (within 24h of drop-off): 20% of the total. */
export const CANCEL_FEE_BPS = 2000;
export const CANCEL_FREE_WINDOW_MS = 24 * 60 * 60 * 1000;

const BOOKING_COLS =
  "id, reference, traveller_id, space_id, bundle, start_at, end_at, status, price, qr_token, transfer_id, created_at";
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
export async function createBookingLive(
  input: CreateBookingInput,
  opts: { status?: Booking["status"]; recordPayment?: boolean } = {}
): Promise<Booking> {
  if (!IS_LIVE) return mockCreateBooking(input);

  const status = opts.status ?? "paid";
  const recordPayment = opts.recordPayment ?? true;

  const space = await getSpaceById(input.spaceId);
  if (!space) throw new Error(`Unknown space: ${input.spaceId}`);
  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  const price = priceBundle(space, input.bundle, input.startAt, input.endAt, currency);
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
    await admin.from("notifications").insert({
      user_id: input.travellerId,
      title: "Booking confirmed",
      body: `${reference} · QR ready in your wallet.`,
      kind: "booking",
    });
    await notifyHostOfBooking(booking, "New booking");
    const { sendBookingConfirmedEmails } = await import("@/lib/booking-emails");
    await sendBookingConfirmedEmails(booking);
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
    await notifyHostOfBooking(booking, "New booking");
    const { sendBookingConfirmedEmails } = await import("@/lib/booking-emails");
    await sendBookingConfirmedEmails(booking);
  }
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

  const feeApplied = start - now < CANCEL_FREE_WINDOW_MS;
  const fee = feeApplied ? Math.round((booking.price.total * CANCEL_FEE_BPS) / 10_000) : 0;
  const refund = Math.max(0, booking.price.total - fee);

  if (!IS_LIVE) {
    mockSetBookingStatus(bookingId, "cancelled");
    return { ok: true, refund, feeApplied };
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  // Issue the Stripe refund when we have the payment reference.
  const { data: pay } = await admin
    .from("payments")
    .select("id, provider, external_ref")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (pay?.provider === "stripe" && pay.external_ref && refund > 0) {
    try {
      const { getStripe } = await import("@/lib/stripe");
      await getStripe().refunds.create({
        payment_intent: pay.external_ref,
        amount: refund,
      });
    } catch {
      return { ok: false, error: "Refund could not be processed — please contact support." };
    }
  }

  await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);

  // Mark the payment refunded so it drops out of earnings / payouts due.
  // Supabase returns (not throws) errors, so a missing enum value (migration
  // 0006 not run yet) degrades gracefully — the UI also filters by booking
  // status as a fallback.
  if (pay?.id) {
    await admin.from("payments").update({ payout_status: "refunded" }).eq("id", pay.id);
  }

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
