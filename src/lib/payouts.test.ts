import { describe, expect, it } from "vitest";
import { isPayoutReleasable, payoutAvailableAt } from "./payouts";

describe("payout hold window", () => {
  const end = "2026-07-20T12:00:00.000Z";

  it("unlocks exactly holdDays after pick-up", () => {
    expect(payoutAvailableAt(end, 3).toISOString()).toBe("2026-07-23T12:00:00.000Z");
  });

  it("is held before the window elapses and released after", () => {
    const before = new Date("2026-07-22T12:00:00Z").getTime();
    const after = new Date("2026-07-23T12:00:01Z").getTime();
    expect(isPayoutReleasable(end, 3, before)).toBe(false);
    expect(isPayoutReleasable(end, 3, after)).toBe(true);
  });

  it("holdDays 0 releases immediately at pick-up", () => {
    expect(isPayoutReleasable(end, 0, new Date(end).getTime())).toBe(true);
  });
});
