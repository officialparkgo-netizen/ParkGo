import type { Notification } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getNotifications as mockGetNotifications,
  unreadCount as mockUnreadCount,
} from "@/lib/data/store";

const COLS = "id, user_id, title, body, kind, read, created_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): Notification {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    body: r.body,
    kind: r.kind,
    read: r.read,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listNotificationsForUser(userId: string): Promise<Notification[]> {
  if (!IS_LIVE) return mockGetNotifications(userId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("notifications")
    .select(COLS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map(fromRow);
}

export async function unreadCountForUser(userId: string): Promise<number> {
  if (!IS_LIVE) return mockUnreadCount(userId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { count } = await supabaseAdmin()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}
