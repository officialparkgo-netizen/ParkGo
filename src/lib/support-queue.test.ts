import { describe, expect, it } from "vitest";
import type { SupportTicket, User } from "@/types";
import { cleanTag, cleanTags, searchTickets, sortQueue, tooManyRecent } from "./support-queue";
import { isSnoozed, slaBudgetMinutes, slaState, snoozeUntil } from "./support-sla";
import { onDuty, pickAssignee } from "./support-assign";
import { detectLocale, detectThreadLocale } from "./support-lang";

const NOW = Date.parse("2026-08-10T12:00:00Z");
const ago = (mins: number) => new Date(NOW - mins * 60_000).toISOString();

const mk = (p: Partial<SupportTicket>): SupportTicket => ({
  id: "sp_1",
  name: "Ada",
  email: "ada@example.com",
  topic: "cancel",
  transcript: [],
  status: "open",
  createdAt: ago(30),
  ...p,
});

const user = (p: Partial<User>): User =>
  ({
    id: p.name ?? "u",
    role: "admin",
    name: "Someone",
    email: "s@parkgo.ai",
    locale: "en",
    createdAt: ago(0),
    ...p,
  }) as User;

describe("queue order", () => {
  it("puts live urgent first, then normal, then snoozed, then resolved", () => {
    const ordered = sortQueue(
      [
        mk({ id: "resolved", status: "resolved" }),
        mk({ id: "snoozed", snoozeUntil: new Date(NOW + 3_600_000).toISOString() }),
        mk({ id: "normal" }),
        mk({ id: "urgent", priority: "urgent" }),
      ],
      NOW
    );
    expect(ordered.map((x) => x.id)).toEqual(["urgent", "normal", "snoozed", "resolved"]);
  });

  it("returns a snooze that has come due to the live band", () => {
    // Once the snooze lapses the ticket is ordinary again, so it sorts purely
    // on age — here it is the newer of the two and leads the queue.
    const due = mk({ id: "due", createdAt: ago(5), snoozeUntil: ago(1) });
    expect(isSnoozed(due, NOW)).toBe(false);
    expect(sortQueue([mk({ id: "older", createdAt: ago(30) }), due], NOW)[0].id).toBe("due");
  });
});

describe("search", () => {
  const list = [
    mk({ id: "a", name: "Ada Lovelace", tags: ["refund"], transcript: [{ role: "user", text: "gate is locked" }] }),
    mk({
      id: "b",
      name: "Tom Reed",
      email: "tom@example.com",
      topic: "payment",
      notes: [{ at: ago(1), by: "Sana", text: "called twice" }],
    }),
  ];

  it("matches people, tags, transcripts and notes", () => {
    expect(searchTickets(list, "lovelace").map((x) => x.id)).toEqual(["a"]);
    expect(searchTickets(list, "refund").map((x) => x.id)).toEqual(["a"]);
    expect(searchTickets(list, "gate").map((x) => x.id)).toEqual(["a"]);
    expect(searchTickets(list, "called twice").map((x) => x.id)).toEqual(["b"]);
  });

  it("narrows with every extra term and passes an empty query through", () => {
    expect(searchTickets(list, "ada gate")).toHaveLength(1);
    expect(searchTickets(list, "ada payment")).toHaveLength(0);
    expect(searchTickets(list, "   ")).toHaveLength(2);
  });
});

describe("tags", () => {
  it("normalises whatever the agent types", () => {
    expect(cleanTag("  Refund Please! ")).toBe("refund-please");
    expect(cleanTag("!!!")).toBe("");
  });

  it("dedupes and caps the list", () => {
    expect(cleanTags(["Refund", "refund", "EV"])).toEqual(["refund", "ev"]);
    expect(cleanTags(Array.from({ length: 20 }, (_, i) => `t${i}`))).toHaveLength(8);
  });
});

