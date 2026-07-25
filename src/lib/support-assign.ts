import type { SupportTicket, User } from "@/types";

/**
 * Who should pick this one up.
 *
 * Least-loaded-first rather than strict round-robin: after a burst of tickets
 * the two are the same, but least-loaded self-corrects when someone clears
 * their queue or comes back from lunch, which plain rotation never does.
 *
 * Only agents who have marked themselves on duty are eligible. Full admins
 * count as on duty unless they explicitly opt out — they are the fallback so
 * a ticket is never left with nobody's name on it.
 */
export function onDuty(members: User[]): User[] {
  return members.filter((m) =>
    m.adminScope === "support" ? m.supportAvailable === true : m.supportAvailable !== false
  );
}

export function pickAssignee(
  members: User[],
  openTickets: SupportTicket[]
): User | null {
  const eligible = onDuty(members);
  if (eligible.length === 0) return null;

  const load = new Map<string, number>();
  for (const t of openTickets) {
    if (t.status !== "open" || !t.assignedTo) continue;
    load.set(t.assignedTo, (load.get(t.assignedTo) ?? 0) + 1);
  }

  // Prefer a dedicated agent over a full admin at equal load — admins have
  // the rest of the business to run.
  const rank = (m: User) => (m.adminScope === "support" ? 0 : 1);
  return [...eligible].sort(
    (a, b) =>
      (load.get(a.name) ?? 0) - (load.get(b.name) ?? 0) ||
      rank(a) - rank(b) ||
      a.name.localeCompare(b.name)
  )[0];
}
