import { describe, it, expect } from "vitest";
import { computeRiskFlags } from "@/lib/risk";

const NOW = new Date("2026-07-23T12:00:00Z").getTime();
const price = (total: number) =>
  ({ total, parking: total, transfer: 0, ev: 0, serviceFee: 0, currency: "GBP" as const, split: { platform: 0, hostPayout: total, driverPayout: 0 } });

describe("computeRiskFlags", () => {
  it("flags a heavy canceller", () => {
    const flags = computeRiskFlags({
      user: { email: "a@example.com", createdAt: "2025-01-01T00:00:00Z" },
      bookings: [
        { status: "cancelled", createdAt: "2026-01-01", price: price(5000) },
        { status: "cancelled", createdAt: "2026-02-01", price: price(5000) },
        { status: "paid", createdAt: "2026-03-01", price: price(5000) },
      ],
      now: NOW,
    });
    expect(flags.map((f) => f.key)).toContain("high_cancel_rate");
  });

  it("one cancellation alone is fine", () => {
    const flags = computeRiskFlags({
      user: { email: "a@example.com", createdAt: "2025-01-01T00:00:00Z" },
      bookings: [
        { status: "cancelled", createdAt: "2026-01-01", price: price(5000) },
        { status: "paid", createdAt: "2026-03-01", price: price(5000) },
      ],
      now: NOW,
    });
    expect(flags).toHaveLength(0);
  });

  it("flags disposable email domains", () => {
    const flags = computeRiskFlags({
      user: { email: "x@mailinator.com", createdAt: "2025-01-01T00:00:00Z" },
      bookings: [],
      now: NOW,
    });
    expect(flags[0]?.key).toBe("disposable_email");
    expect(flags[0]?.severity).toBe("high");
  });

  it("flags a brand-new account with a big booking", () => {
    const flags = computeRiskFlags({
      user: { email: "a@example.com", createdAt: "2026-07-23T00:00:00Z" },
      bookings: [{ status: "paid", createdAt: "2026-07-23", price: price(20_000) }],
      now: NOW,
    });
    expect(flags.map((f) => f.key)).toContain("new_account_high_value");
  });

  it("flags a previous suspension from the action log", () => {
    const flags = computeRiskFlags({
      user: { email: "a@example.com", createdAt: "2025-01-01T00:00:00Z" },
      bookings: [],
      actions: [{ action: "user.suspended" }, { action: "user.restored" }],
      now: NOW,
    });
    expect(flags.map((f) => f.key)).toContain("previously_suspended");
  });
});