describe("SLA", () => {
  it("gives urgent chats the tight budget and others triple", () => {
    expect(slaBudgetMinutes(mk({ priority: "urgent" }), 20)).toBe(20);
    expect(slaBudgetMinutes(mk({ priority: "normal" }), 20)).toBe(60);
  });

  it("breaches once an urgent chat waits past the budget", () => {
    const s = slaState(mk({ priority: "urgent", createdAt: ago(45) }), 20, NOW);
    expect(s.waitedMinutes).toBe(45);
    expect(s.minutesLeft).toBe(-25);
    expect(s.breached).toBe(true);
    expect(s.needsEscalation).toBe(true);
  });

  it("stops the clock at the first human reply", () => {
    const s = slaState(
      mk({ priority: "urgent", createdAt: ago(45), firstResponseAt: ago(40) }),
      20,
      NOW
    );
    expect(s.waitedMinutes).toBe(5);
    expect(s.breached).toBe(false);
  });

  it("never breaches a snoozed or resolved ticket", () => {
    const snoozedTicket = mk({
      priority: "urgent",
      createdAt: ago(600),
      snoozeUntil: new Date(NOW + 3_600_000).toISOString(),
    });
    expect(slaState(snoozedTicket, 20, NOW).breached).toBe(false);
    expect(slaState(mk({ createdAt: ago(600), status: "resolved" }), 20, NOW).breached).toBe(false);
  });

  it("only escalates once", () => {
    const t = mk({ priority: "urgent", createdAt: ago(45), escalatedAt: ago(10) });
    const s = slaState(t, 20, NOW);
    expect(s.breached).toBe(true);
    expect(s.needsEscalation).toBe(false);
  });

  it("snoozes into the future", () => {
    expect(+new Date(snoozeUntil(4, NOW))).toBe(NOW + 4 * 3_600_000);
  });
});

describe("auto-assignment", () => {
  const sana = user({ name: "Sana", adminScope: "support", supportAvailable: true });
  const omar = user({ name: "Omar", adminScope: "support", supportAvailable: true });
  const offDuty = user({ name: "Zara", adminScope: "support", supportAvailable: false });
  const boss = user({ name: "Boss" });

  it("counts an agent as on duty only when they say so, admins by default", () => {
    const names = onDuty([sana, offDuty, boss, user({ name: "Away", supportAvailable: false })]).map(
      (m) => m.name
    );
    expect(names).toEqual(["Sana", "Boss"]);
  });

  it("hands the ticket to the least-loaded agent", () => {
    const picked = pickAssignee(
      [sana, omar],
      [mk({ id: "1", assignedTo: "Sana" }), mk({ id: "2", assignedTo: "Sana" })]
    );
    expect(picked?.name).toBe("Omar");
  });

  it("prefers an agent over a full admin at equal load", () => {
    expect(pickAssignee([boss, sana], [])?.name).toBe("Sana");
  });

  it("ignores resolved tickets when weighing the load", () => {
    const picked = pickAssignee(
      [sana, omar],
      [mk({ id: "1", assignedTo: "Omar", status: "resolved" })]
    );
    expect(picked?.name).toBe("Omar");
  });

  it("returns nobody when the whole team is off duty", () => {
    expect(pickAssignee([offDuty], [])).toBeNull();
  });
});

describe("language detection", () => {
  it("reads the script for the non-Latin locales", () => {
    expect(detectLocale("میری گاڑی کہاں ہے")).toBe("ur");
    expect(detectLocale("मेरी बुकिंग कहाँ है")).toBe("hi");
    expect(detectLocale("我的预订在哪里")).toBe("zh");
  });

  it("splits the Arabic script: Urdu-only letters decide Urdu, else Arabic", () => {
    // Plain Arabic — no ٹ/ڈ/ے/ک/ی extensions anywhere.
    expect(detectLocale("أين سيارتي من فضلك")).toBe("ar");
    expect(detectLocale("لا أستطيع إلغاء الحجز")).toBe("ar");
    // The same question in Urdu carries ک/ی/ے forms Arabic never uses.
    expect(detectLocale("میری بکنگ کہاں ہے")).toBe("ur");
  });

  it("needs real evidence for German and defaults to English", () => {
    expect(detectLocale("Wo ist mein Parkplatz bitte")).toBe("de");
    expect(detectLocale("Können Sie helfen")).toBe("de");
    expect(detectLocale("Where is my parking space")).toBe("en");
    expect(detectLocale("")).toBe("en");
  });

  it("lets a saved locale break ties, but never overrule the script", () => {
    // An account set to Urdu writing Latin text: the saved choice decides.
    expect(detectLocale("thanks, that worked", "ur")).toBe("ur");
    // An account set to English writing Arabic: what was typed decides.
    expect(detectLocale("أين سيارتي من فضلك", "en")).toBe("ar");
    expect(detectLocale("我的预订在哪里", "ur")).toBe("zh");
  });

  it("judges a thread by what the visitor said, not the bot", () => {
    expect(
      detectThreadLocale([
        { role: "bot", text: "Hi! How can I help?" },
        { role: "user", text: "میری بکنگ منسوخ کرنی ہے" },
      ])
    ).toBe("ur");
  });
});

describe("rate limiting", () => {
  it("allows a frustrated second chat but not a flood", () => {
    expect(tooManyRecent(1, 6)).toBe(false);
    expect(tooManyRecent(5, 6)).toBe(false);
    expect(tooManyRecent(6, 6)).toBe(true);
  });
});
