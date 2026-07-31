import "server-only";

/**
 * Campaign audiences. Each segment resolves to a de-duplicated email list at
 * SEND time — a campaign scheduled for Friday goes to Friday's segment, not
 * to a snapshot of whoever matched when it was written.
 */

export const SEGMENT_KEYS = [
  "travellers",
  "hosts",
  "waitlist",
  "inactive",
  "upcoming",
  "blog",
] as const;
export type SegmentKey = (typeof SEGMENT_KEYS)[number];

export function isSegmentKey(v: string): v is SegmentKey {
  return (SEGMENT_KEYS as readonly string[]).includes(v);
}

const INACTIVE_DAYS = 180;

/** Emails for a segment, deduped, lowercase, capped to keep sends bounded. */
export async function resolveSegmentEmails(key: SegmentKey): Promise<string[]> {
  const emails = await rawEmails(key);
  return [...new Set(emails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))]
    .filter((e) => !e.endsWith("@removed.parkgo.ai")) // GDPR-deleted accounts
    .slice(0, 500);
}

async function rawEmails(key: SegmentKey): Promise<string[]> {
  switch (key) {
    case "waitlist": {
      const { listWaitlist } = await import("@/lib/data/waitlist");
      return (await listWaitlist().catch(() => [])).map((w) => w.email);
    }
    case "blog": {
      const { listActiveSubscribers } = await import("@/lib/data/blog");
      return listActiveSubscribers();
    }
    case "hosts": {
      const { listAllUsers } = await import("@/lib/data/users");
      return (await listAllUsers())
        .filter((u) => u.role === "host" && !u.suspended)
        .map((u) => u.email);
    }
    case "travellers": {
      const { listAllUsers } = await import("@/lib/data/users");
      return (await listAllUsers())
        .filter((u) => u.role === "traveller" && !u.suspended)
        .map((u) => u.email);
    }
    case "inactive":
    case "upcoming": {
      const { listAllUsers } = await import("@/lib/data/users");
      const { listAllBookings } = await import("@/lib/data/bookings");
      const [users, bookings] = await Promise.all([listAllUsers(), listAllBookings()]);
      const now = Date.now();

      // Last trip end + next upcoming trip, per traveller, one pass.
      const lastEnd = new Map<string, number>();
      const hasUpcoming = new Set<string>();
      for (const b of bookings) {
        if (b.status === "cancelled") continue;
        const end = new Date(b.endAt).getTime();
        if (end > (lastEnd.get(b.travellerId) ?? 0)) lastEnd.set(b.travellerId, end);
        if (
          (b.status === "paid" || b.status === "active") &&
          new Date(b.startAt).getTime() > now
        ) {
          hasUpcoming.add(b.travellerId);
        }
      }

      const travellers = users.filter((u) => u.role === "traveller" && !u.suspended);
      if (key === "upcoming") {
        return travellers.filter((u) => hasUpcoming.has(u.id)).map((u) => u.email);
      }
      // Inactive: has booked before, but nothing in the last six months, and
      // nothing coming up. Never-booked signups belong to onboarding flows,
      // not a "we miss you" campaign.
      const cutoff = now - INACTIVE_DAYS * 86_400_000;
      return travellers
        .filter((u) => {
          const end = lastEnd.get(u.id);
          return end !== undefined && end < cutoff && !hasUpcoming.has(u.id);
        })
        .map((u) => u.email);
    }
  }
}

/** Audience sizes for the composer's segment picker. */
export async function segmentCounts(): Promise<Record<SegmentKey, number>> {
  const entries = await Promise.all(
    SEGMENT_KEYS.map(async (key) => {
      const emails = await resolveSegmentEmails(key).catch(() => []);
      return [key, emails.length] as const;
    })
  );
  return Object.fromEntries(entries) as Record<SegmentKey, number>;
}
