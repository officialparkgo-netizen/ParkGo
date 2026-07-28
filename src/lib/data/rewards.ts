import type { GiftCard, Pence, TripPass, User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { giftCardCode, passDaysLeft, passExpired } from "@/lib/rewards";

/**
 * Balances a traveller can spend: gift cards, trip passes and account credit.
 *
 * All three are money that has already been paid, so every write here has to
 * be safe to lose halfway. The pattern throughout is *deduct first, then use*
 * — a failed booking gives the balance back, whereas a failed deduction after
 * a successful booking would hand out free parking.
 */

const g = globalThis as unknown as {
  __parkgoGiftCards?: GiftCard[];
  __parkgoTripPasses?: TripPass[];
};
const cardsMock = (g.__parkgoGiftCards ??= []);
const passesMock = (g.__parkgoTripPasses ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function cardFromRow(r: any): GiftCard {
  return {
    id: r.code,
    code: r.code,
    initialPence: r.initial_pence,
    balancePence: r.balance_pence,
    purchasedBy: r.purchased_by ?? undefined,
    recipientEmail: r.recipient_email ?? undefined,
    message: r.message ?? undefined,
    stripeRef: r.stripe_ref ?? undefined,
    createdAt: r.created_at,
  };
}

function passFromRow(r: any): TripPass {
  return {
    id: r.id,
    userId: r.user_id,
    daysTotal: r.days_total,
    daysUsed: r.days_used,
    pricePence: r.price_pence,
    dayValuePence: r.day_value_pence,
    expiresAt: r.expires_at,
    stripeRef: r.stripe_ref ?? undefined,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ----------------------------------------------------------- gift cards -----

/** Codes are typed off a screen, so matching ignores case and spacing. */
export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function sameCode(a: string, b: string): boolean {
  return normaliseCode(a) === normaliseCode(b);
}

export async function createGiftCard(input: {
  amountPence: Pence;
  purchasedBy?: string;
  recipientEmail?: string;
  message?: string;
  /** The payment that bought it, so a repeated success redirect is a no-op. */
  stripeRef?: string;
}): Promise<GiftCard | null> {
  const amount = Math.round(input.amountPence);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const message = input.message?.trim().slice(0, 400) || undefined;

  if (input.stripeRef) {
    const already = await findGiftCardByRef(input.stripeRef);
    if (already) return already;
  }

  if (!IS_LIVE) {
    const code = giftCardCode(`${input.purchasedBy ?? "anon"}-${cardsMock.length}-${amount}`);
    const card: GiftCard = {
      id: code,
      code,
      initialPence: amount,
      balancePence: amount,
      purchasedBy: input.purchasedBy,
      recipientEmail: input.recipientEmail,
      message,
      stripeRef: input.stripeRef,
      createdAt: new Date().toISOString(),
    };
    cardsMock.push(card);
    return card;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    // The code is derived from a seed, so a collision is possible in principle.
    // Retry a handful of times rather than handing back a duplicate.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = giftCardCode(`${input.purchasedBy ?? "anon"}-${amount}-${attempt}-${Date.now()}`);
      const { data, error } = await admin
        .from("gift_cards")
        .insert({
          code,
          initial_pence: amount,
          balance_pence: amount,
          purchased_by: input.purchasedBy ?? null,
          recipient_email: input.recipientEmail ?? null,
          message: message ?? null,
          stripe_ref: input.stripeRef ?? null,
        })
        .select("*")
        .single();
      if (!error && data) return cardFromRow(data);
      // The unique index on stripe_ref means a concurrent duplicate lands
      // here: return the card that won rather than retrying with a new code.
      if (input.stripeRef) {
        const won = await findGiftCardByRef(input.stripeRef);
        if (won) return won;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function findGiftCardByRef(stripeRef: string): Promise<GiftCard | null> {
  if (!IS_LIVE) return cardsMock.find((c) => c.stripeRef === stripeRef) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("gift_cards")
      .select("*")
      .eq("stripe_ref", stripeRef)
      .maybeSingle();
    return data ? cardFromRow(data) : null;
  } catch {
    return null;
  }
}

/** Look a card up for display. Returns null for an unknown or spent code. */
export async function findGiftCard(code: string): Promise<GiftCard | null> {
  const wanted = normaliseCode(code);
  if (wanted.length < 8) return null;

  if (!IS_LIVE) return cardsMock.find((c) => sameCode(c.code, wanted)) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("gift_cards")
      .select("*")
      // Stored with the dashes the buyer saw; the lookup strips them.
      .eq("code", formatCode(wanted))
      .maybeSingle();
    return data ? cardFromRow(data) : null;
  } catch {
    return null;
  }
}

/** Put the dashes back so a stripped code matches how it is stored. */
function formatCode(stripped: string): string {
  return stripped.length === 12
    ? `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8)}`
    : stripped;
}

/**
 * Take money off a card. Returns what was actually taken, which is less than
 * asked for when the balance runs out — never more, and never below zero.
 */
export async function spendGiftCard(code: string, amount: Pence): Promise<Pence> {
  const want = Math.max(0, Math.round(amount));
  if (want === 0) return 0;

  if (!IS_LIVE) {
    const card = cardsMock.find((c) => sameCode(c.code, code));
    if (!card) return 0;
    const take = Math.min(card.balancePence, want);
    card.balancePence -= take;
    return take;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const stored = formatCode(normaliseCode(code));
    const { data: card } = await admin
      .from("gift_cards")
      .select("balance_pence")
      .eq("code", stored)
      .maybeSingle();
    if (!card) return 0;
    const take = Math.min(card.balance_pence as number, want);
    if (take <= 0) return 0;
    // Guard on the balance we read: if two checkouts race, the second update
    // matches no row and the caller is told nothing was taken.
    const { data: updated } = await admin
      .from("gift_cards")
      .update({
        balance_pence: (card.balance_pence as number) - take,
        redeemed_at: new Date().toISOString(),
      })
      .eq("code", stored)
      .eq("balance_pence", card.balance_pence)
      .select("code")
      .maybeSingle();
    return updated ? take : 0;
  } catch {
    return 0;
  }
}

/** Give a spend back, e.g. when the booking it was for failed. */
export async function refundGiftCard(code: string, amount: Pence): Promise<void> {
  const give = Math.max(0, Math.round(amount));
  if (give === 0) return;
  if (!IS_LIVE) {
    const card = cardsMock.find((c) => sameCode(c.code, code));
    if (card) card.balancePence += give;
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const stored = formatCode(normaliseCode(code));
    const { data } = await admin
      .from("gift_cards")
      .select("balance_pence")
      .eq("code", stored)
      .maybeSingle();
    if (!data) return;
    await admin
      .from("gift_cards")
      .update({ balance_pence: (data.balance_pence as number) + give })
      .eq("code", stored);
  } catch {
    /* a failed refund is retried by the caller's own error path */
  }
}

export async function listGiftCardsBought(userId: string): Promise<GiftCard[]> {
  if (!IS_LIVE) {
    return cardsMock
      .filter((c) => c.purchasedBy === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("gift_cards")
      .select("*")
      .eq("purchased_by", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(cardFromRow);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------- trip passes -----

export async function createTripPass(input: {
  userId: string;
  days: number;
  pricePence: Pence;
  dayValuePence: Pence;
  monthsValid?: number;
  /** See createGiftCard. */
  stripeRef?: string;
}): Promise<TripPass | null> {
  const days = Math.round(input.days);
  if (days <= 0 || input.dayValuePence <= 0) return null;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + (input.monthsValid ?? 12));

  if (input.stripeRef) {
    const already = await findTripPassByRef(input.stripeRef);
    if (already) return already;
  }

  if (!IS_LIVE) {
    const pass: TripPass = {
      id: `pass_${passesMock.length + 1}`,
      userId: input.userId,
      daysTotal: days,
      daysUsed: 0,
      pricePence: Math.max(0, Math.round(input.pricePence)),
      dayValuePence: Math.round(input.dayValuePence),
      expiresAt: expires.toISOString(),
      stripeRef: input.stripeRef,
      createdAt: new Date().toISOString(),
    };
    passesMock.push(pass);
    return pass;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("trip_passes")
      .insert({
        user_id: input.userId,
        days_total: days,
        price_pence: Math.max(0, Math.round(input.pricePence)),
        day_value_pence: Math.round(input.dayValuePence),
        expires_at: expires.toISOString(),
        stripe_ref: input.stripeRef ?? null,
      })
      .select("*")
      .single();
    if (error || !data) {
      // Lost a race on the unique stripe_ref index: return the winner.
      return input.stripeRef ? findTripPassByRef(input.stripeRef) : null;
    }
    return passFromRow(data);
  } catch {
    return null;
  }
}

async function findTripPassByRef(stripeRef: string): Promise<TripPass | null> {
  if (!IS_LIVE) return passesMock.find((p) => p.stripeRef === stripeRef) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("trip_passes")
      .select("*")
      .eq("stripe_ref", stripeRef)
      .maybeSingle();
    return data ? passFromRow(data) : null;
  } catch {
    return null;
  }
}

/**
 * The pass to spend next: unexpired, with days left, and the one closest to
 * expiring so nothing is wasted.
 */
export async function activeTripPass(userId: string): Promise<TripPass | null> {
  const all = await listTripPasses(userId);
  const usable = all.filter((p) => !passExpired(p) && passDaysLeft(p) > 0);
  usable.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
  return usable[0] ?? null;
}

export async function listTripPasses(userId: string): Promise<TripPass[]> {
  if (!IS_LIVE) {
    return passesMock
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("trip_passes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []).map(passFromRow);
  } catch {
    return [];
  }
}

/** Take whole days off a pass. Returns how many were actually taken. */
export async function spendPassDays(passId: string, days: number): Promise<number> {
  const want = Math.max(0, Math.round(days));
  if (want === 0) return 0;

  if (!IS_LIVE) {
    const pass = passesMock.find((p) => p.id === passId);
    if (!pass) return 0;
    const take = Math.min(passDaysLeft(pass), want);
    pass.daysUsed += take;
    return take;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data: pass } = await admin
      .from("trip_passes")
      .select("days_total, days_used")
      .eq("id", passId)
      .maybeSingle();
    if (!pass) return 0;
    const take = Math.min((pass.days_total as number) - (pass.days_used as number), want);
    if (take <= 0) return 0;
    const { data: updated } = await admin
      .from("trip_passes")
      .update({ days_used: (pass.days_used as number) + take })
      .eq("id", passId)
      .eq("days_used", pass.days_used)
      .select("id")
      .maybeSingle();
    return updated ? take : 0;
  } catch {
    return 0;
  }
}

export async function refundPassDays(passId: string, days: number): Promise<void> {
  const give = Math.max(0, Math.round(days));
  if (give === 0) return;
  if (!IS_LIVE) {
    const pass = passesMock.find((p) => p.id === passId);
    if (pass) pass.daysUsed = Math.max(0, pass.daysUsed - give);
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("trip_passes")
      .select("days_used")
      .eq("id", passId)
      .maybeSingle();
    if (!data) return;
    await admin
      .from("trip_passes")
      .update({ days_used: Math.max(0, (data.days_used as number) - give) })
      .eq("id", passId);
  } catch {
    /* see refundGiftCard */
  }
}

// -------------------------------------------------------------- credit ------

/**
 * Take credit off an account. Returns what was actually taken, which is less
 * than asked for when the balance runs out.
 *
 * `adjustCredit` clamps at zero, so the amount taken is the difference between
 * the balances rather than what was requested — that is what makes a race
 * between two checkouts safe.
 */
export async function spendCredit(userId: string, amount: Pence): Promise<Pence> {
  const want = Math.max(0, Math.round(amount));
  if (want === 0) return 0;
  const { adjustCredit, getUserProfile } = await import("@/lib/data/users");
  const before = (await getUserProfile(userId))?.creditPence ?? 0;
  if (before <= 0) return 0;
  const after = await adjustCredit(userId, -Math.min(before, want));
  return Math.max(0, before - after);
}

export async function refundCredit(userId: string, amount: Pence): Promise<void> {
  const give = Math.max(0, Math.round(amount));
  if (give === 0) return;
  const { adjustCredit } = await import("@/lib/data/users");
  await adjustCredit(userId, give);
}

/**
 * Completed trips, which is what a loyalty tier is worked out from. Counted
 * from the bookings themselves rather than trusted from a cached column, so a
 * cancelled or refunded trip cannot leave a tier behind that was never earned.
 */
export async function completedTripCount(user: Pick<User, "id">): Promise<number> {
  try {
    const { listBookingsForTraveller } = await import("@/lib/data/bookings");
    const bookings = await listBookingsForTraveller(user.id);
    return bookings.filter((b) => b.status === "completed").length;
  } catch {
    return 0;
  }
}
