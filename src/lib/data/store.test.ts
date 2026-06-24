import { describe, it, expect } from "vitest";
import {
  confirmHandover,
  createBooking,
  createSpace,
  getAirports,
  getBooking,
  getNotifications,
  getTransferByBooking,
  reviewSpace,
  searchSpaces,
} from "@/lib/data/store";

function pendingSpace(title: string) {
  return createSpace({
    hostId: "host_tom",
    title,
    airportSlug: "heathrow",
    approxArea: "Test area",
    exactAddress: "1 Test Road",
    pricePerDay: 1000,
    maxVehicleSize: "large",
    cctv: true,
    liveCamera: false,
    evCharger: null,
    accessRules: "",
    lengthM: 5,
    widthM: 2.5,
  });
}

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

describe("createSpace + reviewSpace (host listing lifecycle)", () => {
  it("new listings start pending_review and are not yet searchable", () => {
    const space = pendingSpace("Brand new bay");
    expect(space.status).toBe("pending_review");
    const live = searchSpaces({ airportSlug: "heathrow" }).map((r) => r.space.id);
    expect(live).not.toContain(space.id);
  });

  it("admin approval flips it to live and notifies the host", () => {
    const space = pendingSpace("Approve me");
    const before = getNotifications("user_host").length;
    const reviewed = reviewSpace(space.id, "approved", "user_admin");
    expect(reviewed?.status).toBe("live");
    // now searchable
    expect(searchSpaces({ airportSlug: "heathrow" }).map((r) => r.space.id)).toContain(space.id);
    // host got a notification
    const after = getNotifications("user_host");
    expect(after.length).toBe(before + 1);
    expect(after[0].title).toMatch(/approved/i);
  });

  it("admin rejection marks it rejected (and not searchable)", () => {
    const space = pendingSpace("Reject me");
    const reviewed = reviewSpace(space.id, "rejected", "user_admin");
    expect(reviewed?.status).toBe("rejected");
    expect(searchSpaces({ airportSlug: "heathrow" }).map((r) => r.space.id)).not.toContain(space.id);
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
