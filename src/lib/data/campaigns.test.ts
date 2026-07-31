import { describe, expect, it } from "vitest";
import {
  cancelCampaign,
  claimDueCampaigns,
  createCampaign,
  getCampaign,
  listCampaigns,
  markCampaignSent,
} from "@/lib/data/campaigns";

/** The campaign lifecycle in mock mode: scheduled → claimed once → sent. */
describe("campaigns", () => {
  it("stores, lists newest-first, and cancels scheduled ones", async () => {
    const a = await createCampaign({
      subject: "A",
      message: "m",
      segment: "hosts",
      sendAt: new Date(Date.now() + 3_600_000).toISOString(),
      recipientCount: 5,
      createdBy: "Test",
    });
    expect(a).not.toBeNull();
    expect((await listCampaigns())[0].id).toBe(a!.id);

    expect(await cancelCampaign(a!.id)).toBe(true);
    expect((await getCampaign(a!.id))?.cancelledAt).toBeTruthy();
    // A second cancel (or cancelling after send) refuses.
    expect(await cancelCampaign(a!.id)).toBe(false);
  });

  it("claims due campaigns exactly once", async () => {
    const due = await createCampaign({
      subject: "Due",
      message: "m",
      segment: "hosts",
      sendAt: new Date(Date.now() - 1000).toISOString(),
      recipientCount: 2,
      createdBy: "Test",
    });
    const future = await createCampaign({
      subject: "Future",
      message: "m",
      segment: "hosts",
      sendAt: new Date(Date.now() + 3_600_000).toISOString(),
      recipientCount: 2,
      createdBy: "Test",
    });

    const claimed = await claimDueCampaigns();
    expect(claimed.map((c) => c.id)).toContain(due!.id);
    expect(claimed.map((c) => c.id)).not.toContain(future!.id);

    // Claiming stamps sentAt, so a second sweep finds nothing.
    expect((await claimDueCampaigns()).map((c) => c.id)).not.toContain(due!.id);

    await markCampaignSent(due!.id, { sent: 2, recipients: 2 });
    const sent = await getCampaign(due!.id);
    expect(sent?.sentCount).toBe(2);
    expect(sent?.sentAt).toBeTruthy();
  });
});
