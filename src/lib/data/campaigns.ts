import type { Campaign } from "@/types";
import { IS_LIVE } from "@/lib/config";

/**
 * Campaign storage (migration 0029). A campaign is written once, then only
 * ever transitions: scheduled → sent, or scheduled → cancelled. The email
 * addresses themselves are never stored — the segment re-resolves at send
 * time.
 */

const g = globalThis as unknown as { __parkgoCampaigns?: Campaign[] };
const mock = (g.__parkgoCampaigns ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Campaign {
  return {
    id: r.id,
    subject: r.subject,
    message: r.message,
    segment: r.segment,
    sendAt: r.send_at ?? undefined,
    sentAt: r.sent_at ?? undefined,
    cancelledAt: r.cancelled_at ?? undefined,
    sentCount: r.sent_count ?? 0,
    recipientCount: r.recipient_count ?? 0,
    createdBy: r.created_by ?? "",
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function createCampaign(input: {
  subject: string;
  message: string;
  segment: string;
  sendAt?: string;
  recipientCount: number;
  createdBy: string;
}): Promise<Campaign | null> {
  if (!IS_LIVE) {
    const campaign: Campaign = {
      id: `cmp_${mock.length + 1}_${Date.now() % 100000}`,
      subject: input.subject,
      message: input.message,
      segment: input.segment,
      sendAt: input.sendAt,
      sentCount: 0,
      recipientCount: input.recipientCount,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    mock.unshift(campaign);
    return campaign;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("campaigns")
      .insert({
        subject: input.subject,
        message: input.message,
        segment: input.segment,
        send_at: input.sendAt ?? null,
        recipient_count: input.recipientCount,
        created_by: input.createdBy,
      })
      .select("*")
      .single();
    return !error && data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (!IS_LIVE) return [...mock];
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (!IS_LIVE) return mock.find((c) => c.id === id) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

/** Cancel a scheduled campaign. Sent mail cannot be unsent. */
export async function cancelCampaign(id: string): Promise<boolean> {
  if (!IS_LIVE) {
    const c = mock.find((x) => x.id === id);
    if (!c || c.sentAt || c.cancelledAt) return false;
    c.cancelledAt = new Date().toISOString();
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("campaigns")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("id", id)
      .is("sent_at", null)
      .is("cancelled_at", null)
      .select("id");
    return !error && (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function markCampaignSent(
  id: string,
  counts: { sent: number; recipients: number }
): Promise<void> {
  if (!IS_LIVE) {
    const c = mock.find((x) => x.id === id);
    if (c) {
      c.sentAt = new Date().toISOString();
      c.sentCount = counts.sent;
      c.recipientCount = counts.recipients;
    }
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin()
      .from("campaigns")
      .update({
        sent_at: new Date().toISOString(),
        sent_count: counts.sent,
        recipient_count: counts.recipients,
      })
      .eq("id", id);
  } catch {
    // The mail is out either way; the digest sweep skips sent_at != null rows
    // it cannot see, and re-sends are prevented by claimDueCampaigns.
  }
}

/**
 * Scheduled campaigns whose moment has passed. Live mode CLAIMS them (stamps
 * sent_at first) so two overlapping sweeps can never double-send; the real
 * counts are written after the send.
 */
export async function claimDueCampaigns(): Promise<Campaign[]> {
  const now = new Date().toISOString();
  if (!IS_LIVE) {
    const due = mock.filter(
      (c) => !c.sentAt && !c.cancelledAt && c.sendAt && c.sendAt <= now
    );
    for (const c of due) c.sentAt = now;
    return due;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("campaigns")
      .update({ sent_at: now })
      .lte("send_at", now)
      .is("sent_at", null)
      .is("cancelled_at", null)
      .select("*");
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}
