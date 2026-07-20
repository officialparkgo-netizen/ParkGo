import { describe, expect, it } from "vitest";
import { SUPPORT_TOPICS, matchSupportIntent } from "@/lib/support-intents";

describe("support intent matching", () => {
  it("matches common questions to the right topic", () => {
    expect(matchSupportIntent("How do I cancel my booking?")?.id).toBe("cancel");
    expect(matchSupportIntent("can I get a refund")?.id).toBe("cancel");
    expect(matchSupportIntent("Is my car safe while I'm away?")?.id).toBe("safety");
    expect(matchSupportIntent("do you have CCTV")?.id).toBe("safety");
    expect(matchSupportIntent("My flight is delayed, what happens?")?.id).toBe("delay");
    expect(matchSupportIntent("Which airports do you cover?")?.id).toBe("airports");
    expect(matchSupportIntent("I want to rent my driveway")?.id).toBe("host");
    expect(matchSupportIntent("how much does it cost")?.id).toBe("payment");
  });

  it("returns null for questions it cannot answer (escalation path)", () => {
    expect(matchSupportIntent("The weather ruined my sandwich")).toBeNull();
    expect(matchSupportIntent("")).toBeNull();
    expect(matchSupportIntent("   ")).toBeNull();
  });

  it("every topic has an answer key and at least one keyword", () => {
    for (const topic of SUPPORT_TOPICS) {
      expect(topic.answerKey.length).toBeGreaterThan(0);
      expect(topic.keywords.length).toBeGreaterThan(0);
    }
  });
});
