import type { BookingMessage } from "@/types";
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
