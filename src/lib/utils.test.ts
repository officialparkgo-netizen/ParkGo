import { describe, it, expect } from "vitest";
import {
  daysBetween,
  isRangeBlocked,
  formatMoney,
  formatMoneyShort,
  initials,
  shortRef,
  storagePathFromPublicUrl,
} from "@/lib/utils";

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

describe("storagePathFromPublicUrl", () => {
  const base = "https://xyz.supabase.co/storage/v1/object/public";

  it("extracts the object path from a bucket public URL", () => {
    expect(storagePathFromPublicUrl(`${base}/space-photos/host_1/a.jpg`, "space-photos")).toBe(
      "host_1/a.jpg"
    );
  });

  it("strips query strings and decodes escapes", () => {
    expect(
      storagePathFromPublicUrl(`${base}/space-photos/h/a%20b.jpg?width=200`, "space-photos")
    ).toBe("h/a b.jpg");
  });

  it("refuses URLs from other buckets or hosts", () => {
    expect(storagePathFromPublicUrl(`${base}/kyc-docs/h/secret.pdf`, "space-photos")).toBeNull();
    expect(storagePathFromPublicUrl("https://evil.example/x.jpg", "space-photos")).toBeNull();
    expect(storagePathFromPublicUrl("drive-1", "space-photos")).toBeNull();
  });
});

describe("isRangeBlocked", () => {
  it("blocks a booking overlapping a blocked day", () => {
    expect(
      isRangeBlocked(["2026-08-10"], "2026-08-09T12:00:00Z", "2026-08-11T12:00:00Z")
    ).toBe(true);
    expect(
      isRangeBlocked(["2026-08-10"], "2026-08-10T08:00:00Z", "2026-08-10T18:00:00Z")
    ).toBe(true);
  });

  it("allows bookings that do not touch blocked days", () => {
    expect(
      isRangeBlocked(["2026-08-10"], "2026-08-11T00:00:00Z", "2026-08-14T00:00:00Z")
    ).toBe(false);
    expect(
      isRangeBlocked(["2026-08-10"], "2026-08-05T00:00:00Z", "2026-08-10T00:00:00Z")
    ).toBe(false);
    expect(isRangeBlocked([], "2026-08-05T00:00:00Z", "2026-08-20T00:00:00Z")).toBe(false);
    expect(isRangeBlocked(undefined, "2026-08-05T00:00:00Z", "2026-08-20T00:00:00Z")).toBe(false);
  });

  it("ignores malformed entries and bad dates", () => {
    expect(isRangeBlocked(["not-a-date"], "2026-08-05T00:00:00Z", "2026-08-20T00:00:00Z")).toBe(false);
    expect(isRangeBlocked(["2026-08-10"], "bad", "worse")).toBe(false);
  });
});
