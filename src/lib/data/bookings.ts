import type { Booking, Payment } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { priceBundle } from "@/lib/pricing";
import { shortRef } from "@/lib/utils";
import { getSpaceById } from "@/lib/data/hosts";
import {
  createBooking as mockCreateBooking,
  getBooking as mockGetBooking,
  getBookingsByTraveller as mockGetBookingsByTraveller,
  getAllBookings as mockGetAllBookings,
  getAllPayments as mockGetAllPayments,
  getAirport,
  type CreateBookingInput,
} from "@/lib/data/store";

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
export async function createBookingLive(input: CreateBookingInput): Promise<Booking> {
  if (!IS_LIVE) return mockCreateBooking(input);

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
      status: "paid",
      price,
      qr_token: qrToken,
    })
    .select(BOOKING_COLS)
    .single();
  if (error || !bRow) throw new Error(`booking failed: ${error?.message}`);
  const booking = bookingFromRow(bRow);

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

  return booking;
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
