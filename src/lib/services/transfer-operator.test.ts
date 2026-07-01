import { describe, it, expect } from "vitest";
import { getOperatorJobs, getOperatorStatus } from "@/lib/services/transfer-operator";

describe("transfer operator API (mock)", () => {
  it("reports a connected operator with an SLA and rating", () => {
    const status = getOperatorStatus();
    expect(status.connected).toBe(true);
    expect(status.name.length).toBeGreaterThan(0);
    expect(status.slaMinutes).toBeGreaterThan(0);
    expect(status.rating).toBeGreaterThan(0);
  });

  it("surfaces live jobs with ETAs and handover state", () => {
    const jobs = getOperatorJobs();
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      expect(job.bookingRef).toBeTruthy();
      // ETA is a number for in-progress jobs, or null otherwise
      expect(job.etaMinutes === null || typeof job.etaMinutes === "number").toBe(true);
      expect(typeof job.handoverConfirmed).toBe("boolean");
    }
  });
});
