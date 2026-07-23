import type { PromoCode, PromoKind } from "@/types";
import { IS_LIVE } from "@/lib/config";

// Mock store with one demo code so the flow is testable out of the box.
const g = globalThis as unknown as { __parkgoPromos?: PromoCode[] };
const mockPromos: PromoCode[] = (g.__parkgoPromos ??= [
  {
    id: "promo_demo",
    code: "PARKGO10",
    kind: "percent",
    value: 10,
    active: true,
    uses: 0,
    createdAt: new Date().toISOString(),
  },
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): PromoCode {
  return {
    id: r.id,
    code: r.code,
    kind: (r.kind === "fixed" ? "fixed" : "percent") as PromoKind,
    value: r.value,
    active: !!r.active,
    uses: r.uses ?? 0,
    maxUses: r.max_uses ?? undefined,
    expiresAt: r.expires_at ?? undefined,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

export async function listPromos(): Promise<PromoCode[]> {
  if (!IS_LIVE) return [...mockPromos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

export async function createPromo(input: {
  code: string;
  kind: PromoKind;
  value: number;
  maxUses?: number;
  expiresAt?: string;
}): Promise<PromoCode | null> {
  const code = normalizePromoCode(input.code);
  if (!code || input.value <= 0) return null;
  if (!IS_LIVE) {
    if (mockPromos.some((p) => p.code === code)) return null;
    const promo: PromoCode = {
      id: `promo_${mockPromos.length + 1}`,
      code,
      kind: input.kind,
      value: input.value,
      active: true,
      uses: 0,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString(),
    };
    mockPromos.push(promo);
    return promo;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("promo_codes")
      .insert({
        code,
        kind: input.kind,
        value: input.value,
        ...(input.maxUses ? { max_uses: input.maxUses } : {}),
        ...(input.expiresAt ? { expires_at: input.expiresAt } : {}),
      })
      .select("*")
      .single();
    if (error || !data) return null;
    return fromRow(data);
  } catch {
    return null;
  }
}

export async function setPromoActive(id: string, active: boolean): Promise<boolean> {
  if (!IS_LIVE) {
    const p = mockPromos.find((x) => x.id === id);
    if (p) p.active = active;
    return !!p;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin().from("promo_codes").update({ active }).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

function isUsable(p: PromoCode): boolean {
  if (!p.active) return false;
  if (p.maxUses && p.uses >= p.maxUses) return false;
  if (p.expiresAt && new Date(p.expiresAt).getTime() < Date.now()) return false;
  return true;
}

/** Look up a code a traveller typed at checkout; null when not usable. */
export async function findActivePromo(rawCode: string): Promise<PromoCode | null> {
  const code = normalizePromoCode(rawCode);
  if (!code) return null;
  if (!IS_LIVE) {
    const p = mockPromos.find((x) => x.code === code);
    return p && isUsable(p) ? p : null;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!data) return null;
    const p = fromRow(data);
    return isUsable(p) ? p : null;
  } catch {
    return null;
  }
}

/** Count a successful booking against the code (best-effort). */
export async function incrementPromoUse(id: string): Promise<void> {
  if (!IS_LIVE) {
    const p = mockPromos.find((x) => x.id === id);
    if (p) p.uses += 1;
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin.from("promo_codes").select("uses").eq("id", id).maybeSingle();
    await admin
      .from("promo_codes")
      .update({ uses: (data?.uses ?? 0) + 1 })
      .eq("id", id);
  } catch {
    // usage counting must not block the booking
  }
}
