import "server-only";
import type { Campaign } from "@/types";
import { emailShell, isEmailConfigured, sendEmail } from "@/lib/email";
import { isSegmentKey, resolveSegmentEmails } from "@/lib/segments";

/**
 * Actually sending a campaign — shared by "send now" in the console and the
 * digest sweep that delivers scheduled ones. The segment resolves here, at
 * send time, so a Friday campaign goes to Friday's audience.
 */
export async function deliverCampaign(
  campaign: Pick<Campaign, "subject" | "message" | "segment">
): Promise<{ sent: number; recipients: number }> {
  if (!isSegmentKey(campaign.segment)) return { sent: 0, recipients: 0 };
  const emails = await resolveSegmentEmails(campaign.segment);
  if (!isEmailConfigured()) return { sent: 0, recipients: emails.length };

  const html = emailShell(
    `<p style="white-space:pre-line">${campaign.message.replace(/</g, "&lt;")}</p>`
  );
  let sent = 0;
  for (const to of emails) {
    try {
      if (await sendEmail(to, campaign.subject, html)) sent += 1;
    } catch {
      // one bad address must not stop the batch
    }
  }
  return { sent, recipients: emails.length };
}

/** Deliver every scheduled campaign whose moment has passed. */
export async function sweepDueCampaigns(): Promise<number> {
  const { claimDueCampaigns, markCampaignSent } = await import("@/lib/data/campaigns");
  const due = await claimDueCampaigns();
  let delivered = 0;
  for (const campaign of due) {
    try {
      const counts = await deliverCampaign(campaign);
      await markCampaignSent(campaign.id, counts);
      delivered += 1;
    } catch {
      // Claimed but failed: sent_at is already stamped, so it will not fire
      // twice. The console shows sent 0/N, which is the honest state.
    }
  }
  return delivered;
}
