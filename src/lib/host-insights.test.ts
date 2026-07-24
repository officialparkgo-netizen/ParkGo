import { describe, expect, it } from "vitest";
import { areaMedianPrice, computeListingQuality } from "./host-insights";

const baseSpace = {
  photos: ["https://x/1.jpg", "https://x/2.jpg", "https://x/3.jpg"],
  accessRules: "Ring the bell at the black gate, park nose-in on the left bay.",
  pricePerHour: 300,
  cctv: true,
  liveCamera: false,
  covered: false,
  evCharger: { connector: "Type 2" as const, kw: 7, pricePerKwh: 38 },
  weekendUpliftPct: 10,
  customPrices: {},
  dimensions: { lengthM: 5, widthM: 2.5 },
};

describe("computeListingQuality", () => {
  it("scores 100 with every check passing", () => {
    const q = computeListingQuality(baseSpace, { bio: "Hi, I'm Tom." });
    expect(q.pct).toBe(100);
    expect(q.tips).toEqual([]);
  });

  it("returns tip keys for each failing check", () => {
    const q = computeListingQuality(
      {
        ...baseSpace,
        photos: ["drive-1"],
        accessRules: "short",
        pricePerHour: undefined,
        evCharger: null,
        weekendUpliftPct: 0,
      },
      null
    );
    // Failing: photos, bio, access, hourly, ev, pricing → 2 of 8 pass.
    expect(q.pct).toBe(25);
    expect(q.tips).toContain("host.quality.tip.pricing");
    expect(q.tips).toContain("host.quality.tip.photos");
    expect(q.tips).toContain("host.quality.tip.bio");
    expect(q.tips).toContain("host.quality.tip.access");
    expect(q.tips).toContain("host.quality.tip.hourly");
    expect(q.tips).toContain("host.quality.tip.ev");
  });

  it("counts custom prices as smart pricing", () => {
    const q = computeListingQuality(
      { ...baseSpace, weekendUpliftPct: 0, customPrices: { "2026-12-25": 2500 } },
      { bio: "x" }
    );
    expect(q.tips).not.toContain("host.quality.tip.pricing");
  });
});

describe("areaMedianPrice", () => {
  const own = { id: "s1", airportSlug: "heathrow" };
  it("takes the median of live peers at the same airport, excluding self", () => {
    expect(
      areaMedianPrice(own, [
        { id: "s1", airportSlug: "heathrow", status: "live", pricePerDay: 9999 },
        { id: "s2", airportSlug: "heathrow", status: "live", pricePerDay: 1000 },
        { id: "s3", airportSlug: "heathrow", status: "live", pricePerDay: 1400 },
        { id: "s4", airportSlug: "heathrow", status: "live", pricePerDay: 2000 },
        { id: "s5", airportSlug: "gatwick", status: "live", pricePerDay: 500 },
        { id: "s6", airportSlug: "heathrow", status: "paused", pricePerDay: 100 },
      ])
    ).toBe(1400);
  });

  it("averages the middle pair for an even count", () => {
    expect(
      areaMedianPrice(own, [
        { id: "s2", airportSlug: "heathrow", status: "live", pricePerDay: 1000 },
        { id: "s3", airportSlug: "heathrow", status: "live", pricePerDay: 2000 },
      ])
    ).toBe(1500);
  });

  it("returns null with no peers", () => {
    expect(areaMedianPrice(own, [])).toBeNull();
  });
});
