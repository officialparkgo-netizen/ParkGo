"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getBookingById, pingArriving } from "@/lib/data/bookings";
import { addConditionPhoto, listConditionPhotos, MAX_PHOTOS_PER_PHASE } from "@/lib/data/travel-day";
import { uploadSpacePhoto } from "@/lib/storage";
import { isFlightNumber, lookupFlight } from "@/lib/flights";

/**
 * Travel-day actions: telling the host you're close, photographing the car,
 * and checking a flight on demand.
 */

export interface TravelDayState {
  ok?: boolean;
  error?: string;
  etaMin?: number;
  /** Flight status text, when the action was a lookup. */
  flight?: { status: string; estimatedArrival?: string };
}

export async function pingArrivingAction(
  _prev: TravelDayState,
  formData: FormData
): Promise<TravelDayState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const etaMin = Number(formData.get("etaMin") || 0);
  if (!(etaMin > 0)) return { error: "Pick how far away you are." };

  const ok = await pingArriving(bookingId, user.id, etaMin);
  if (!ok) return { error: "We could not reach your host just now." };

  // A text is the point of this on the host's side, but only if they asked
  // for one. Failing to send must not fail the ping — the in-app notification
  // has already landed.
  try {
    const booking = await getBookingById(bookingId);
    if (booking) {
      const { getSpaceById, getHostById } = await import("@/lib/data/hosts");
      const { getUserProfile } = await import("@/lib/data/users");
      const space = await getSpaceById(booking.spaceId);
      const host = space ? await getHostById(space.hostId) : null;
      const hostUser = host ? await getUserProfile(host.userId) : null;
      if (hostUser) {
        const { sendSmsIfOptedIn } = await import("@/lib/sms");
        await sendSmsIfOptedIn(
          hostUser,
          `ParkGo: ${booking.reference} is arriving in about ${Math.round(etaMin)} minutes.`
        );
      }
    }
  } catch {
    // see above
  }

  revalidatePath(`/app/booking/${bookingId}`);
  revalidatePath("/host/today");
  return { ok: true, etaMin: Math.round(etaMin) };
}

export async function addConditionPhotoAction(
  _prev: TravelDayState,
  formData: FormData
): Promise<TravelDayState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const phase = String(formData.get("phase") || "dropoff") === "pickup" ? "pickup" : "dropoff";

  const booking = await getBookingById(bookingId);
  if (!booking || booking.travellerId !== user.id) return { error: "Booking not found." };

  const existing = await listConditionPhotos(bookingId);
  if (existing.filter((p) => p.phase === phase).length >= MAX_PHOTOS_PER_PHASE) {
    return { error: "That's the maximum for this stage." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo first." };
  // Same bucket and size limits as listing photos — one upload path, one set
  // of rules about what a phone camera is allowed to send us.
  const url = await uploadSpacePhoto(file, `condition/${bookingId}`);
  if (!url) return { error: "That photo would not upload. Try a smaller one." };

  const saved = await addConditionPhoto({ bookingId, phase, url, takenBy: user.id });
  if (!saved) return { error: "We could not save that photo." };

  revalidatePath(`/app/booking/${bookingId}`);
  return { ok: true };
}

/**
 * Check a flight on demand. The sweep does this on a schedule; this is for the
 * traveller refreshing their own booking page and wanting an answer now.
 */
export async function checkFlightAction(
  _prev: TravelDayState,
  formData: FormData
): Promise<TravelDayState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const booking = await getBookingById(bookingId);
  if (!booking || booking.travellerId !== user.id) return { error: "Booking not found." };
  const number = booking.flight?.number ?? "";
  if (!isFlightNumber(number)) return { error: "No flight is attached to this booking." };

  const status = await lookupFlight(number, booking.flight!.scheduledArrival);
  if (status.status === "unknown") {
    return { error: "We could not reach the flight data just now." };
  }

  const { recordFlightCheck, applyFlightExtension } = await import("@/lib/data/bookings");
  const { extendedEndFor } = await import("@/lib/flights");
  const newEnd = extendedEndFor(booking.endAt, {
    status: status.status,
    estimatedArrival: status.estimatedArrival,
    extendedAt: booking.flight!.extendedAt,
  });
  if (newEnd) {
    await applyFlightExtension(bookingId, newEnd, {
      number,
      estimatedArrival: status.estimatedArrival,
      status: status.status,
    });
  } else {
    await recordFlightCheck(bookingId, status.status, status.estimatedArrival);
  }

  revalidatePath(`/app/booking/${bookingId}`);
  return { ok: true, flight: { status: status.status, estimatedArrival: status.estimatedArrival } };
}

/** Opt in or out of travel-day texts. */
export async function setSmsOptInAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const on = formData.get("smsOptIn") === "1";
  const { setSmsOptIn } = await import("@/lib/data/users");
  await setSmsOptIn(user.id, on);
  revalidatePath("/account");
}
