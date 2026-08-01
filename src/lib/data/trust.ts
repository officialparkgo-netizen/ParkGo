import type { Host, TrustScore } from "@/types";
import { averageRating, computeTrustScore } from "@/lib/trust";

/**
 * A host's REAL trust score — the mock-era version read demo data whatever
 * the mode, which froze the number on live. This one reads what actually
 * happened through the data layer (mock and live alike): the reviews guests
 * left on this host's spaces, how many bookings finished versus cancelled,
 * the verification state, and how long they have hosted. A good review
 * raises it the day it lands; a bad one lowers it the same way.
 */
export async function trustForHost(
  host: Host
): Promise<TrustScore & { avgRating: number; reviewCount: number }> {
  const { getSpacesForHost } = await import("@/lib/data/hosts");
  const { listReviewsForHostSpaces } = await import("@/lib/data/reviews");
  const { listBookingsForHost } = await import("@/lib/data/bookings");

  const spaces = await getSpacesForHost(host.id).catch(() => []);
  const reviews = await listReviewsForHostSpaces(spaces.map((s) => s.id)).catch(() => []);
  const bookings = await listBookingsForHost(host.id).catch(() => []);

  const finished = bookings.filter(
    (b) => b.status === "completed" || b.status === "reviewed"
  ).length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  // No history yet is not the same as a bad record — start near the top.
  const reliability = finished + cancelled > 0 ? finished / (finished + cancelled) : 0.95;
  const tenureDays = Math.max(
    0,
    Math.floor((Date.now() - +new Date(host.joinedAt)) / 86_400_000)
  );

  const score = computeTrustScore({
    subjectId: host.id,
    subjectType: "host",
    verification: host.verificationStatus,
    reviews,
    reliability,
    tenureDays,
    updatedAt: new Date().toISOString(),
  });
  return { ...score, avgRating: averageRating(reviews), reviewCount: reviews.length };
}
