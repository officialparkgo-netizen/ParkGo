import { describe, it, expect } from "vitest";
import {
  confirmHandover,
  createBooking,
  getAirports,
  getBooking,
  getTransferByBooking,
  searchSpaces,
} from "@/lib/data/store";

describe("searchSpaces", () => {
  it("returns only live spaces for the airport", () => {
    const results = searchSpaces({ airportSlug: "heathrow" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.space.airportSlug === "heathrow")).toBe(true);
    expect(results.every((r) => r.space.status === "live")).toBe(true);
  });

  it("filters out spaces without EV when EV is required", () => {
    const evResults = searchSpaces({ airportSlug: "heathrow", needsEv: true });
    expect(evResults.every((r) => r.space.evCharger !== null)).toBe(true);
  });

  it("returns nothing for an unknown airport", () => {
    expect(searchSpaces({ airportSlug: "nowhere" })).toHaveLength(0);
  });
});

describe("createBooking", () => {
  it("creates a paid booking with a reference, QR and reconciling price", () => {
    const space = searchSpaces({ airportSlug: "heathrow" })[0].space;
    const booking = createBooking({
      travellerId: "user_traveller",
      spaceId: space.id,
      bundle: { parking: true, transfer: false, ev: false },
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-04T10:00:00.000Z",
    });
    expect(booking.status).toBe("paid");
    expect(booking.reference).toMatch(/^PG-/);
    expect(booking.qrToken).toContain(booking.reference);
    expect(
      booking.price.split.platform + booking.price.split.hostPayout + booking.price.split.driverPayout
    ).toBe(booking.price.total);
    // persisted
    expect(getBooking(booking.id)?.id).toBe(booking.id);
  });

  it("spins up a transfer job with a 6-char handover code when bundled", () => {
    const space = searchSpaces({ airportSlug: "heathrow" })[0].space;
    const booking = createBooking({
      travellerId: "user_traveller",
      spaceId: space.id,
      bundle: { parking: true, transfer: true, ev: false },
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-04T10:00:00.000Z",
    });
    const transfer = getTransferByBooking(booking.id);
    expect(transfer).toBeDefined();
    expect(transfer!.handoverCode).toHaveLength(6);
    expect(transfer!.status).toBe("unassigned");
  });
});

describe("confirmHandover", () => {
  it("rejects a wrong code and accepts the right one (timestamped)", () => {
    const space = searchSpaces({ airportSlug: "heathrow" })[0].space;
    const booking = createBooking({
      travellerId: "user_traveller",
      spaceId: space.id,
      bundle: { parking: true, transfer: true, ev: false },
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-04T10:00:00.000Z",
    });
    const transfer = getTransferByBooking(booking.id)!;

    const wrong = confirmHandover(transfer.id, "000000");
    expect(wrong.ok).toBe(false);

    const right = confirmHandover(transfer.id, transfer.handoverCode);
    expect(right.ok).toBe(true);
    if (right.ok) {
      expect(right.transfer.status).toBe("completed");
      expect(right.transfer.handoverConfirmedAt).toBeTruthy();
    }

    // cannot confirm twice
    const again = confirmHandover(transfer.id, transfer.handoverCode);
    expect(again.ok).toBe(false);
  });
});

describe("seed integrity", () => {
  it("ships the launch airports", () => {
    const slugs = getAirports().map((a) => a.slug);
    expect(slugs).toContain("heathrow");
    expect(slugs).toContain("dublin");
    expect(getAirports().length).toBeGreaterThanOrEqual(8);
  });
});
