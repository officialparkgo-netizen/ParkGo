import { getPlatformSettings } from "@/lib/data/settings";

/**
 * Instant ops ping to a Slack-compatible webhook (settings or OPS_WEBHOOK_URL).
 * Fire-and-forget: a missing URL or a slow endpoint must never block the flow.
 */
export async function sendOpsAlert(text: string): Promise<void> {
  try {
    const settings = await getPlatformSettings();
    const url = settings.opsWebhookUrl || process.env.OPS_WEBHOOK_URL;
    if (!url || !/^https:\/\//.test(url)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 500) }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // best-effort only
  }
}
