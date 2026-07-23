import type { AdminAction, User } from "@/types";
import { IS_LIVE } from "@/lib/config";

// Mock store on globalThis (same pattern as support tickets) so the log
// survives HMR in dev and stays per-process in demos.
const g = globalThis as unknown as { __parkgoAdminActions?: AdminAction[] };
const mockActions: AdminAction[] = (g.__parkgoAdminActions ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): AdminAction {
  return {
    id: r.id,
    adminId: r.admin_id,
    adminName: r.admin_name ?? "Admin",
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id ?? "",
    detail: r.detail ?? undefined,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Record an admin action. Best-effort by design — logging must never block or
 * fail the underlying operation (e.g. table missing before migration 0017).
 */
export async function recordAdminAction(
  admin: Pick<User, "id" | "name">,
  action: string,
  targetType: AdminAction["targetType"],
  targetId: string,
  detail?: string
): Promise<void> {
  if (!IS_LIVE) {
    mockActions.unshift({
      id: `act_${mockActions.length + 1}_${Date.now().toString(36)}`,
      adminId: admin.id,
      adminName: admin.name,
      action,
      targetType,
      targetId,
      detail,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("admin_actions").insert({
      admin_id: admin.id,
      admin_name: admin.name,
      action,
      target_type: targetType,
      target_id: targetId,
      ...(detail ? { detail } : {}),
    });
  } catch {
    // never block the operation on logging
  }
}

/** Newest-first admin action log. */
export async function listAdminActions(limit = 50): Promise<AdminAction[]> {
  if (!IS_LIVE) return mockActions.slice(0, limit);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

/** Actions (incl. notes) that touched one target — for the user detail page. */
export async function listAdminActionsForTarget(targetId: string): Promise<AdminAction[]> {
  if (!IS_LIVE) return mockActions.filter((a) => a.targetId === targetId);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("admin_actions")
      .select("*")
      .eq("target_id", targetId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}
