import "server-only";
import { IS_LIVE } from "@/lib/config";

/**
 * Web push for the support team.
 *
 * Desktop notifications already cover an agent with the console open; this is
 * for the one who has closed the tab. Gated on VAPID keys being present, so
 * an unconfigured deployment quietly does nothing rather than erroring on
 * every ticket.
 *
 * Only staff subscribe — we do not push to customers.
 */
export interface PushSubscriptionRecord {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function isPushConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    !!process.env.VAPID_PRIVATE_KEY
  );
}

const g = globalThis as unknown as { __parkgoPush?: PushSubscriptionRecord[] };
const memory: PushSubscriptionRecord[] = (g.__parkgoPush ??= []);

export async function savePushSubscription(sub: PushSubscriptionRecord): Promise<boolean> {
  if (!IS_LIVE) {
    const i = memory.findIndex((x) => x.endpoint === sub.endpoint);
    if (i >= 0) memory[i] = sub;
    else memory.push(sub);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("push_subscriptions")
      .upsert(
        {
          user_id: sub.userId,
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        { onConflict: "endpoint" }
      );
    return !error;
  } catch {
    return false;
  }
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  if (!IS_LIVE) {
    const i = memory.findIndex((x) => x.endpoint === endpoint);
    if (i >= 0) memory.splice(i, 1);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("push_subscriptions").delete().eq("endpoint", endpoint);
    return true;
  } catch {
    return false;
  }
}

async function listSubscriptions(userIds: string[]): Promise<PushSubscriptionRecord[]> {
  if (userIds.length === 0) return [];
  if (!IS_LIVE) return memory.filter((x) => userIds.includes(x.userId));
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", userIds);
    return (data ?? []).map((r) => ({
      userId: r.user_id as string,
      endpoint: r.endpoint as string,
      p256dh: r.p256dh as string,
      auth: r.auth as string,
    }));
  } catch {
    return [];
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  urgent?: boolean;
}

/**
 * Send to every device the named staff have registered. Never throws — a
 * failed push must not take down whatever triggered it. Subscriptions the
 * browser has retired (404/410) are cleaned up as we go.
 */
export async function pushToUsers(userIds: string[], payload: PushPayload): Promise<number> {
  if (!isPushConfigured()) return 0;
  const subs = await listSubscriptions(userIds);
  if (subs.length === 0) return 0;

  try {
    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:info@parkgo.ai",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    const body = JSON.stringify(payload);
    let sent = 0;
    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body
          );
          sent += 1;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await removePushSubscription(sub.endpoint);
        }
      })
    );
    return sent;
  } catch {
    return 0;
  }
}
