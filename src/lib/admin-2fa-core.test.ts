import { describe, expect, it } from "vitest";
import {
  ADMIN_2FA_SESSION_MS,
  ADMIN_2FA_WINDOW_MS,
  currentAdminCode,
  isValidAdmin2faSession,
  makeAdmin2faSession,
  verifyAdminCode,
} from "@/lib/admin-2fa-core";

const SECRET = "test-secret";
const NOW = 1_750_000_000_000;

describe("admin 2FA codes", () => {
  it("current-window code verifies", () => {
    const code = currentAdminCode("user_admin", NOW, SECRET);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyAdminCode("user_admin", code, NOW, SECRET)).toBe(true);
  });

  it("previous window still verifies; two windows back does not", () => {
    const prev = currentAdminCode("user_admin", NOW - ADMIN_2FA_WINDOW_MS, SECRET);
    expect(verifyAdminCode("user_admin", prev, NOW, SECRET)).toBe(true);
    const stale = currentAdminCode("user_admin", NOW - 2 * ADMIN_2FA_WINDOW_MS, SECRET);
    expect(verifyAdminCode("user_admin", stale, NOW, SECRET)).toBe(false);
  });

  it("rejects other users' codes and malformed input", () => {
    const code = currentAdminCode("user_admin", NOW, SECRET);
    expect(verifyAdminCode("user_other", code, NOW, SECRET)).toBe(false);
    expect(verifyAdminCode("user_admin", "abc123", NOW, SECRET)).toBe(false);
    expect(verifyAdminCode("user_admin", "", NOW, SECRET)).toBe(false);
  });
});

describe("admin 2FA session cookie", () => {
  it("round-trips and respects expiry", () => {
    const value = makeAdmin2faSession("user_admin", NOW, SECRET);
    expect(isValidAdmin2faSession(value, "user_admin", NOW, SECRET)).toBe(true);
    expect(
      isValidAdmin2faSession(value, "user_admin", NOW + ADMIN_2FA_SESSION_MS + 1, SECRET)
    ).toBe(false);
  });

  it("rejects tampering and wrong users", () => {
    const value = makeAdmin2faSession("user_admin", NOW, SECRET);
    expect(isValidAdmin2faSession(value, "user_other", NOW, SECRET)).toBe(false);
    const [uid, exp] = value.split(".");
    expect(
      isValidAdmin2faSession(`${uid}.${Number(exp) + 9999}.badsig`, "user_admin", NOW, SECRET)
    ).toBe(false);
    expect(isValidAdmin2faSession(undefined, "user_admin", NOW, SECRET)).toBe(false);
  });
});
