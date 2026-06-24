import type { Review, TrustScore, VerificationStatus } from "@/types";
import { clamp } from "@/lib/utils";

/**
 * Two-sided trust scoring (0–100). Feeds the quality score surfaced in search,
 * admin dashboards and payout priority. Weighted blend of four components:
 *   verification (35) · reviews (35) · reliability (20) · tenure (10)
 */
const WEIGHTS = { verification: 35, reviews: 35, reliability: 20, tenure: 10 };

export function computeTrustScore(input: {
  subjectId: string;
  subjectType: TrustScore["subjectType"];
  verification: VerificationStatus;
  reviews: Review[];
  /** completed / (completed + cancelled-by-subject), 0–1. */
  reliability: number;
  /** account age in days. */
  tenureDays: number;
  updatedAt: string;
}): TrustScore {
  const verification = verificationPoints(input.verification);
  const reviews = reviewPoints(input.reviews);
  const reliability = Math.round(clamp(input.reliability, 0, 1) * WEIGHTS.reliability);
  const tenure = Math.round(
    clamp(input.tenureDays / 365, 0, 1) * WEIGHTS.tenure
  );

  const score = clamp(verification + reviews + reliability + tenure, 0, 100);

  return {
    subjectId: input.subjectId,
    subjectType: input.subjectType,
    score,
    components: { verification, reviews, reliability, tenure },
    updatedAt: input.updatedAt,
  };
}

function verificationPoints(status: VerificationStatus): number {
  switch (status) {
    case "approved":
      return WEIGHTS.verification;
    case "in_review":
    case "pending":
      return Math.round(WEIGHTS.verification * 0.4);
    default:
      return 0;
  }
}

function reviewPoints(reviews: Review[]): number {
  if (reviews.length === 0) return Math.round(WEIGHTS.reviews * 0.5); // neutral start
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  // 5★ -> full marks, 1★ -> 0. Confidence ramps with volume (cap at 10).
  const quality = (avg - 1) / 4;
  const confidence = clamp(reviews.length / 10, 0.4, 1);
  return Math.round(quality * confidence * WEIGHTS.reviews);
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return (
    Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) /
    10
  );
}

export function trustBand(score: number): {
  label: string;
  tone: "go" | "brand" | "accent";
} {
  if (score >= 80) return { label: "Excellent", tone: "go" };
  if (score >= 60) return { label: "Good", tone: "brand" };
  return { label: "Building", tone: "accent" };
}
