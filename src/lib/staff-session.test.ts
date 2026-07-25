import { describe, expect, it } from "vitest";
import { isIdleExpired, isStaffActivity, isStaffPath, STAFF_IDLE_MINUTES } from "./staff-session";

const NOW = Date.parse("2026-08-10T12:00:00Z");
const minutesAgo = (m: number) => String(NOW - m * 60_000);

describe("staff surface", () => {
  it("covers the admin console and the team pages only", () => {
    expect(isStaffPath("/admin")).toBe(true);
    expect(isStaffPath("/admin/support")).toBe(true);
    expect(isStaffPath("/team/login")).toBe(true);
    expect(isStaffPath("/app/bookings")).toBe(false);
    expect(isStaffPath("/host/today")).toBe(false);
    expect(isStaffPath("/")).toBe(false);
  });
});

describe("idle timeout", () => {
  it("starts the clock on the first staff view rather than bouncing", () => {
    expect(isIdleExpired(undefined, NOW)).toBe(false);
  });

  it("keeps an active session alive", () => {
    expect(isIdleExpired(minutesAgo(1), NOW)).toBe(false);
    expect(isIdleExpired(minutesAgo(STAFF_IDLE_MINUTES - 1), NOW)).toBe(false);
  });

  it("expires once the window passes", () => {
    expect(isIdleExpired(minutesAgo(STAFF_IDLE_MINUTES + 1), NOW)).toBe(true);
    expect(isIdleExpired(minutesAgo(600), NOW)).toBe(true);
  });

  it("treats a tampered or future stamp as expired", () => {
    expect(isIdleExpired("not-a-number", NOW)).toBe(true);
    expect(isIdleExpired("0", NOW)).toBe(true);
    expect(isIdleExpired(String(NOW + 86_400_000), NOW)).toBe(true);
  });

  it("honours a custom window", () => {
    expect(isIdleExpired(minutesAgo(10), NOW, 5)).toBe(true);
    expect(isIdleExpired(minutesAgo(10), NOW, 60)).toBe(false);
  });
});

describe("what counts as being at the desk", () => {
  it("treats an agent's live-chat poll as activity", () => {
    expect(isStaffActivity("/api/support/thread", "?id=sp_1")).toBe(true);
  });

  it("does not let a visitor's poll hold a staff session open", () => {
    expect(isStaffActivity("/api/support/thread", "")).toBe(false);
  });

  it("still counts ordinary staff pages", () => {
    expect(isStaffActivity("/admin/support", "")).toBe(true);
    expect(isStaffActivity("/app", "")).toBe(false);
  });
});
