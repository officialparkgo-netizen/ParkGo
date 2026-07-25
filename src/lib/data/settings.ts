import type { PlatformSettings } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { COMMISSION, SERVICE_FEE } from "@/lib/pricing";
import { CANCEL_FEE_BPS, CANCEL_FREE_WINDOW_MS } from "@/lib/data/bookings";

/** Code defaults — used until an admin saves something else. */
export const DEFAULT_SETTINGS: PlatformSettings = {
  serviceFee: SERVICE_FEE,
  parkingCommissionBps: COMMISSION.parkingBps,
  transferCommissionBps: COMMISSION.transferBps,
  cancelWindowHours: Math.round(CANCEL_FREE_WINDOW_MS / 3_600_000),
  cancelFeeBps: CANCEL_FEE_BPS,
  // Money sits with ParkGo for a short protection window after pick-up —
  // damage claims are checked before the host payout unlocks.
  payoutHoldDays: 3,
  // Support desk: 08:00–20:00 London, typical first reply in 10 minutes.
  supportOpenHour: 8,
  supportCloseHour: 20,
  supportReplyMinutes: 10,
  // An urgent chat left 20 minutes without a reply pulls in the admins.
  supportSlaMinutes: 20,
  supportMaxPerHour: 6,
  supportAutoAssign: true,
  announcementOn: false,
};

const g = globalThis as unknown as { __parkgoSettings?: Partial<PlatformSettings> };

function clean(patch: Partial<PlatformSettings>): Partial<PlatformSettings> {
  const out: Partial<PlatformSettings> = {};
  const int = (v: unknown) => Math.max(0, Math.round(Number(v)));
  if (patch.serviceFee !== undefined) out.serviceFee = int(patch.serviceFee);
  if (patch.parkingCommissionBps !== undefined)
    out.parkingCommissionBps = Math.min(10_000, int(patch.parkingCommissionBps));
  if (patch.transferCommissionBps !== undefined)
    out.transferCommissionBps = Math.min(10_000, int(patch.transferCommissionBps));
  if (patch.cancelWindowHours !== undefined)
    out.cancelWindowHours = Math.min(720, int(patch.cancelWindowHours));
  if (patch.cancelFeeBps !== undefined)
    out.cancelFeeBps = Math.min(10_000, int(patch.cancelFeeBps));
  if (patch.payoutHoldDays !== undefined)
    out.payoutHoldDays = Math.min(14, int(patch.payoutHoldDays));
  if (patch.supportOpenHour !== undefined)
    out.supportOpenHour = Math.min(23, int(patch.supportOpenHour));
  if (patch.supportCloseHour !== undefined)
    out.supportCloseHour = Math.min(23, int(patch.supportCloseHour));
  if (patch.supportReplyMinutes !== undefined)
    out.supportReplyMinutes = Math.min(1440, Math.max(1, int(patch.supportReplyMinutes)));
  if (patch.supportSlaMinutes !== undefined)
    out.supportSlaMinutes = Math.min(1440, Math.max(1, int(patch.supportSlaMinutes)));
  if (patch.supportMaxPerHour !== undefined)
    out.supportMaxPerHour = Math.min(100, Math.max(1, int(patch.supportMaxPerHour)));
  if (patch.supportAutoAssign !== undefined)
    out.supportAutoAssign = !!patch.supportAutoAssign;
  if (patch.supportWhatsapp !== undefined) {
    const digits = String(patch.supportWhatsapp).replace(/[^\d+]/g, "").slice(0, 20);
    out.supportWhatsapp = /^\+?\d{7,}$/.test(digits) ? digits : undefined;
  }
  if (patch.supportMacros !== undefined) {
    out.supportMacros = (Array.isArray(patch.supportMacros) ? patch.supportMacros : [])
      .filter((m) => m && typeof m.label === "string" && typeof m.text === "string")
      .slice(0, 20)
      .map((m, i) => ({
        id: String(m.id || `m${i + 1}`).slice(0, 20),
        label: String(m.label).trim().slice(0, 60),
        text: String(m.text).trim().slice(0, 1000),
      }))
      .filter((m) => m.label && m.text);
  }
  if (patch.adminAlertEmail !== undefined)
    out.adminAlertEmail = String(patch.adminAlertEmail).trim().slice(0, 200) || undefined;
  if (patch.opsWebhookUrl !== undefined) {
    const url = String(patch.opsWebhookUrl).trim().slice(0, 500);
    out.opsWebhookUrl = /^https:\/\//.test(url) ? url : undefined;
  }
  if (patch.announcement !== undefined)
    out.announcement = String(patch.announcement).trim().slice(0, 300) || undefined;
  if (patch.announcementOn !== undefined) out.announcementOn = !!patch.announcementOn;
  return out;
}

/** Current platform settings (defaults merged under whatever was saved). */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (!IS_LIVE) return { ...DEFAULT_SETTINGS, ...(g.__parkgoSettings ?? {}) };
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("platform_settings")
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    return { ...DEFAULT_SETTINGS, ...((data?.data as Partial<PlatformSettings>) ?? {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Merge-save a settings patch; returns the new effective settings. */
export async function savePlatformSettings(
  patch: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const cleaned = clean(patch);
  if (!IS_LIVE) {
    g.__parkgoSettings = { ...(g.__parkgoSettings ?? {}), ...cleaned };
    return { ...DEFAULT_SETTINGS, ...g.__parkgoSettings };
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("platform_settings")
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    const merged = { ...((data?.data as object) ?? {}), ...cleaned };
    await admin
      .from("platform_settings")
      .upsert({ id: "main", data: merged, updated_at: new Date().toISOString() });
    return { ...DEFAULT_SETTINGS, ...merged };
  } catch {
    return { ...DEFAULT_SETTINGS, ...cleaned };
  }
}
