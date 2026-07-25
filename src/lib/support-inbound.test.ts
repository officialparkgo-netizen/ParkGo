import { describe, expect, it } from "vitest";
import { addressOf, refFromSubject, stripQuotedReply } from "./support-inbound";

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
