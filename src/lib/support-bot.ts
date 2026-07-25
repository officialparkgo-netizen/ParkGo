import type { Booking } from "@/types";

/**
 * Account-aware answers: once we know who is chatting we can answer "when is
 * my booking", "where do I go", "send me the QR" and "how do I cancel" from
 * their own data instead of handing the ticket to a human.
 *
 * Pure and synchronous — the caller fetches the bookings.
 */
export type BookingIntent = "next" | "where" | "qr" | "cancel" | "receipt" | null;

// Order matters: the specific intents are tested before the catch-all "next",
// otherwise "cancel my booking" would match on "my booking".
const INTENT_WORDS: [BookingIntent, string[]][] = [
  [
    "cancel",
    ["cancel my", "cancel booking", "cancel the", "refund my", "منسوخ", "रद्द", "stornieren", "取消预订"],
  ],
  ["receipt", ["receipt", "invoice", "vat", "رسید", "रसीद", "quittung", "rechnung", "收据", "发票"]],
  ["qr", ["qr", "code to get in", "entry code", "کیو آر", "क्यूआर", "扫码"]],
  [
    "where",
    ["where do i", "address", "directions", "how do i get", "پتہ", "پہنچ", "पता", "adresse", "地址", "怎么去"],
  ],
  [
    "next",
    ["my booking", "my trip", "when is my", "booking date", "میری بکنگ", "मेरी बुकिंग", "meine buchung", "我的预订"],
  ],
];

export function detectBookingIntent(text: string): BookingIntent {
  const q = text.toLowerCase();
  for (const [intent, words] of INTENT_WORDS) {
    if (words.some((w) => q.includes(w))) return intent;
  }
  return null;
}

/** The booking a question most likely refers to: the next one, else the last. */
export function relevantBooking(bookings: Booking[], now = Date.now()): Booking | null {
  const live = bookings.filter((b) => b.status !== "cancelled");
  if (live.length === 0) return null;
  const upcoming = live
    .filter((b) => new Date(b.endAt).getTime() >= now)
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  if (upcoming.length > 0) return upcoming[0];
  return live.sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt))[0];
}

export interface BotAnswer {
  /** Message text, with {…} placeholders already filled by the caller. */
  text: string;
  /** Deep link the widget offers as a button. */
  href?: string;
  linkLabel?: string;
}

/**
 * Build the answer. `labels` come from the caller's translations so the bot
 * speaks the visitor's language; `{ref}`, `{dates}`, `{area}` are substituted.
 */
export function answerBookingIntent(
  intent: Exclude<BookingIntent, null>,
  // Only the id is needed — the widget passes a trimmed summary, not a Booking.
  booking: { id: string } | null,
  labels: {
    none: string;
    next: string;
    where: string;
    qr: string;
    cancel: string;
    receipt: string;
    openBooking: string;
  },
  fields: { ref: string; dates: string; area: string }
): BotAnswer {
  if (!booking) return { text: labels.none };
  const fill = (s: string) =>
    s.replace("{ref}", fields.ref).replace("{dates}", fields.dates).replace("{area}", fields.area);
  const href = `/app/booking/${booking.id}`;
  switch (intent) {
    case "next":
      return { text: fill(labels.next), href, linkLabel: labels.openBooking };
    case "where":
      return { text: fill(labels.where), href, linkLabel: labels.openBooking };
    case "qr":
      return { text: fill(labels.qr), href, linkLabel: labels.openBooking };
    case "cancel":
      return { text: fill(labels.cancel), href, linkLabel: labels.openBooking };
    case "receipt":
      return {
        text: fill(labels.receipt),
        href: `${href}/receipt`,
        linkLabel: labels.openBooking,
      };
  }
}
