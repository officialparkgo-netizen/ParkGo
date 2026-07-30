import type { Notification } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getNotifications as mockGetNotifications,
  markNotificationsRead as mockMarkRead,
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

/** One note, many bells — the same row inserted for each recipient. */
export async function notifyUsers(
  userIds: string[],
  note: { title: string; body: string; kind: Notification["kind"] }
): Promise<void> {
  if (userIds.length === 0) return;
  if (!IS_LIVE) {
    const { addNotification } = await import("@/lib/data/store");
    for (const userId of userIds) addNotification({ userId, ...note });
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin()
      .from("notifications")
      .insert(
        userIds.map((id) => ({
          user_id: id,
          title: note.title,
          body: note.body,
          kind: note.kind,
        }))
      );
  } catch {
    // A lost bell must never break the flow that rang it.
  }
}

/** Opening the notifications page clears the unread badge. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!IS_LIVE) {
    mockMarkRead(userId);
    return;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  await supabaseAdmin()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}
