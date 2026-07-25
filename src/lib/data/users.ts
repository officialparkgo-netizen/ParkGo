import type { User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getAllUsers as getAllUsersMock,
  getUser as getUserMock,
  setUserRole as mockSetUserRole,
  setUserSuspended as mockSetUserSuspended,
  setUserOnboarded as mockSetUserOnboarded,
  setUserTwofa as mockSetUserTwofa,
  updateUserProfile as mockUpdateUserProfile,
} from "@/lib/data/store";

type UserRow = {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string | null;
  locale: string;
  vehicle: unknown;
  vehicles?: unknown;
  business?: unknown;
  stripe_customer_id?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  credit_pence?: number | null;
  guest_created?: boolean | null;
  corporate_account_id: string | null;
  suspended?: boolean | null;
  twofa_enabled?: boolean | null;
  avatar_url?: string | null;
  onboarded?: boolean | null;
  admin_scope?: string | null;
  email_booking_alerts?: boolean | null;
  cohost_host_id?: string | null;
  support_available?: boolean | null;
  invite_nonce?: string | null;
  created_at: string;
};

export function userFromRow(r: UserRow): User {
  return {
    id: r.id,
    role: r.role as User["role"],
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    locale: r.locale as User["locale"],
    vehicle: (r.vehicle as User["vehicle"]) ?? undefined,
    corporateAccountId: r.corporate_account_id ?? undefined,
    suspended: !!r.suspended,
    twofaEnabled: !!r.twofa_enabled,
    avatarUrl: r.avatar_url ?? undefined,
    adminScope: (r.admin_scope as User["adminScope"]) ?? undefined,
    emailBookingAlerts: r.email_booking_alerts ?? undefined,
    cohostHostId: r.cohost_host_id ?? undefined,
    supportAvailable: r.support_available ?? undefined,
    // Accounts predating the multi-car migration have only the single column.
    vehicles: Array.isArray(r.vehicles) && r.vehicles.length
      ? (r.vehicles as User["vehicles"])
      : r.vehicle
        ? [r.vehicle as NonNullable<User["vehicle"]>]
        : undefined,
    business: (r.business as User["business"]) ?? undefined,
    stripeCustomerId: r.stripe_customer_id ?? undefined,
    referralCode: r.referral_code ?? undefined,
    referredBy: r.referred_by ?? undefined,
    creditPence: r.credit_pence ?? 0,
    guestCreated: r.guest_created ?? undefined,
    inviteNonce: r.invite_nonce ?? undefined,
    // Keep undefined (not false) when the column doesn't exist yet — the
    // onboarding gate only fires on a strict `false`.
    onboarded: r.onboarded ?? undefined,
    createdAt: r.created_at,
  };
}

// "*" instead of an explicit column list so reads keep working while the
// `suspended` column migration (0013) hasn't been run yet.
const PROFILE_COLS = "*";

