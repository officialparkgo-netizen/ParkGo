import { describe, expect, it } from "vitest";
import { distanceKm, nearestDestination, resolveSearchQuery } from "./geo-search";

const dests = [
  { slug: "heathrow", name: "Heathrow Airport", code: "LHR", kind: "airport" },
  { slug: "gatwick", name: "Gatwick Airport", code: "LGW", kind: "airport" },
  { slug: "london-city-centre", name: "London City Centre", code: "LON", kind: "city" },
];

const spaces = [
  {
    id: "s1",
    airportSlug: "gatwick",
    title: "Covered barn spot",
    approxArea: "Lowfield Heath",
    exactAddress: "2 Charlwood Rd, Crawley RH11 0PT",
    status: "live" as const,
  },
  {
    id: "s2",
    airportSlug: "heathrow",
    title: "Tom's driveway",
    approxArea: "Hounslow West",
    exactAddress: "14 Vicarage Farm Rd, Hounslow TW3 4NW",
    status: "live" as const,
  },
  {
    id: "s3",
    airportSlug: "heathrow",
    title: "Paused yard",
    approxArea: "Hounslow East",
    exactAddress: "9 Bath Rd, Hounslow TW3 3BX",
    status: "paused" as const,
  },
];

describe("resolveSearchQuery", () => {
  it("matches an airport by code (case-insensitive)", () => {
    expect(resolveSearchQuery("lgw", dests, spaces)).toEqual({
      kind: "destination",
      slug: "gatwick",
    });
  });

  it("matches a destination by partial name", () => {
    expect(resolveSearchQuery("Gatwick", dests, spaces)).toEqual({
      kind: "destination",
      slug: "gatwick",
    });
    expect(resolveSearchQuery("london gatwick airport", dests, spaces)).toEqual({
      kind: "destination",
      slug: "gatwick",
    });
  });

  it("matches a full postcode with or without the space", () => {
    for (const q of ["RH11 0PT", "rh110pt"]) {
      expect(resolveSearchQuery(q, dests, spaces)).toEqual({
        kind: "spaces",
        slug: "gatwick",
        spaceIds: ["s1"],
      });
    }
  });

  it("matches an area name and skips paused spaces", () => {
    expect(resolveSearchQuery("Hounslow", dests, spaces)).toEqual({
      kind: "spaces",
      slug: "heathrow",
      spaceIds: ["s2"],
    });
  });

  it("returns none for gibberish and too-short queries", () => {
    expect(resolveSearchQuery("zzzqqq", dests, spaces).kind).toBe("none");
    expect(resolveSearchQuery("rh", dests, spaces).kind).toBe("none");
    expect(resolveSearchQuery("  ", dests, spaces).kind).toBe("none");
  });
});

describe("nearestDestination / distanceKm", () => {
  const points = [
    { slug: "heathrow", lat: 51.47, lng: -0.4543 },
    { slug: "gatwick", lat: 51.1537, lng: -0.1821 },
    { slug: "manchester", lat: 53.3654, lng: -2.2728 },
  ];
  it("picks the closest served destination for a Crawley postcode", () => {
    // RH11 (Crawley) sits on Gatwick's doorstep.
    expect(nearestDestination(51.11, -0.19, points)?.slug).toBe("gatwick");
  });
  it("picks Manchester for an M1 point", () => {
    expect(nearestDestination(53.48, -2.24, points)?.slug).toBe("manchester");
  });
  it("distance is symmetric and zero to itself", () => {
    expect(distanceKm(51.47, -0.45, 51.47, -0.45)).toBe(0);
    const ab = distanceKm(51.47, -0.45, 53.36, -2.27);
    expect(Math.round(ab)).toBeGreaterThan(200);
    expect(distanceKm(53.36, -2.27, 51.47, -0.45)).toBeCloseTo(ab, 8);
  });
});
