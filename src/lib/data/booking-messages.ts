import type { Booking, BookingMessage, Locale } from "@/types";
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
    ...(r.translated ? { translated: r.translated } : {}),
    ...(r.source_locale ? { sourceLocale: r.source_locale as Locale } : {}),
    at: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Render a message in the OTHER side's language before it is stored — the
 * same deal support gets: a host who reads English and a guest who reads Urdu
 * each see the thread in their own language, with the original always kept
 * underneath. Best-effort throughout: no provider, same language on both
 * sides, or an outage, and the message simply travels untranslated.
 */
async function renderForRecipient(
  bookingId: string,
  from: "host" | "traveller",
  text: string
): Promise<Pick<BookingMessage, "translated" | "sourceLocale">> {
  try {
    const { isTranslationConfigured, translateText, carriesLanguage } = await import(
      "@/lib/translate"
    );
    if (!isTranslationConfigured() || !carriesLanguage(text)) return {};

    const { getBookingById } = await import("@/lib/data/bookings");
    const booking = await getBookingById(bookingId);
    if (!booking) return {};
    const { getSpaceById, getHostById } = await import("@/lib/data/hosts");
    const space = await getSpaceById(booking.spaceId);
    const host = space ? await getHostById(space.hostId) : null;
    if (!host) return {};

    const { getUserProfile } = await import("@/lib/data/users");
    const [traveller, hostUser] = await Promise.all([
      getUserProfile(booking.travellerId),
      getUserProfile(host.userId),
    ]);
    const saved = (from === "host" ? hostUser : traveller)?.locale;
    const readerLocale = (from === "host" ? traveller : hostUser)?.locale;
    if (!readerLocale) return {};

    // The script of the message beats the account setting — someone whose
    // account says English can still type Arabic, and it is the Arabic that
    // needs carrying across. The saved language only breaks Latin-script ties.
    const { detectLocale } = await import("@/lib/support-lang");
    const detected = detectLocale(text);
    const senderWrote = detected !== "en" ? detected : (saved ?? "en");
    if (senderWrote === readerLocale) return {};

    // Only a script-confident guess is worth asserting to the provider; for
    // Latin text the provider's own detection beats a saved-locale hunch.
    const out = await translateText(
      text,
      readerLocale,
      detected !== "en" ? detected : undefined
    );
    if (!out?.text || out.text.trim() === text) return {};
    return { translated: out.text.slice(0, 2000), sourceLocale: senderWrote };
  } catch {
    return {};
  }
}

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
  const rendered = await renderForRecipient(input.bookingId, input.from, text);
  if (!IS_LIVE) {
    const msg: BookingMessage = {
      id: `bm_${mockMsgs.length + 1}`,
      bookingId: input.bookingId,
      from: input.from,
      text,
      ...rendered,
      at: new Date().toISOString(),
    };
    mockMsgs.push(msg);
    return msg;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const insert = (extra: Record<string, unknown>) =>
      supabaseAdmin()
        .from("booking_messages")
        .insert({ booking_id: input.bookingId, sender: input.from, text, ...extra })
        .select("*")
        .single();
    let { data, error } = await insert(
      rendered.translated
        ? { translated: rendered.translated, source_locale: rendered.sourceLocale }
        : {}
    );
    // Pre-0030 databases have no translation columns — store the message anyway.
    if (error && rendered.translated) {
      ({ data, error } = await insert({}));
    }
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

    const msg = await addBookingMessage({ bookingId: booking.id, from: "host", text: welcome });
    // The nudge quotes the message in the traveller's own language when the
    // thread stored a translation.
    const preview = (msg?.translated ?? welcome).slice(0, 120);
    if (!IS_LIVE) {
      const { addNotification } = await import("@/lib/data/store");
      addNotification({
        userId: booking.travellerId,
        title: `Message from your host · ${booking.reference}`,
        body: preview,
        kind: "booking",
      });
    } else {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin().from("notifications").insert({
        user_id: booking.travellerId,
        title: `Message from your host · ${booking.reference}`,
        body: preview,
        kind: "booking",
      });
    }
  } catch {
    // the booking must never fail because of the welcome message
  }
}
