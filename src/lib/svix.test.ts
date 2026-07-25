import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { svixHeaders, verifySvixSignature } from "./svix";

const SECRET = `whsec_${Buffer.from("a-shared-signing-key").toString("base64")}`;
const NOW = Date.parse("2026-07-25T10:00:00Z");
const BODY = JSON.stringify({ type: "email.received", data: { email_id: "abc" } });

function sign(body: string, id: string, ts: number, secret = SECRET) {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  return createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
}

const headersFor = (ts: number, sig: string, id = "msg_1") => ({
  id,
  timestamp: String(ts),
  signature: `v1,${sig}`,
});

describe("svix signature", () => {
  const ts = Math.floor(NOW / 1000);

  it("accepts a correctly signed body", () => {
    const h = headersFor(ts, sign(BODY, "msg_1", ts));
    expect(verifySvixSignature(BODY, h, SECRET, NOW)).toBe(true);
  });

  it("rejects a body that was altered after signing", () => {
    const h = headersFor(ts, sign(BODY, "msg_1", ts));
    expect(verifySvixSignature(BODY + " ", h, SECRET, NOW)).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    const other = `whsec_${Buffer.from("someone-elses-key").toString("base64")}`;
    const h = headersFor(ts, sign(BODY, "msg_1", ts, other));
    expect(verifySvixSignature(BODY, h, SECRET, NOW)).toBe(false);
  });

  it("rejects a replay from outside the tolerance window", () => {
    const old = ts - 10 * 60;
    const h = headersFor(old, sign(BODY, "msg_1", old));
    expect(verifySvixSignature(BODY, h, SECRET, NOW)).toBe(false);
  });

  it("rejects a signature bound to a different message id", () => {
    const h = headersFor(ts, sign(BODY, "msg_OTHER", ts), "msg_1");
    expect(verifySvixSignature(BODY, h, SECRET, NOW)).toBe(false);
  });

  it("accepts any one of several signatures during a rotation", () => {
    const good = sign(BODY, "msg_1", ts);
    const h = { id: "msg_1", timestamp: String(ts), signature: `v1,notthisone v1,${good}` };
    expect(verifySvixSignature(BODY, h, SECRET, NOW)).toBe(true);
  });

  it("refuses missing headers, a bad version tag and an empty secret", () => {
    const good = sign(BODY, "msg_1", ts);
    expect(verifySvixSignature(BODY, { id: null, timestamp: String(ts), signature: `v1,${good}` }, SECRET, NOW)).toBe(false);
    expect(verifySvixSignature(BODY, headersFor(ts, good), "", NOW)).toBe(false);
    expect(
      verifySvixSignature(BODY, { id: "msg_1", timestamp: String(ts), signature: `v0,${good}` }, SECRET, NOW)
    ).toBe(false);
    expect(
      verifySvixSignature(BODY, { id: "msg_1", timestamp: "not-a-time", signature: `v1,${good}` }, SECRET, NOW)
    ).toBe(false);
  });
});

describe("header names", () => {
  it("reads the default svix- prefix", () => {
    const h = new Headers({ "svix-id": "a", "svix-timestamp": "1", "svix-signature": "v1,x" });
    expect(svixHeaders(h)).toEqual({ id: "a", timestamp: "1", signature: "v1,x" });
  });

  it("also reads the white-labelled webhook- prefix", () => {
    const h = new Headers({
      "webhook-id": "a",
      "webhook-timestamp": "1",
      "webhook-signature": "v1,x",
    });
    expect(svixHeaders(h)).toEqual({ id: "a", timestamp: "1", signature: "v1,x" });
  });

  it("reports nulls when nothing is signed", () => {
    expect(svixHeaders(new Headers())).toEqual({ id: null, timestamp: null, signature: null });
  });
});
