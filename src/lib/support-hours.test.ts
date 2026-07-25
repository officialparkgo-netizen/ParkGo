import { describe, expect, it } from "vitest";
import { deskState, detectPriority, formatWait, londonTime } from "./support-hours";

const HOURS = { supportOpenHour: 8, supportCloseHour: 20, supportReplyMinutes: 10 };
// 2026-01-15 is winter (UTC == London); 2026-07-15 is BST (London = UTC+1).
const at = (iso: string) => new Date(iso);

describe("desk hours", () => {
  it("is open inside the window and closed outside", () => {
    expect(deskState(HOURS, at("2026-01-15T09:00:00Z")).open).toBe(true);
    expect(deskState(HOURS, at("2026-01-15T19:59:00Z")).open).toBe(true);
    expect(deskState(HOURS, at("2026-01-15T20:00:00Z")).open).toBe(false);
    expect(deskState(HOURS, at("2026-01-15T07:59:00Z")).open).toBe(false);
  });

  it("follows British Summer Time", () => {
    // 07:30 UTC is 08:30 in London — open, even though UTC says 07:30.
    expect(londonTime(at("2026-07-15T07:30:00Z")).hour).toBe(8);
    expect(deskState(HOURS, at("2026-07-15T07:30:00Z")).open).toBe(true);
    expect(deskState(HOURS, at("2026-07-15T19:30:00Z")).open).toBe(false);
  });

  it("counts the minutes until opening", () => {
    const s = deskState(HOURS, at("2026-01-15T06:30:00Z"));
    expect(s.open).toBe(false);
    expect(s.opensInMinutes).toBe(90);
    const overnight = deskState(HOURS, at("2026-01-15T22:00:00Z"));
    expect(overnight.opensInMinutes).toBe(10 * 60);
  });

  it("treats equal hours as always open", () => {
    const always = { ...HOURS, supportOpenHour: 0, supportCloseHour: 0 };
    expect(deskState(always, at("2026-01-15T03:00:00Z")).open).toBe(true);
  });

  it("supports a window that wraps midnight", () => {
    const night = { ...HOURS, supportOpenHour: 20, supportCloseHour: 6 };
    expect(deskState(night, at("2026-01-15T23:00:00Z")).open).toBe(true);
    expect(deskState(night, at("2026-01-15T05:00:00Z")).open).toBe(true);
    expect(deskState(night, at("2026-01-15T12:00:00Z")).open).toBe(false);
  });

  it("formats the wait", () => {
    expect(formatWait(40)).toBe("40m");
    expect(formatWait(60)).toBe("1h");
    expect(formatWait(135)).toBe("2h 15m");
  });
});

describe("urgent detection", () => {
  it("flags emergencies in every supported language", () => {
    expect(detectPriority("My car is stuck behind a gate")).toBe("urgent");
    expect(detectPriority("URGENT — flight is boarding")).toBe("urgent");
    expect(detectPriority("میری گاڑی پھنس گئی ہے")).toBe("urgent");
    expect(detectPriority("Es ist ein Notfall")).toBe("urgent");
    expect(detectPriority("我被困住了")).toBe("urgent");
  });

  it("leaves ordinary questions alone", () => {
    expect(detectPriority("How much does parking cost?")).toBe("normal");
    expect(detectPriority("Can I change my dates?")).toBe("normal");
  });
});
