import { describe, expect, it } from "vitest";
import type { Booking } from "@/types";
import { answerBookingIntent, detectBookingIntent, relevantBooking } from "./support-bot";

const mk = (id: string, startAt: string, endAt: string, status: Booking["status"] = "paid") =>
  ({ id, reference: `PG-${id}`, travellerId: "u1", spaceId: "s1", bundle: { parking: true, transfer: false, ev: false }, startAt, endAt, status, price: {} as Booking["price"], qrToken: "t", createdAt: startAt }) as Booking;

const LABELS = {
  none: "No bookings yet",
  next: "Your booking {ref} runs {dates}.",
  where: "Head to {area}.",
  qr: "Your QR for {ref} is in the app.",
  cancel: "You can cancel {ref} from the booking page.",
  receipt: "Receipt for {ref}.",
  openBooking: "Open booking",
};

describe("booking intents", () => {
  it("recognises the common questions in several languages", () => {
    expect(detectBookingIntent("when is my booking?")).toBe("next");
    expect(detectBookingIntent("میری بکنگ کب ہے")).toBe("next");
    expect(detectBookingIntent("what is the address")).toBe("where");
    expect(detectBookingIntent("send me the QR please")).toBe("qr");
    expect(detectBookingIntent("I want to cancel my booking")).toBe("cancel");
    expect(detectBookingIntent("can I get a VAT invoice")).toBe("receipt");
  });

  it("returns null for anything else", () => {
    expect(detectBookingIntent("do you have EV chargers")).toBeNull();
    expect(detectBookingIntent("")).toBeNull();
  });
});

describe("relevantBooking", () => {
  const now = Date.parse("2026-08-10T12:00:00Z");

  it("prefers the soonest upcoming stay", () => {
    const b = relevantBooking(
      [
        mk("late", "2026-09-01T10:00:00Z", "2026-09-05T10:00:00Z"),
        mk("soon", "2026-08-12T10:00:00Z", "2026-08-15T10:00:00Z"),
        mk("past", "2026-07-01T10:00:00Z", "2026-07-04T10:00:00Z"),
      ],
      now
    );
    expect(b?.id).toBe("soon");
  });

  it("falls back to the most recent past stay", () => {
    const b = relevantBooking(
      [
        mk("older", "2026-06-01T10:00:00Z", "2026-06-03T10:00:00Z"),
        mk("recent", "2026-07-01T10:00:00Z", "2026-07-04T10:00:00Z"),
      ],
      now
    );
    expect(b?.id).toBe("recent");
  });

  it("ignores cancelled bookings and empty lists", () => {
    expect(relevantBooking([mk("x", "2026-08-12T10:00:00Z", "2026-08-15T10:00:00Z", "cancelled")], now)).toBeNull();
    expect(relevantBooking([], now)).toBeNull();
  });
});

describe("answers", () => {
  const booking = mk("bk1", "2026-08-12T10:00:00Z", "2026-08-15T10:00:00Z");
  const fields = { ref: "PG-1A2B", dates: "12–15 Aug", area: "Hounslow West" };

  it("fills the placeholders and links to the booking", () => {
    const a = answerBookingIntent("next", booking, LABELS, fields);
    expect(a.text).toBe("Your booking PG-1A2B runs 12–15 Aug.");
    expect(a.href).toBe("/app/booking/bk1");
    expect(a.linkLabel).toBe("Open booking");
  });

  it("points the receipt intent at the receipt page", () => {
    expect(answerBookingIntent("receipt", booking, LABELS, fields).href).toBe(
      "/app/booking/bk1/receipt"
    );
  });

  it("says so when there is no booking", () => {
    const a = answerBookingIntent("where", null, LABELS, fields);
    expect(a.text).toBe("No bookings yet");
    expect(a.href).toBeUndefined();
  });
});
