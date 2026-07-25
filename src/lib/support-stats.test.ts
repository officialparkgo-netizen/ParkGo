import { describe, expect, it } from "vitest";
import type { SupportTicket } from "@/types";
import { supportStats } from "./support-stats";

const mk = (p: Partial<SupportTicket>): SupportTicket => ({
  id: "sp_1",
  name: "Ada",
  email: "ada@example.com",
  topic: "cancel",
  transcript: [],
  status: "open",
  createdAt: "2026-07-01T10:00:00Z",
  ...p,
});

describe("supportStats", () => {
  it("counts the queue by status and priority", () => {
    const s = supportStats([
      mk({ id: "a" }),
      mk({ id: "b", status: "resolved" }),
      mk({ id: "c", priority: "urgent" }),
    ]);
    expect(s.total).toBe(3);
    expect(s.open).toBe(2);
    expect(s.urgent).toBe(1);
  });

  it("averages the first-reply time in minutes", () => {
    const s = supportStats([
      mk({ id: "a", firstResponseAt: "2026-07-01T10:10:00Z" }), // 10 min
      mk({ id: "b", firstResponseAt: "2026-07-01T10:30:00Z" }), // 30 min
      mk({ id: "c" }), // never answered — excluded, not counted as zero
    ]);
    expect(s.avgFirstReplyMinutes).toBe(20);
  });

  it("ignores a reply stamped before the ticket", () => {
    const s = supportStats([mk({ firstResponseAt: "2026-06-01T10:00:00Z" })]);
    expect(s.avgFirstReplyMinutes).toBeNull();
  });

  it("reports satisfaction only from rated conversations", () => {
    const s = supportStats([
      mk({ id: "a", csat: 1 }),
      mk({ id: "b", csat: 1 }),
      mk({ id: "c", csat: -1 }),
      mk({ id: "d" }),
    ]);
    expect(s.csatCount).toBe(3);
    expect(s.csatPct).toBe(67);
    expect(supportStats([mk({})]).csatPct).toBeNull();
  });

  it("finds the busiest topic", () => {
    const s = supportStats([
      mk({ id: "a", topic: "cancel" }),
      mk({ id: "b", topic: "payment" }),
      mk({ id: "c", topic: "payment" }),
    ]);
    expect(s.topTopic).toEqual({ topic: "payment", count: 2 });
  });

  it("breaks the load down per teammate, busiest first", () => {
    const s = supportStats([
      mk({ id: "a", assignedTo: "Sana", status: "resolved" }),
      mk({ id: "b", assignedTo: "Sana" }),
      mk({ id: "c", assignedTo: "Tom", status: "resolved" }),
      mk({ id: "d" }), // unassigned — nobody's number
    ]);
    expect(s.perAgent).toEqual([
      { name: "Sana", total: 2, resolved: 1 },
      { name: "Tom", total: 1, resolved: 1 },
    ]);
  });

  it("survives an empty queue", () => {
    const s = supportStats([]);
    expect(s).toMatchObject({ total: 0, avgFirstReplyMinutes: null, csatPct: null, topTopic: null });
    expect(s.perAgent).toEqual([]);
  });
});
