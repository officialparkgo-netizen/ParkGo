"use server";

import type { TransferMessage } from "@/types";
import { requireUser } from "@/lib/auth";
import { getBookingById } from "@/lib/data/bookings";
import { listTransferMessages, sendTransferMessage } from "@/lib/data/messages";

/** Booking-owner (or admin) gate shared by both chat actions. */
async function authoriseBooking(bookingId: string) {
  const user = await requireUser();
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  if (booking.travellerId !== user.id && user.role !== "admin") return null;
  return booking;
}

export async function listDriverMessagesAction(
  bookingId: string
): Promise<TransferMessage[]> {
  const booking = await authoriseBooking(bookingId);
  if (!booking) return [];
  return listTransferMessages(bookingId);
}

export async function sendDriverMessageAction(
  bookingId: string,
  text: string
): Promise<TransferMessage[]> {
  const booking = await authoriseBooking(bookingId);
  const trimmed = String(text || "").trim().slice(0, 500);
  if (!booking || !trimmed) return booking ? listTransferMessages(bookingId) : [];
  await sendTransferMessage(bookingId, trimmed);
  return listTransferMessages(bookingId);
}
