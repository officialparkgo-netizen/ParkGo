import type { SupportTicket } from "@/types";
import { isSnoozed } from "@/lib/support-sla";

/**
 * Queue ordering and search.
 *
 * Order of business: live open tickets first (urgent ahead of normal), then
 * anything snoozed for later, then the resolved archive. Within a band the
 * newest is on top.
 */
export function sortQueue(list: SupportTicket[], now: number = Date.now()): SupportTicket[] {
  const rank = (t: SupportTicket) => {
    if (t.status !== "open") return 4;
    if (isSnoozed(t, now)) return 3;
    return t.priority === "urgent" ? 0 : 1;
  };
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt)
  );
}

/**
 * Free-text search across everything an agent might remember about a chat:
 * the person, the topic, the tags, and what was actually said. Every term has
 * to match somewhere, so extra words narrow rather than widen.
 */
export function searchTickets(list: SupportTicket[], query: string): SupportTicket[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  return list.filter((t) => {
    const hay = [
      t.name,
      t.email,
      t.topic,
      t.assignedTo ?? "",
      t.phone ?? "",
      ...(t.tags ?? []),
      ...t.transcript.map((m) => m.text),
      // Notes are agent-only, and this search only ever runs for agents.
      ...(t.notes ?? []).map((n) => n.text),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => hay.includes(term));
  });
}

/** Tags an agent can add with one click, beyond anything they type. */
export const SUGGESTED_TAGS = [
  "refund",
  "access",
  "transfer",
  "ev",
  "damage",
  "host",
  "billing",
  "callback",
] as const;

/** Normalise a typed tag: lowercase, dashed, short, and never empty. */
export function cleanTag(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function cleanTags(raw: string[]): string[] {
  const seen = new Set<string>();
  for (const tag of raw.map(cleanTag)) {
    if (tag) seen.add(tag);
    if (seen.size >= 8) break;
  }
  return [...seen];
}

/**
 * Spam brake. Counts what this sender already filed in the last hour — a
 * frustrated customer opening a second chat is normal; forty is not.
 */
export function tooManyRecent(recentCount: number, maxPerHour: number): boolean {
  return recentCount >= Math.max(1, maxPerHour);
}
