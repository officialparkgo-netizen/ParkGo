import type { listAllBookings } from "@/lib/data/bookings";
import type { listAllVerificationsLive } from "@/lib/data/verifications";
import type { listAllReviews } from "@/lib/data/reviews";

export interface AuditEntry {
  label: string;
  at: string;
}

/** Flatten bookings/verifications/reviews into a newest-first audit feed. */
export function buildAuditFeed(
  {
    bookings,
    verifications,
    reviews,
  }: {
    bookings: Awaited<ReturnType<typeof listAllBookings>>;
    verifications: Awaited<ReturnType<typeof listAllVerificationsLive>>;
    reviews: Awaited<ReturnType<typeof listAllReviews>>;
  },
  limit = 12
): AuditEntry[] {
  const entries: AuditEntry[] = [];
  bookings.forEach((b) =>
    entries.push({ label: `Booking ${b.reference} created (${b.status})`, at: b.createdAt })
  );
  verifications.forEach((v) => {
    if (v.submittedAt)
      entries.push({ label: `Verification submitted · ${v.subjectType}`, at: v.submittedAt });
    if (v.reviewedAt)
      entries.push({ label: `Verification ${v.status} · ${v.subjectType}`, at: v.reviewedAt });
  });
  reviews.forEach((r) =>
    entries.push({ label: `Review left (${r.rating}★) on ${r.subjectType}`, at: r.createdAt })
  );
  return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, limit);
}
