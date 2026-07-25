import { describe, expect, it } from "vitest";
import {
  addressOf,
  htmlToText,
  normaliseInbound,
  refFromSubject,
  stripQuotedReply,
} from "./support-inbound";

describe("inbound email parsing", () => {
  it("finds the ticket reference in a reply subject", () => {
    expect(refFromSubject("Re: ParkGo support · SP-1A2B3C")).toBe("SP-1A2B3C");
    expect(refFromSubject("re: parkgo support · sp-9f8e7d")).toBe("SP-9F8E7D");
    expect(refFromSubject("Question about parking")).toBeNull();
  });

  it("extracts the address from a display-name header", () => {
    expect(addressOf("Ada Lovelace <Ada@Example.com>")).toBe("ada@example.com");
    expect(addressOf(" plain@example.com ")).toBe("plain@example.com");
  });

  it("drops the quoted history so threads don't double up", () => {
    const body = [
      "Still stuck at the gate, nobody came.",
      "",
      "On Mon, 10 Aug 2026 at 14:02, ParkGo <info@parkgo.ai> wrote:",
      "> We're sending someone now.",
      "> Thanks for your patience.",
    ].join("\n");
    expect(stripQuotedReply(body)).toBe("Still stuck at the gate, nobody came.");
  });

  it("handles Outlook and German clients too", () => {
    expect(
      stripQuotedReply("Danke!\n\n-----Original Message-----\nFrom: ParkGo")
    ).toBe("Danke!");
    expect(
      stripQuotedReply("Alles gut.\n\nAm 10.08.2026 schrieb ParkGo:\n> Hallo")
    ).toBe("Alles gut.");
  });

  it("leaves an unquoted message alone and caps the length", () => {
    expect(stripQuotedReply("Just a short note.")).toBe("Just a short note.");
    expect(stripQuotedReply("x".repeat(5000))).toHaveLength(2000);
  });
});

describe("provider payload shapes", () => {
  it("reads Resend's email.received metadata and asks for the body", () => {
    const m = normaliseInbound({
      type: "email.received",
      created_at: "2026-07-25T10:00:00.000Z",
      data: {
        email_id: "a1b2c3",
        from: "Ada Lovelace <ada@example.com>",
        to: ["support@parkgo.ai"],
        subject: "Re: ParkGo support · SP-1A2B3C",
      },
    });
    expect(m).toEqual({
      from: "ada@example.com",
      subject: "Re: ParkGo support · SP-1A2B3C",
      text: "",
      emailId: "a1b2c3",
    });
  });

  it("ignores Resend's delivery events rather than erroring on them", () => {
    expect(normaliseInbound({ type: "email.delivered", data: { from: "a@b.c" } })).toBeNull();
    expect(normaliseInbound({ type: "contact.created", data: {} })).toBeNull();
    expect(normaliseInbound(null)).toBeNull();
  });

  it("accepts a plain {from, subject, text} post from any other provider", () => {
    expect(normaliseInbound({ from: "tom@example.com", subject: "hi", text: "hello" })).toEqual({
      from: "tom@example.com",
      subject: "hi",
      text: "hello",
    });
  });

  it("falls back to the HTML part when there is no plain text", () => {
    const m = normaliseInbound({
      from: "tom@example.com",
      subject: "hi",
      html: "<p>Still stuck.</p><p>Please call &amp; help</p>",
    });
    expect(m?.text).toBe("Still stuck.\nPlease call & help");
  });

  it("refuses a payload with no sender", () => {
    expect(normaliseInbound({ subject: "hi", text: "hello" })).toBeNull();
    expect(normaliseInbound({ type: "email.received", data: { subject: "hi" } })).toBeNull();
  });
});

describe("html to text", () => {
  it("drops markup, scripts and entities", () => {
    expect(htmlToText("<style>p{}</style><div>Hi<br/>there</div>")).toBe("Hi\nthere");
    expect(htmlToText("<p>a &lt; b &amp;&nbsp;c</p>")).toBe("a < b & c");
  });
});
