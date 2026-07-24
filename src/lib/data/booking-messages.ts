import type { Booking, BookingMessage } from "@/types";
import { IS_LIVE } from "@/lib/config";

// Traveller ↔ host thread on a booking (arrival coordination, gate codes…).
const g = globalThis as unknown as { __parkgoBookingMsgs?: BookingMessage[] };
const mockMsgs: BookingMessage[] = (g.__parkgoBookingMsgs ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): BookingMessage {
  return {
    id: r.id,
    bookingId: r.booking_id,
    from: r.sender === "host" ? "host" : "traveller",
    text: r.text ?? "",
    at: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listMessagesForBooking(bookingId: string): Promise<BookingMessage[]> {
  if (!IS_LIVE) return mockMsgs.filter((m) => m.bookingId === bookingId);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("booking_messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })
      .limit(100);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

export async function addBookingMessage(input: {
  bookingId: string;
  from: "host" | "traveller";
  text: string;
}): Promise<BookingMessage | null> {
  const text = input.text.trim().slice(0, 1000);
  if (!text) return null;
  if (!IS_LIVE) {
    const msg: BookingMessage = {
      id: `bm_${mockMsgs.length + 1}`,
      bookingId: input.bookingId,
      from: input.from,
      text,
      at: new Date().toISOString(),
    };
    mockMsgs.push(msg);
    return msg;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("booking_messages")
      .insert({ booking_id: input.bookingId, sender: input.from, text })
      .select("*")
      .single();
    if (error || !data) return null;
    return fromRow(data);
  } catch {
    return null;
  }
}

/**
 * Post the host's saved welcome message as the first thread message once a
 * booking is confirmed (instant-book, Stripe confirm, or request approval).
 * Skips silently when the host hasn't set one; never throws.
 */
export async function sendAutoWelcome(booking: Booking): Promise<void> {
  try {
    const { getSpaceById, getHostById } = await import("@/lib/data/hosts");
    const space = await getSpaceById(booking.spaceId);
    const host = space ? await getHostById(space.hostId) : null;
    const welcome = host?.autoWelcome?.trim();
    if (!welcome) return;

    // One per thread — a Stripe confirm page refresh must not repeat it.
    const existing = await listMessagesForBooking(booking.id);
    if (existing.some((m) => m.from === "host" && m.text === welcome)) return;

    await addBookingMessage({ bookingId: booking.id, from: "host", text: welcome });
    if (!IS_LIVE) {
      const { addNotification } = await import("@/lib/data/store");
      addNotification({
        userId: booking.travellerId,
        title: `Message from your host · ${booking.reference}`,
        body: welcome.slice(0, 120),
        kind: "booking",
      });
    } else {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin().from("notifications").insert({
        user_id: booking.travellerId,
        title: `Message from your host · ${booking.reference}`,
        body: welcome.slice(0, 120),
        kind: "booking",
      });
    }
  } catch {
    // the booking must never fail because of the welcome message
  }
}
