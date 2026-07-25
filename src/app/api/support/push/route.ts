import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isPushConfigured,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * Register (or drop) a staff device for push notifications.
 *
 * Staff only — we never push to customers, and the subscription is stored
 * against the signed-in admin rather than anything the client sends, so a
 * caller can't register a device under someone else's name.
 */
export async function GET() {
  return Response.json({
    enabled: isPushConfigured(),
    key: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "forbidden" }, { status: 403 });
  if (!isPushConfigured()) return Response.json({ error: "not enabled" }, { status: 404 });

  let body: {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
    unsubscribe?: unknown;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad payload" }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  if (!endpoint.startsWith("https://")) {
    return Response.json({ error: "bad endpoint" }, { status: 400 });
  }

  if (body.unsubscribe === true) {
    await removePushSubscription(endpoint);
    return Response.json({ ok: true });
  }

  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  if (!p256dh || !auth) return Response.json({ error: "bad keys" }, { status: 400 });

  const ok = await savePushSubscription({ userId: user.id, endpoint, p256dh, auth });
  return Response.json({ ok });
}
