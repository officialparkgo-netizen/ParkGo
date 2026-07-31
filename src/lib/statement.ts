import type { Booking, Pence, Space } from "@/types";

/**
 * Host earnings statements: the /host/statement page and its CSV twin render
 * the same rows through these pure functions, so the two can never disagree.
 *
 * Amounts are the host's share of each booking, dated by drop-off — the same
 * maths the monthly statement has always used, now over three period shapes:
 * a month, a calendar year, or a UK tax year (6 April → 5 April) for a
 * self-assessment return.
 */

/** Booking statuses that count as earnings (mirrors the payouts page). */
export const EARNING_STATUSES = new Set(["paid", "active", "completed", "reviewed"]);

export type StatementPeriod =
  | { kind: "month"; month: string } // "YYYY-MM"
  | { kind: "calendar"; year: number }
  | { kind: "tax"; year: number }; // the year the tax year STARTS in

/** Inclusive start / exclusive end of a period, as ISO strings. */
export function periodRange(period: StatementPeriod): { startISO: string; endISO: string } {
  if (period.kind === "month") {
    const [y, m] = period.month.split("-").map(Number);
    return {
      startISO: new Date(Date.UTC(y, m - 1, 1)).toISOString(),
      endISO: new Date(Date.UTC(y, m, 1)).toISOString(),
    };
  }
  if (period.kind === "tax") {
    return {
      startISO: new Date(Date.UTC(period.year, 3, 6)).toISOString(),
      endISO: new Date(Date.UTC(period.year + 1, 3, 6)).toISOString(),
    };
  }
  return {
    startISO: new Date(Date.UTC(period.year, 0, 1)).toISOString(),
    endISO: new Date(Date.UTC(period.year + 1, 0, 1)).toISOString(),
  };
}

/** "2026/27" for tax years, "2026" for calendar years, null for months. */
export function periodYearLabel(period: StatementPeriod): string | null {
  if (period.kind === "tax") {
    return `${period.year}/${String((period.year + 1) % 100).padStart(2, "0")}`;
  }
  if (period.kind === "calendar") return String(period.year);
  return null;
}

export interface StatementRow {
  reference: string;
  spaceTitle: string;
  startAt: string;
  endAt: string;
  currency: "GBP" | "EUR";
  /** The host's share of this booking. */
  amount: Pence;
}

export interface HostStatement {
  rows: StatementRow[];
  /** Totals per currency — GBP and EUR listings can coexist. */
  totals: Map<string, Pence>;
}

/** The rows a period covers: earning statuses only, dated by drop-off. */
export function buildHostStatement(
  bookings: Booking[],
  spaces: Pick<Space, "id" | "title">[],
  period: StatementPeriod
): HostStatement {
  const { startISO, endISO } = periodRange(period);
  const spaceMap = new Map(spaces.map((s) => [s.id, s.title]));

  const rows = bookings
    .filter(
      (b) =>
        b.startAt >= startISO &&
        b.startAt < endISO &&
        EARNING_STATUSES.has(b.status) &&
        b.approval !== "pending"
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .map<StatementRow>((b) => ({
      reference: b.reference,
      spaceTitle: spaceMap.get(b.spaceId) ?? "—",
      startAt: b.startAt,
      endAt: b.endAt,
      currency: b.price.currency,
      amount: b.price.split.hostPayout,
    }));

  const totals = new Map<string, Pence>();
  for (const r of rows) totals.set(r.currency, (totals.get(r.currency) ?? 0) + r.amount);

  return { rows, totals };
}

/** The CSV rendering — quoted, Excel-safe, money in pounds not pence. */
export function statementCsv(statement: HostStatement): string {
  const money = (p: Pence) => (p / 100).toFixed(2);
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
  const head = ["Booking", "Space", "Drop-off", "Pick-up", "Currency", "Your earnings"];
  const lines = statement.rows.map((r) =>
    [
      esc(r.reference),
      esc(r.spaceTitle),
      r.startAt.slice(0, 10),
      r.endAt.slice(0, 10),
      r.currency,
      money(r.amount),
    ].join(",")
  );
  const totals = [...statement.totals.entries()].map(([currency, total]) =>
    [`TOTAL ${currency}`, "", "", "", currency, money(total)].join(",")
  );
  return [head.join(","), ...lines, ...totals].join("\r\n");
}