/** Profile row for a user id. Supabase in live mode, in-memory seed in mock. */
export async function getUserProfile(id: string): Promise<User | null> {
  if (!IS_LIVE) return getUserMock(id) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .select(PROFILE_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Batch profile lookup (e.g. traveller names on the host dashboard). */
export async function getUsersByIds(ids: string[]): Promise<Map<string, User>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, User>();
  if (unique.length === 0) return map;

  if (!IS_LIVE) {
    unique.forEach((id) => {
      const u = getUserMock(id);
      if (u) map.set(id, u);
    });
    return map;
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("users").select(PROFILE_COLS).in("id", unique);
  (data ?? []).forEach((r) => map.set(r.id, userFromRow(r as UserRow)));
  return map;
}

/** All registered users, newest first (admin overview). */
export async function listAllUsers(): Promise<User[]> {
  if (!IS_LIVE) return getAllUsersMock();

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("users")
    .select(PROFILE_COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map((r) => userFromRow(r as UserRow));
}

/** Admin: switch a member between traveller and host. Never touches admins. */
export async function setUserRoleAdmin(
  userId: string,
  role: "traveller" | "host"
): Promise<User | null> {
  if (!IS_LIVE) return mockSetUserRole(userId, role) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .update({ role })
    .eq("id", userId)
    .neq("role", "admin")
    .select(PROFILE_COLS)
    .single();
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Self-service profile edit: name, phone, avatar and (travellers) vehicle. */
export async function updateOwnProfile(
  userId: string,
  input: {
    name: string;
    phone?: string;
    vehicle?: User["vehicle"] | null;
    avatarUrl?: string;
  }
): Promise<User | null> {
  if (!IS_LIVE) return mockUpdateUserProfile(userId, input) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const payload: Record<string, unknown> = {
    name: input.name,
    phone: input.phone ?? null,
  };
  if (input.vehicle !== undefined) {
    payload.vehicle = input.vehicle;
    // Onboarding captures one car; make it the first of the list too, so the
    // account page and checkout never disagree about the default vehicle.
    const { data: current } = await supabaseAdmin()
      .from("users")
      .select("vehicles")
      .eq("id", userId)
      .maybeSingle();
    const rest = Array.isArray(current?.vehicles) ? current.vehicles.slice(1) : [];
    payload.vehicles = input.vehicle ? [input.vehicle, ...rest] : rest;
  }
  const withAvatar =
    input.avatarUrl !== undefined ? { ...payload, avatar_url: input.avatarUrl } : payload;

  const doUpdate = (p: Record<string, unknown>) =>
    supabaseAdmin().from("users").update(p).eq("id", userId).select(PROFILE_COLS).single();

  let { data, error } = await doUpdate(withAvatar);
  // Pre-0016 databases have no avatar_url column — save the rest anyway.
  if (error && input.avatarUrl !== undefined) {
    ({ data, error } = await doUpdate(payload));
  }
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** First-run profile setup finished — stop gating this user to /welcome. */
export async function setUserOnboarded(userId: string): Promise<void> {
  if (!IS_LIVE) {
    mockSetUserOnboarded(userId);
    return;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  // Best-effort: pre-0016 databases have no column, and then no gate either.
  await supabaseAdmin().from("users").update({ onboarded: true }).eq("id", userId);
}

/** Self-service: turn the admin email-code second factor on or off. */
export async function setUserTwofa(userId: string, enabled: boolean): Promise<User | null> {
  if (!IS_LIVE) return mockSetUserTwofa(userId, enabled) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .update({ twofa_enabled: enabled })
    .eq("id", userId)
    .select(PROFILE_COLS)
    .single();
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Admin: suspend or restore an account (enforced at the sign-in guard). */
export async function setUserSuspendedAdmin(
  userId: string,
  suspended: boolean
): Promise<User | null> {
  if (!IS_LIVE) return mockSetUserSuspended(userId, suspended) ?? null;

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .update({ suspended })
    .eq("id", userId)
    .neq("role", "admin")
    .select(PROFILE_COLS)
    .single();
  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Resolve the profile for a signed-in Supabase auth user, creating it from the
 * sign-up metadata if it's missing. Self-heals accounts whose profile row was
 * never created (e.g. signed up before the trigger existed, or a trigger
 * failure), so a valid session always resolves to a dashboard instead of
 * bouncing back to /login.
 */
export async function ensureUserProfile(authUser: AuthUserLike): Promise<User | null> {
  const existing = await getUserProfile(authUser.id);
  if (existing || !IS_LIVE) return existing;

  const meta = authUser.user_metadata ?? {};
  const role = (["traveller", "host", "admin"].includes(String(meta.role))
    ? String(meta.role)
    : "traveller") as User["role"];
  const name = String(
    meta.name || (authUser.email ? authUser.email.split("@")[0] : "") || "ParkGo user"
  );

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("users")
    .upsert({ id: authUser.id, email: authUser.email ?? "", name, role }, { onConflict: "id" })
    .select(PROFILE_COLS)
    .single();

  if (error || !data) return null;
  return userFromRow(data as UserRow);
}

/** Admin: set another admin's scope ("support" = no money pages). */
export async function setAdminScopeAdmin(
  userId: string,
  scope: "full" | "support"
): Promise<boolean> {
  if (!IS_LIVE) {
    const { setUserAdminScope } = await import("@/lib/data/store");
    return !!setUserAdminScope(userId, scope);
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { error } = await supabaseAdmin()
    .from("users")
    .update({ admin_scope: scope })
    .eq("id", userId)
    .eq("role", "admin");
  return !error;
}

/**
 * GDPR: anonymize an account in place. Financial records (bookings/payments)
 * are kept for accounting; everything personal is wiped and the account is
 * locked. Irreversible by design.
 */
export async function anonymizeUserAdmin(userId: string): Promise<boolean> {
  const scrubbed = {
    name: "Deleted user",
    email: `deleted-${userId.slice(0, 12)}@removed.parkgo.ai`,
    phone: null,
    avatar_url: null,
    vehicle: null,
    suspended: true,
    twofa_enabled: false,
  };
  if (!IS_LIVE) {
    const { anonymizeUser } = await import("@/lib/data/store");
    return !!anonymizeUser(userId);
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { error } = await supabaseAdmin()
    .from("users")
    .update(scrubbed)
    .eq("id", userId)
    .neq("role", "admin");
  return !error;
}

/** Live only: last sign-in time from Supabase Auth (null in mock mode). */
export async function getAuthLastSignIn(userId: string): Promise<string | null> {
  if (!IS_LIVE) return null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin().auth.admin.getUserById(userId);
    return data.user?.last_sign_in_at ?? null;
  } catch {
    return null;
  }
}

/** Save the traveller's car list (first entry is the default at checkout). */
export async function setUserVehicles(
  userId: string,
  vehicles: NonNullable<User["vehicles"]>
): Promise<boolean> {
  const list = vehicles.slice(0, 5);
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.vehicles = list;
    // Keep the legacy single field in step so nothing downstream regresses.
    u.vehicle = list[0];
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ vehicles: list, vehicle: list[0] ?? null })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Company details for anyone expensing the trip; null clears them. */
export async function setUserBusiness(
  userId: string,
  business: User["business"] | null
): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.business = business ?? undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ business })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Remember the Stripe customer so a returning traveller sees their card. */
export async function setStripeCustomerId(userId: string, customerId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.stripeCustomerId = customerId;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Give this account its permanent referral code (idempotent). */
export async function ensureReferralCode(user: User): Promise<string> {
  if (user.referralCode) return user.referralCode;
  const { referralCodeFor } = await import("@/lib/referrals");
  const code = referralCodeFor(user.id);
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(user.id);
    if (u) u.referralCode = code;
    return code;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("users").update({ referral_code: code }).eq("id", user.id);
  } catch {
    // The code is derived from the id, so it is the same next time regardless.
  }
  return code;
}

export async function findUserByReferralCode(code: string): Promise<User | null> {
  const clean = code.toUpperCase();
  if (!clean) return null;
  if (!IS_LIVE) {
    const { getAllUsers } = await import("@/lib/data/store");
    const { referralCodeFor } = await import("@/lib/referrals");
    return (
      getAllUsers().find((u) => (u.referralCode ?? referralCodeFor(u.id)) === clean) ?? null
    );
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("users")
      .select(PROFILE_COLS)
      .eq("referral_code", clean)
      .maybeSingle();
    return data ? userFromRow(data as UserRow) : null;
  } catch {
    return null;
  }
}

/**
 * Move credit by a delta (positive to award, negative to spend). Clamped at
 * zero so a race between two checkouts can never leave a negative balance.
 */
export async function adjustCredit(userId: string, deltaPence: number): Promise<number> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return 0;
    u.creditPence = Math.max(0, (u.creditPence ?? 0) + deltaPence);
    return u.creditPence;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("users")
      .select("credit_pence")
      .eq("id", userId)
      .maybeSingle();
    const next = Math.max(0, ((data?.credit_pence as number) ?? 0) + deltaPence);
    await admin.from("users").update({ credit_pence: next }).eq("id", userId);
    return next;
  } catch {
    return 0;
  }
}

/** Record who referred this traveller. Only ever set once. */
export async function setReferredBy(userId: string, referrerId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u || u.referredBy) return false;
    u.referredBy = referrerId;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ referred_by: referrerId })
      .eq("id", userId)
      .is("referred_by", null);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Agent duty status. Auto-assignment only picks agents who are on duty, so
 * this is the switch that stops a ticket landing with someone on holiday.
 */
export async function setSupportAvailable(userId: string, on: boolean): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.supportAvailable = on;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ support_available: on })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Host preference: email on new bookings (default true when unset). */
export async function setEmailBookingAlerts(userId: string, on: boolean): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.emailBookingAlerts = on;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ email_booking_alerts: on })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Create (or re-link) the limited co-host account for a host. Mock mode uses
 * a deterministic id; live mode invites the email through Supabase auth so the
 * helper can sign in with a magic link, then mirrors the row in `users`.
 */
