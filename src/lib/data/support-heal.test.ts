import { afterEach, describe, expect, it } from "vitest";
import type { SupportTicket } from "@/types";
import {
  createSupportTicket,
  getSupportTicketById,
  healSupportTicketTranslations,
} from "./support";

/**
 * The healer exists for tickets written before translation could happen —
 * a key added later, or a build that trusted the account language. Mock mode
 * with the demo provider stands in for the live pipeline: what matters here
 * is that the repair lands on the stored ticket, not what a real provider
 * would say.
 */

const at = () => new Date().toISOString();

function arabicTicket(): Promise<SupportTicket> {
  return createSupportTicket({
    name: "Hamid",
    email: `hamid-${Math.random().toString(36).slice(2, 8)}@example.com`,
    topic: "other",
    transcript: [
      { role: "bot", text: "Hi! How can I help?", at: at() },
      { role: "user", text: "تم تأكيد حجزك - نراك في المطار", at: at() },
    ],
  });
}

afterEach(() => {
  delete process.env.PARKGO_DEMO_TRANSLATE;
});

describe("healSupportTicketTranslations", () => {
  it("adds the missing rendering and the thread language, persisted", async () => {
    const ticket = await arabicTicket();
    expect(ticket.transcript[1].translated).toBeUndefined();
    expect(ticket.locale).toBeUndefined();

    process.env.PARKGO_DEMO_TRANSLATE = "1";
    await healSupportTicketTranslations(ticket);

    expect(ticket.locale).toBe("ar");
    expect(ticket.transcript[1].translated).toContain("no translation provider configured");
    // The original is untouched, and the repair reached the store.
    expect(ticket.transcript[1].text).toBe("تم تأكيد حجزك - نراك في المطار");
    const stored = await getSupportTicketById(ticket.id);
    expect(stored?.locale).toBe("ar");
    expect(stored?.transcript[1].translated).toBe(ticket.transcript[1].translated);
  });

  it("changes nothing when no provider is configured", async () => {
    const ticket = await arabicTicket();
    await healSupportTicketTranslations(ticket);
    expect(ticket.locale).toBeUndefined();
    expect(ticket.transcript[1].translated).toBeUndefined();
  });

  it("leaves a ticket with a known language and full renderings alone", async () => {
    process.env.PARKGO_DEMO_TRANSLATE = "1";
    const ticket = await createSupportTicket({
      name: "Eva",
      email: `eva-${Math.random().toString(36).slice(2, 8)}@example.com`,
      topic: "other",
      locale: "de",
      transcript: [
        { role: "user", text: "Wo ist mein Parkplatz bitte", translated: "Where is my parking space please", sourceLocale: "de", at: at() },
      ],
    });
    const before = JSON.stringify(ticket.transcript);
    await healSupportTicketTranslations(ticket);
    expect(ticket.locale).toBe("de");
    expect(JSON.stringify(ticket.transcript)).toBe(before);
  });
});
