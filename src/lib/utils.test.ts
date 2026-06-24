import { describe, it, expect } from "vitest";
import { daysBetween, formatMoney, formatMoneyShort, initials, shortRef } from "@/lib/utils";

describe("formatMoney", () => {
  it("formats GBP and EUR in major units", () => {
    expect(formatMoney(4900)).toBe("£49.00");
    expect(formatMoney(4900, "EUR")).toBe("€49.00");
    expect(formatMoneyShort(4900)).toBe("£49");
    expect(formatMoneyShort(4950)).toBe("£49.50");
  });
});

describe("daysBetween", () => {
  it("counts nights with a minimum of one", () => {
    expect(daysBetween("2026-07-01", "2026-07-06")).toBe(5);
    expect(daysBetween("2026-07-01", "2026-07-01")).toBe(1);
  });
});

describe("shortRef", () => {
  it("is deterministic and prefixed", () => {
    expect(shortRef("seed-a")).toBe(shortRef("seed-a"));
    expect(shortRef("seed-a")).toMatch(/^PG-[A-Z0-9]{5}$/);
    expect(shortRef("seed-a")).not.toBe(shortRef("seed-b"));
  });
});

describe("initials", () => {
  it("takes up to two uppercase initials", () => {
    expect(initials("Aisha Khan")).toBe("AK");
    expect(initials("madonna")).toBe("M");
  });
});
