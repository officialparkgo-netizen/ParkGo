import type { SupportTicket } from "@/types";

/**
 * Support desk numbers, derived from the ticket queue itself — no separate
 * event table to drift out of sync. Pure and synchronous so the admin page
 * can compute them inline and the maths stays testable.
 */
export interface SupportStats {
  total: number;
  open: number;
  urgent: number;
  /** Mean minutes from ticket created to the first agent line. */
  avgFirstReplyMinutes: number | null;
  /** Share of rated conversations marked happy, 0–100. */
  csatPct: number | null;
  csatCount: number;
  topTopic: { topic: string; count: number } | null;
  perAgent: { name: string; total: number; resolved: number }[];
}

export function supportStats(tickets: SupportTicket[]): SupportStats {
  const total = tickets.length;
  const open = tickets.filter((x) => x.status === "open").length;
  const urgent = tickets.filter((x) => x.priority === "urgent").length;

  const replies = tickets
    .filter((x) => x.firstResponseAt)
    .map((x) => (+new Date(x.firstResponseAt!) - +new Date(x.createdAt)) / 60_000)
    // A clock skew that puts the reply before the ticket is noise, not data.
    .filter((m) => m >= 0 && Number.isFinite(m));
  const avgFirstReplyMinutes = replies.length
    ? Math.round(replies.reduce((a, b) => a + b, 0) / replies.length)
    : null;

  const rated = tickets.filter((x) => x.csat === 1 || x.csat === -1);
  const csatPct = rated.length
    ? Math.round((rated.filter((x) => x.csat === 1).length / rated.length) * 100)
    : null;

  const byTopic = new Map<string, number>();
  for (const tk of tickets) {
    const key = tk.topic || "other";
    byTopic.set(key, (byTopic.get(key) ?? 0) + 1);
  }
  const top = [...byTopic.entries()].sort((a, b) => b[1] - a[1])[0];
  const topTopic = top ? { topic: top[0], count: top[1] } : null;

  const byAgent = new Map<string, { total: number; resolved: number }>();
  for (const tk of tickets) {
    if (!tk.assignedTo) continue;
    const row = byAgent.get(tk.assignedTo) ?? { total: 0, resolved: 0 };
    row.total += 1;
    if (tk.status === "resolved") row.resolved += 1;
    byAgent.set(tk.assignedTo, row);
  }
  const perAgent = [...byAgent.entries()]
    .map(([name, row]) => ({ name, ...row }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return { total, open, urgent, avgFirstReplyMinutes, csatPct, csatCount: rated.length, topTopic, perAgent };
}
