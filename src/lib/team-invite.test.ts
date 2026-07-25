import { describe, expect, it } from "vitest";
import {
  INVITE_TTL_MS,
  makeInviteToken,
  newInviteNonce,
  passwordProblem,
  peekInviteUserId,
  verifyInviteToken,
} from "./team-invite";

const NOW = 1_800_000_000_000;
const USER = "user_agent_sana";
const NONCE = "a".repeat(32);

describe("invite tokens", () => {
  it("round-trips with the matching nonce", () => {
    const token = makeInviteToken(USER, NONCE, NOW);
    expect(peekInviteUserId(token)).toBe(USER);
    expect(verifyInviteToken(token, NONCE, NOW + 1000)).toEqual({ ok: true, userId: USER });
  });

  it("expires after the TTL", () => {
    const token = makeInviteToken(USER, NONCE, NOW);
    expect(verifyInviteToken(token, NONCE, NOW + INVITE_TTL_MS - 1).ok).toBe(true);
    expect(verifyInviteToken(token, NONCE, NOW + INVITE_TTL_MS + 1)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("is single-use: a cleared nonce kills the link", () => {
    const token = makeInviteToken(USER, NONCE, NOW);
    expect(verifyInviteToken(token, null, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyInviteToken(token, "", NOW)).toEqual({ ok: false, reason: "invalid" });
  });

  it("a rotated nonce invalidates the older link", () => {
    const first = makeInviteToken(USER, NONCE, NOW);
    const second = newInviteNonce();
    expect(verifyInviteToken(first, second, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyInviteToken(makeInviteToken(USER, second, NOW), second, NOW).ok).toBe(true);
  });

  it("rejects tampering with the user id, expiry or signature", () => {
    const token = makeInviteToken(USER, NONCE, NOW);
    const [id, exp, mac] = token.split(".");
    expect(verifyInviteToken(`user_admin.${exp}.${mac}`, NONCE, NOW).ok).toBe(false);
    expect(verifyInviteToken(`${id}.${Number(exp) + 60_000}.${mac}`, NONCE, NOW).ok).toBe(false);
    expect(verifyInviteToken(`${id}.${exp}.${"f".repeat(32)}`, NONCE, NOW).ok).toBe(false);
  });

  it("rejects malformed input", () => {
    for (const bad of ["", "abc", "a.b", "a.b.c.d", undefined, null]) {
      expect(verifyInviteToken(bad, NONCE, NOW)).toEqual({ ok: false, reason: "malformed" });
    }
    expect(peekInviteUserId("nope")).toBeNull();
  });

  it("nonces are unique", () => {
    const set = new Set(Array.from({ length: 50 }, () => newInviteNonce()));
    expect(set.size).toBe(50);
  });
});

describe("password rules", () => {
  it("requires 8+ characters and a match", () => {
    expect(passwordProblem("short1", "short1")).toBe("short");
    expect(passwordProblem("longenough", "different")).toBe("mismatch");
    expect(passwordProblem("longenough", "longenough")).toBeNull();
  });
});
