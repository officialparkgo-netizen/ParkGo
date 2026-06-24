import { describe, it, expect } from "vitest";
import type { Review } from "@/types";
import { averageRating, computeTrustScore, trustBand } from "@/lib/trust";

function review(rating: number, i: number): Review {
  return {
    id: `r${i}`,
    bookingId: "b",
    authorId: "a",
    authorRole: "traveller",
    subjectId: "s",
    subjectType: "space",
    rating,
    comment: "",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("computeTrustScore", () => {
  const base = {
    subjectId: "s",
    subjectType: "host" as const,
    reliability: 1,
    tenureDays: 365,
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("stays within 0–100", () => {
    const score = computeTrustScore({
      ...base,
      verification: "approved",
      reviews: Array.from({ length: 12 }, (_, i) => review(5, i)),
    });
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it("rewards approved verification over unverified", () => {
    const reviews = [review(5, 1), review(4, 2)];
    const approved = computeTrustScore({ ...base, verification: "approved", reviews });
    const notStarted = computeTrustScore({ ...base, verification: "not_started", reviews });
    expect(approved.score).toBeGreaterThan(notStarted.score);
    expect(approved.components.verification).toBe(35);
    expect(notStarted.components.verification).toBe(0);
  });

  it("rewards better reviews", () => {
    const good = computeTrustScore({
      ...base,
      verification: "approved",
      reviews: Array.from({ length: 10 }, (_, i) => review(5, i)),
    });
    const poor = computeTrustScore({
      ...base,
      verification: "approved",
      reviews: Array.from({ length: 10 }, (_, i) => review(2, i)),
    });
    expect(good.components.reviews).toBeGreaterThan(poor.components.reviews);
  });
});

describe("averageRating", () => {
  it("returns 0 with no reviews", () => {
    expect(averageRating([])).toBe(0);
  });
  it("rounds to one decimal", () => {
    expect(averageRating([review(5, 1), review(4, 2)])).toBe(4.5);
  });
});

describe("trustBand", () => {
  it("bands scores into labels", () => {
    expect(trustBand(85).label).toBe("Excellent");
    expect(trustBand(65).label).toBe("Good");
    expect(trustBand(40).label).toBe("Building");
  });
});
