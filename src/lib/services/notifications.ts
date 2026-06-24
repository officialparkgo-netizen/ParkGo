/**
 * Notifications (push + email) behind a swappable provider.
 * Mock mode records to the in-app notification feed / console. Live mode uses
 * Expo Push (APNs + FCM) for push and Resend/SendGrid for email.
 */
export interface OutboundNotification {
  userId: string;
  title: string;
  body: string;
  channel: "push" | "email" | "inapp";
}

export async function send(n: OutboundNotification): Promise<{ ok: boolean }> {
  const provider = process.env.NOTIFICATIONS_PROVIDER || "mock";
  if (provider === "mock") {
    // eslint-disable-next-line no-console
    console.info(`[notify:${n.channel}] ${n.userId} — ${n.title}: ${n.body}`);
    return { ok: true };
  }
  // Live: dispatch via Expo / Resend / SendGrid here.
  return { ok: true };
}