export async function createCohostUser(
  hostId: string,
  email: string,
  name: string
): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return null;

  if (!IS_LIVE) {
    const { addMockUser, getUser, getUserByEmail } = await import("@/lib/data/store");
    const id = `user_cohost_${hostId}`;
    // Same rule as live: never point a co-host invite at somebody else.
    const byEmail = getUserByEmail(cleanEmail);
    if (byEmail && byEmail.id !== id) return null;
    const existing = getUser(id);
    if (existing) {
      existing.email = cleanEmail;
      existing.cohostHostId = hostId;
      return existing;
    }
    return addMockUser({
      id,
      role: "host",
      name: name || "Co-host",
      email: cleanEmail,
      locale: "en",
      cohostHostId: hostId,
      onboarded: true,
      createdAt: new Date().toISOString(),
    });
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();

    // A host is far less privileged than an admin, so a co-host invite may
    // only ever create a BRAND-NEW account. Reusing an existing one would let
    // a host mint a set-password link for somebody else's ParkGo account —
    // unless it's already their own co-host, which is just a re-invite.
    const existing = await findUserByEmail(cleanEmail);
    if (existing && existing.cohostHostId !== hostId) return null;

    let authId = existing?.id ?? null;
    if (!authId) {
      const { data } = await admin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
      });
      authId = data?.user?.id ?? null;
    }
    if (!authId) return null;

    const { data: row, error } = await admin
      .from("users")
      .upsert(
        {
          id: authId,
          role: "host",
          name: name || "Co-host",
          email: cleanEmail,
          locale: "en",
          cohost_host_id: hostId,
          onboarded: true,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();
    if (error || !row) return null;
    return userFromRow(row as UserRow);
  } catch {
    return null;
  }
}

