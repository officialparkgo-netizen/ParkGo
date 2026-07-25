import type { SupportTicket } from "@/types";

/**
 * Service-level tracking for the support queue.
 *
 * The clock we care about is "how long has this person waited for a *human*",
 * so it starts at the ticket and stops at the first agent line. A snoozed
 * ticket is deliberately parked, so its clock is paused — otherwise every
 * follow-up scheduled for next week would breach overnight.
 */
export interface SlaState {
  /** Minutes the visitor has been waiting for a first human reply. */
  waitedMinutes: number;
  /** Minutes left before the promise is broken; negative once it is. */
  minutesLeft: number;
  breached: boolean;
  /** Breached, still unanswered, and nobody has been told yet. */
  needsEscalation: boolean;
}

/** Urgent chats get the configured budget; ordinary ones get triple. */
export function slaBudgetMinutes(ticket: SupportTicket, slaMinutes: number): number {
  const base = Math.max(1, slaMinutes);
  return ticket.priority === "urgent" ? base : base * 3;
}

export function slaState(
  ticket: SupportTicket,
  slaMinutes: number,
  now: number = Date.now()
): SlaState {
  const budget = slaBudgetMinutes(ticket, slaMinutes);
  // Answered or closed: the clock stopped, so there is nothing to breach.
  const stoppedAt = ticket.firstResponseAt ? +new Date(ticket.firstResponseAt) : null;
  const snoozed = isSnoozed(ticket, now);
  const end = stoppedAt ?? now;
  const waitedMinutes = Math.max(0, Math.round((end - +new Date(ticket.createdAt)) / 60_000));
  const minutesLeft = budget - waitedMinutes;

  const live = ticket.status === "open" && !stoppedAt && !snoozed;
  const breached = live && minutesLeft < 0;
  return {
    waitedMinutes,
    minutesLeft,
    breached,
    needsEscalation: breached && !ticket.escalatedAt,
  };
}

/** Parked for later — hidden from the live queue until it comes due. */
export function isSnoozed(ticket: SupportTicket, now: number = Date.now()): boolean {
  return !!ticket.snoozeUntil && +new Date(ticket.snoozeUntil) > now;
}

/** Snooze presets offered to agents, in hours. */
export const SNOOZE_CHOICES = [1, 4, 24, 72] as const;

export function snoozeUntil(hours: number, now: number = Date.now()): string {
  return new Date(now + Math.max(1, hours) * 3_600_000).toISOString();
}
