import { describe, it, expect } from "vitest";
import type { Space } from "@/types";
import {
  COMMISSION,
  SERVICE_FEE,
  TRANSFER_BASE_FARE,
  computeSplit,
  evCost,
  priceBundle,
  splitReconciles,
} from "@/lib/pricing";

const space: Space = {
  id: "space_test",
  hostId: "host_test",
  title: "Test space",
  airportSlug: "heathrow",
  approxArea: "Test",
  exactAddress: "1 Test St",
  lat: 51.47,
  lng: -0.45,
  distanceMiles: 1,
  driveMinutes: 5,
  dimensions: { lengthM: 5, widthM: 2.5 },
  maxVehicleSize: "large",
  evCharger: { connector: "Type 2", kw: 7, pricePerKwh: 40 },
  cctv: true,
  liveCamera: true,
  accessRules: "",
  photos: [],
  pricePerDay: 1000, // £10
  rating: 4.8,
  reviewCount: 10,
  status: "live",
  createdAt: "2025-01-01T00:00:00.000Z",
};

// 5-night stay
const start = "2026-07-01T10:00:00.000Z";
const end = "2026-07-06T10:00:00.000Z";

describe("priceBundle", () => {
  it("prices parking-only correctly", () => {
    const p = priceBundle(space, { parking: true, transfer: false, ev: false }, start, end);
    expect(p.parking).toBe(5000); // 5 × £10
    expect(p.transfer).toBe(0);
    expect(p.ev).toBe(0);
    expect(p.serviceFee).toBe(SERVICE_FEE);
    expect(p.total).toBe(5000 + SERVICE_FEE);
  });

  it("adds the transfer fare and EV top-up when bundled", () => {
    const p = priceBundle(space, { parking: true, transfer: true, ev: true }, start, end);
    expect(p.transfer).toBe(TRANSFER_BASE_FARE);
    expect(p.ev).toBe(evCost(space.evCharger)); // 40p × 30kWh = 1200
    expect(p.ev).toBe(1200);
    expect(p.total).toBe(5000 + TRANSFER_BASE_FARE + 1200 + SERVICE_FEE);
  });

  it("never charges fewer than one night", () => {
    const p = priceBundle(space, { parking: true, transfer: false, ev: false }, start, start);
    expect(p.parking).toBe(1000);
  });
});

describe("computeSplit", () => {
  it("reconciles: platform + host + driver === total", () => {
    const p = priceBundle(space, { parking: true, transfer: true, ev: true }, start, end);
    expect(splitReconciles(p)).toBe(true);
    expect(p.split.platform + p.split.hostPayout + p.split.driverPayout).toBe(p.total);
  });

  it("takes the configured commission per line + the full service fee", () => {
    const lines = { parking: 5000, transfer: 2400, ev: 1200, serviceFee: SERVICE_FEE };
    const split = computeSplit(lines);
    const parkingCommission = Math.round((6200 * COMMISSION.parkingBps) / 10_000);
    const transferCommission = Math.round((2400 * COMMISSION.transferBps) / 10_000);
    expect(split.platform).toBe(parkingCommission + transferCommission + SERVICE_FEE);
    expect(split.hostPayout).toBe(6200 - parkingCommission);
    expect(split.driverPayout).toBe(2400 - transferCommission);
  });

  it("gives the host the EV revenue (charger is on their property)", () => {
    const withEv = computeSplit({ parking: 5000, transfer: 0, ev: 1200, serviceFee: 0 });
    const withoutEv = computeSplit({ parking: 5000, transfer: 0, ev: 0, serviceFee: 0 });
    expect(withEv.hostPayout).toBeGreaterThan(withoutEv.hostPayout);
  });
});

describe("hourly stays", () => {
  const hourlySpace: Space = { ...space, pricePerHour: 300 }; // £3/h, £10/day

  it("bills short stays by the hour when a rate exists", () => {
    const p = priceBundle(
      hourlySpace,
      { parking: true, transfer: false, ev: false },
      "2026-07-01T09:00:00.000Z",
      "2026-07-01T11:30:00.000Z" // 2.5h → 3h
    );
    expect(p.parking).toBe(900);
    expect(splitReconciles(p)).toBe(true);
  });

  it("caps hourly parking at the day rate", () => {
    const p = priceBundle(
      hourlySpace,
      { parking: true, transfer: false, ev: false },
      "2026-07-01T08:00:00.000Z",
      "2026-07-01T18:00:00.000Z" // 10h × £3 = £30 → capped at £10 day rate
    );
    expect(p.parking).toBe(1000);
  });

  it("falls back to daily pricing without an hourly rate", () => {
    const p = priceBundle(
      space,
      { parking: true, transfer: false, ev: false },
      "2026-07-01T09:00:00.000Z",
      "2026-07-01T11:00:00.000Z"
    );
    expect(p.parking).toBe(1000); // 1 day minimum
  });

  it("bills stays over 24h daily even with an hourly rate", () => {
    const p = priceBundle(
      hourlySpace,
      { parking: true, transfer: false, ev: false },
      "2026-07-01T09:00:00.000Z",
      "2026-07-02T15:00:00.000Z" // 30h → 2 days
    );
    expect(p.parking).toBe(2000);
  });
});

describe("transfer trip types", () => {
  it("prices a return transfer at double the one-way fare", () => {
    const oneWay = priceBundle(
      space,
      { parking: true, transfer: true, ev: false },
      start,
      end
    );
    const rtn = priceBundle(
      space,
      { parking: true, transfer: true, ev: false, transferReturn: true },
      start,
      end
    );
    expect(oneWay.transfer).toBe(TRANSFER_BASE_FARE);
    expect(rtn.transfer).toBe(TRANSFER_BASE_FARE * 2);
    expect(splitReconciles(rtn)).toBe(true);
  });
});
