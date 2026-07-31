import { describe, expect, it } from "vitest";
import type { Booking } from "@/types";
import {
  buildHostStatement,
  periodRange,
  periodYearLabel,
  statementCsv,
} from "@/lib/statement";

/** Minimal booking for statement maths. */
function booking(over: Partial<Booking> & { startAt: string }): Booking {
  return {
    id: over.id ?? `bk_${over.startAt}`,
    reference: over.reference ?? "PG-TEST1",
    travellerId: "user_t",
    spaceId: over.spaceId ?? "space_1",
    bundle: { parking: true, transfer: false, ev: false },
    startAt: over.startAt,
    endAt: over.endAt ?? over.startAt,
    status: over.status ?? "completed",
    approval: over.approval,
    price: over.price ?? {
      parking: 1000,
      transfer: 0,
      ev: 0,
      serviceFee: 299,
      total: 1299,
      split: { platform: 479, hostPayout: 820, driverPayout: 0 },
      currency: "GBP",
    },
    createdAt: over.startAt,
  } as Booking;
}

describe("periods", () => {
  it("calendar year runs Jan 1 to Jan 1", () => {
    const { startISO, endISO } = periodRange({ kind: "calendar", year: 2026 });
    expect(startISO).toBe("2026-01-01T00:00:00.000Z");
    expect(endISO).toBe("2027-01-01T00:00:00.000Z");
  });

  it("UK tax year runs 6 April to 6 April", () => {
    const { startISO, endISO } = periodRange({ kind: "tax", year: 2026 });
    expect(startISO).toBe("2026-04-06T00:00:00.000Z");
    expect(endISO).toBe("2027-04-06T00:00:00.000Z");
  });

  it("labels read like a tax return", () => {
    expect(periodYearLabel({ kind: "tax", year: 2026 })).toBe("2026/27");
    expect(periodYearLabel({ kind: "tax", year: 2029 })).toBe("2029/30");
    expect(periodYearLabel({ kind: "calendar", year: 2026 })).toBe("2026");
  });
});

describe("buildHostStatement", () => {
  const spaces = [{ id: "space_1", title: "Driveway A" }];

  it("keeps the tax-year boundary: 5 April in, 6 April in the next year", () => {
    const rows = [
      booking({ startAt: "2026-04-05T10:00:00.000Z", reference: "PG-APR5" }),
      booking({ startAt: "2026-04-06T10:00:00.000Z", reference: "PG-APR6" }),
      booking({ startAt: "2027-04-05T10:00:00.000Z", reference: "PG-NEXT5" }),
      booking({ startAt: "2027-04-06T10:00:00.000Z", reference: "PG-NEXT6" }),
    ];
    const s = buildHostStatement(rows, spaces, { kind: "tax", year: 2026 });
    expect(s.rows.map((r) => r.reference)).toEqual(["PG-APR6", "PG-NEXT5"]);
  });

  it("excludes cancelled, requested and pending-approval bookings", () => {
    const rows = [
      booking({ startAt: "2026-06-01T10:00:00.000Z", reference: "PG-OK" }),
      booking({ startAt: "2026-06-02T10:00:00.000Z", reference: "PG-CXL", status: "cancelled" }),
      booking({ startAt: "2026-06-03T10:00:00.000Z", reference: "PG-REQ", status: "requested" }),
      booking({
        startAt: "2026-06-04T10:00:00.000Z",
        reference: "PG-PEND",
        approval: "pending",
      }),
    ];
    const s = buildHostStatement(rows, spaces, { kind: "calendar", year: 2026 });
    expect(s.rows.map((r) => r.reference)).toEqual(["PG-OK"]);
    expect(s.totals.get("GBP")).toBe(820);
  });

  it("totals per currency separately", () => {
    const eur = booking({ startAt: "2026-07-01T10:00:00.000Z", reference: "PG-EUR" });
    eur.price = { ...eur.price, currency: "EUR" };
    const rows = [booking({ startAt: "2026-06-01T10:00:00.000Z" }), eur];
    const s = buildHostStatement(rows, spaces, { kind: "calendar", year: 2026 });
    expect(s.totals.get("GBP")).toBe(820);
    expect(s.totals.get("EUR")).toBe(820);
  });
});

describe("statementCsv", () => {
  it("quotes fields and appends currency totals", () => {
    const s = buildHostStatement(
      [booking({ startAt: "2026-06-01T10:00:00.000Z", reference: 'PG-"Q"' })],
      [{ id: "space_1", title: "Driveway A" }],
      { kind: "calendar", year: 2026 }
    );
    const csv = statementCsv(s);
    expect(csv).toContain('"PG-""Q"""');
    expect(csv).toContain("TOTAL GBP");
    expect(csv).toContain("8.20");
  });
});