/** Everyone on the admin side (full admins + support agents). */
export async function listAdminUsers(): Promise<User[]> {
  return (await listAllUsers()).filter((u) => u.role === "admin" && !u.suspended);
}

/** Profile row for an email address (staff sign-in + invite de-duplication). */
export async function findUserByEmail(email: string): Promise<User | null> {
  const clean = email.trim().toLowerCase();
  if (!clean) return null;
  if (!IS_LIVE) {
    const { getUserByEmail } = await import("@/lib/data/store");
    return getUserByEmail(clean) ?? null;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  // `_` and `%` are LIKE wildcards and both are legal in an email local part,
  // so escape them — and re-check the match exactly, because a pattern must
  // never be able to resolve to somebody else's account.
  const pattern = clean.replace(/([\\%_])/g, "\\$1");
  const { data } = await supabaseAdmin()
    .from("users")
    .select(PROFILE_COLS)
    .ilike("email", pattern)
    .limit(5);
  const row = (data ?? []).find(
    (r) => String((r as UserRow).email ?? "").toLowerCase() === clean
  );
  return row ? userFromRow(row as UserRow) : null;
}

/**
 * Store (or clear) the pending-invite nonce. Setting it mints a fresh invite
 * link and kills any older one; clearing it makes the current link single-use.
 */
export async function setInviteNonce(
  userId: string,
  nonce: string | null
): Promise<boolean> {
  if (!IS_LIVE) {
    const u = (await import("@/lib/data/store")).getUser(userId);
    if (!u) return false;
    u.inviteNonce = nonce ?? undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ invite_nonce: nonce })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Set a staff password. Live mode hands it to Supabase Auth (which hashes and
 * owns it); mock mode keeps a scrypt hash in memory, outside the User object.
 */
export async function setStaffPassword(
  userId: string,
  password: string
): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser, setMockPasswordHash } = await import("@/lib/data/store");
    if (!getUser(userId)) return false;
    const { randomBytes, scryptSync } = await import("crypto");
    const salt = randomBytes(16).toString("hex");
    setMockPasswordHash(userId, `${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin().auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    return !error;
  } catch {
    return false;
  }
}

/** Mock-mode password check (live mode goes through Supabase Auth instead). */
export async function verifyMockPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const { getMockPasswordHash } = await import("@/lib/data/store");
  const stored = getMockPasswordHash(userId);
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const { scryptSync, timingSafeEqual } = await import("crypto");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

/**
 * Create (or re-link) a limited support agent: role admin with the "support"
 * scope, so every money page bounces them but the ticket queue works.
 *
 * The account is created WITHOUT a password — ParkGo emails its own invite
 * link (see team-invite-mail) and the teammate picks their password there, so
 * delivery rides on Resend rather than Supabase's rate-limited default mailer.
 */
export async function createSupportAgent(
  email: string,
  name: string
): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return null;
  const cleanName = name.trim().slice(0, 60) || "Support agent";

  if (!IS_LIVE) {
    const { addMockUser, getUser } = await import("@/lib/data/store");
    const { createHash } = await import("crypto");
    // Include a digest of the FULL address so two people who share a local
    // part (alice@a.com / alice@b.com) never collide onto one account.
    const id = `user_agent_${cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "")}_${createHash(
      "sha256"
    )
      .update(cleanEmail)
      .digest("hex")
      .slice(0, 8)}`;
    const existing = getUser(id);
    if (existing) {
      existing.role = "admin";
      existing.adminScope = "support";
      existing.suspended = false;
      existing.email = cleanEmail;
      existing.name = cleanName;
      return existing;
    }
    return addMockUser({
      id,
      role: "admin",
      name: cleanName,
      email: cleanEmail,
      locale: "en",
      adminScope: "support",
      onboarded: true,
      createdAt: new Date().toISOString(),
    });
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();

    // Reuse the account when this email is already known, so re-inviting an
    // existing teammate promotes them instead of failing on a duplicate.
    let authId = (await findUserByEmail(cleanEmail))?.id ?? null;
    if (!authId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
      });
      authId = data?.user?.id ?? null;
      if (!authId && error) {
        // Already registered in auth but missing a profile row — find them.
        const { data: page } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        authId =
          page?.users?.find((u) => (u.email ?? "").toLowerCase() === cleanEmail)?.id ?? null;
      }
    }
    if (!authId) return null;

    const { data: row, error } = await admin
      .from("users")
      .upsert(
        {
          id: authId,
          role: "admin",
          name: cleanName,
          email: cleanEmail,
          locale: "en",
          admin_scope: "support",
          onboarded: true,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();
    if (error || !row) return null;
    return userFromRow(row as UserRow);
  } catch {
    return null;
  }
}

/**
 * Revoke a support agent: back to a plain traveller account. Deliberately
 * refuses to touch full admins — only "support"-scoped accounts demote.
 */
export async function revokeSupportAgent(userId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u || u.role !== "admin" || u.adminScope !== "support") return false;
    u.role = "traveller";
    u.adminScope = undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ role: "traveller", admin_scope: null })
      .eq("id", userId)
      .eq("role", "admin")
      .eq("admin_scope", "support");
    return !error;
  } catch {
    return false;
  }
}

/** Cut a co-host's link (their login stays but grants no host access). */
export async function revokeCohostUser(userId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { getUser } = await import("@/lib/data/store");
    const u = getUser(userId);
    if (!u) return false;
    u.cohostHostId = undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("users")
      .update({ cohost_host_id: null })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}
