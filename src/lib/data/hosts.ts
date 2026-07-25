import type { BookingBundle, Host, SearchQuery, SearchResult, Space, User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { priceBundle } from "@/lib/pricing";
import {
  getHostByUserId as mockGetHostByUserId,
  getSpacesByHost as mockGetSpacesByHost,
  createSpace as mockCreateSpace,
  updateHostProfile as mockUpdateHostProfile,
  getAllSpaces as mockGetAllSpaces,
  getAllHosts as mockGetAllHosts,
  getHost as mockGetHost,
  getSpace as mockGetSpace,
  reviewSpace as mockReviewSpace,
  searchSpaces as mockSearchSpaces,
  setSpacePaused as mockSetSpacePaused,
  getAirport,
  type CreateSpaceInput,
} from "@/lib/data/store";

const SIZE_ORDER = { small: 0, medium: 1, large: 2, van: 3 } as const;
function fitsVehicle(space: Space, size: SearchQuery["vehicleSize"]) {
  if (!size) return true;
  return SIZE_ORDER[space.maxVehicleSize] >= SIZE_ORDER[size];
}

// "*" keeps reads tolerant of optional columns added by later migrations
// (hosts.bio in 0009, spaces.blocked_dates in 0014).
const HOST_COLS = "*";
const SPACE_COLS = "*";

/* eslint-disable @typescript-eslint/no-explicit-any */
function hostFromRow(r: any): Host {
  return {
    id: r.id,
    userId: r.user_id,
    displayName: r.display_name,
    bio: r.bio ?? undefined,
    verificationStatus: r.verification_status,
    payoutAccountRef: r.payout_account_ref ?? undefined,
    bankSort: r.bank_sort ?? undefined,
    bankAccount: r.bank_account ?? undefined,
    autoWelcome: r.auto_welcome ?? undefined,
    blockedGuests: r.blocked_guests ?? undefined,
    cohostUserId: r.cohost_user_id ?? undefined,
    cohostEmail: r.cohost_email ?? undefined,
    rating: Number(r.rating ?? 0),
    joinedAt: r.joined_at,
  };
}

function spaceFromRow(r: any): Space {
  return {
    id: r.id,
    hostId: r.host_id,
    title: r.title,
    airportSlug: r.airport_slug,
    approxArea: r.approx_area,
    exactAddress: r.exact_address,
    lat: r.lat,
    lng: r.lng,
    distanceMiles: Number(r.distance_miles ?? 0),
    driveMinutes: r.drive_minutes,
    dimensions: r.dimensions,
    capacity: r.capacity ?? 1,
    maxVehicleSize: r.max_vehicle_size,
    evCharger: r.ev_charger ?? null,
    cctv: r.cctv,
    liveCamera: r.live_camera,
    covered: r.covered ?? false,
    accessible: r.accessible ?? false,
    accessRules: r.access_rules,
    photos: r.photos ?? [],
    pricePerDay: r.price_per_day,
    pricePerHour: r.price_per_hour ?? undefined,
    blockedDates: r.blocked_dates ?? undefined,
    weekendUpliftPct: r.weekend_uplift_pct ?? undefined,
    customPrices: r.custom_prices ?? undefined,
    bayNames: r.bay_names ?? undefined,
    requestToBook: r.request_to_book ?? undefined,
    rating: Number(r.rating ?? 0),
    reviewCount: r.review_count ?? 0,
    status: r.status,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Host record for a user (read-only). Null if they have no host profile yet. */
export async function getHostForUser(user: Pick<User, "id">): Promise<Host | null> {
  if (!IS_LIVE) return mockGetHostByUserId(user.id) ?? null;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("hosts")
    .select(HOST_COLS)
    .eq("user_id", user.id)
    .maybeSingle();
  return data ? hostFromRow(data) : null;
}

/** Host record for a user, creating one on first use (host onboarding). */
export async function ensureHostForUser(user: Pick<User, "id" | "name">): Promise<Host> {
  const existing = await getHostForUser(user);
  if (existing) return existing;

  if (!IS_LIVE) {
    // Mock mode always has the seeded demo host; fall back to it.
    const demo = mockGetHostByUserId(user.id);
    if (demo) return demo;
    throw new Error("No host profile");
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("hosts")
    .insert({ user_id: user.id, display_name: user.name || "New host" })
    .select(HOST_COLS)
    .single();
  if (error || !data) throw new Error(`could not create host: ${error?.message}`);
  return hostFromRow(data);
}

export async function getSpacesForHost(hostId: string): Promise<Space[]> {
  if (!IS_LIVE) return mockGetSpacesByHost(hostId);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("spaces")
    .select(SPACE_COLS)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`spaces read failed: ${error.message}`);
  return (data ?? []).map(spaceFromRow);
}

export async function createSpaceForHost(
  input: CreateSpaceInput,
  photos?: string[]
): Promise<Space> {
  if (!IS_LIVE) return mockCreateSpace(input);

  const airport = getAirport(input.airportSlug);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("spaces")
    .insert({
      host_id: input.hostId,
      title: input.title,
      airport_slug: input.airportSlug,
      approx_area: input.approxArea,
      exact_address: input.exactAddress,
      lat: (airport?.lat ?? 51.47) + 0.02,
      lng: (airport?.lng ?? -0.45) + 0.02,
      distance_miles: 2.5,
      drive_minutes: 9,
      dimensions: { lengthM: input.lengthM, widthM: input.widthM },
      capacity: input.capacity ?? 1,
      max_vehicle_size: input.maxVehicleSize,
      ev_charger: input.evCharger,
      cctv: input.cctv,
      live_camera: input.liveCamera,
      covered: input.covered ?? false,
      access_rules: input.accessRules,
      photos: photos?.length ? photos.slice(0, 6) : ["drive-1"],
      price_per_day: input.pricePerDay,
      price_per_hour: input.pricePerHour ?? null,
      status: "pending_review",
    })
    .select(SPACE_COLS)
    .single();
  if (error || !data) throw new Error(`could not create space: ${error?.message}`);
  return spaceFromRow(data);
}

// -----------------------------------------------------------------------------
// Space + host reads (traveller-facing)
// -----------------------------------------------------------------------------

export async function getSpaceById(id: string): Promise<Space | null> {
  if (!IS_LIVE) return mockGetSpace(id) ?? null;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("spaces").select(SPACE_COLS).eq("id", id).maybeSingle();
  return data ? spaceFromRow(data) : null;
}

export async function getSpacesByIds(ids: string[]): Promise<Map<string, Space>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, Space>();
  if (unique.length === 0) return map;
  if (!IS_LIVE) {
    unique.forEach((id) => {
      const s = mockGetSpace(id);
      if (s) map.set(id, s);
    });
    return map;
  }
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("spaces").select(SPACE_COLS).in("id", unique);
  (data ?? []).forEach((r) => map.set(r.id, spaceFromRow(r)));
  return map;
}

export async function getHostById(id: string): Promise<Host | null> {
  if (!IS_LIVE) return mockGetHost(id) ?? null;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("hosts").select(HOST_COLS).eq("id", id).maybeSingle();
  return data ? hostFromRow(data) : null;
}

/** Search live listings at an airport, apply filters, and price each result. */
export async function searchLiveSpaces(query: SearchQuery): Promise<SearchResult[]> {
  const airport = getAirport(query.airportSlug);
  if (!airport) return [];
  if (!IS_LIVE) return mockSearchSpaces(query);

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("spaces")
    .select(SPACE_COLS)
    .eq("airport_slug", query.airportSlug)
    .eq("status", "live");

  const start = query.startAt ?? new Date().toISOString();
  const end = query.endAt ?? new Date(Date.now() + 5 * 86_400_000).toISOString();
  const currency = airport.country === "IE" ? "EUR" : "GBP";

  const candidates = (data ?? [])
    .map(spaceFromRow)
    .filter((s) => (query.needsEv ? !!s.evCharger : true))
    .filter((s) => (query.needsCctv ? s.cctv || s.liveCamera : true))
    .filter((s) => (query.needsCovered ? !!s.covered : true))
    .filter((s) => (query.needsAccessible ? !!s.accessible : true))
    .filter((s) => (query.maxPricePerDay ? s.pricePerDay <= query.maxPricePerDay : true))
    .filter((s) => (query.vehicleSize ? fitsVehicle(s, query.vehicleSize) : true));

  // Availability: hide spaces whose paid/active bookings already fill the
  // capacity for the requested window (overlap: starts before we end AND ends
  // after we start).
  const booked = new Map<string, number>();
  if (candidates.length > 0) {
    const { data: overlaps } = await supabaseAdmin()
      .from("bookings")
      .select("space_id")
      .in(
        "space_id",
        candidates.map((s) => s.id)
      )
      .in("status", ["paid", "active"])
      .lt("start_at", end)
      .gt("end_at", start);
    (overlaps ?? []).forEach((b) =>
      booked.set(b.space_id, (booked.get(b.space_id) ?? 0) + 1)
    );
  }

  return candidates
    .filter((s) => (booked.get(s.id) ?? 0) < (s.capacity ?? 1))
    .map((space) => {
      const bundle: BookingBundle = {
        parking: true,
        transfer: !!query.needsTransfer,
        ev: !!query.needsEv && !!space.evCharger,
      };
      const price = priceBundle(space, bundle, start, end, currency);
      return { space, airport, estimatedTotal: price.total };
    })
    .sort((a, b) => b.space.rating - a.space.rating || a.space.driveMinutes - b.space.driveMinutes);
}

// -----------------------------------------------------------------------------
// Admin: listing moderation
// -----------------------------------------------------------------------------

/** All listings (admin view — includes pending/rejected). Newest first. */
export async function listAllSpaces(): Promise<Space[]> {
  if (!IS_LIVE) return mockGetAllSpaces();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin()
    .from("spaces")
    .select(SPACE_COLS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`spaces read failed: ${error.message}`);
  return (data ?? []).map(spaceFromRow);
}

/** All hosts (admin trust panel). Newest first in live mode. */
export async function listAllHosts(): Promise<Host[]> {
  if (!IS_LIVE) return mockGetAllHosts();
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin()
    .from("hosts")
    .select(HOST_COLS)
    .order("joined_at", { ascending: false });
  return (data ?? []).map(hostFromRow);
}

/** Resolve host records for a set of ids (for showing owner names in the admin list). */
export async function getHostsByIds(ids: string[]): Promise<Map<string, Host>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, Host>();
  if (unique.length === 0) return map;

  if (!IS_LIVE) {
    unique.forEach((id) => {
      const h = mockGetHost(id);
      if (h) map.set(id, h);
    });
    return map;
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data } = await supabaseAdmin().from("hosts").select(HOST_COLS).in("id", unique);
  (data ?? []).forEach((r) => map.set(r.id, hostFromRow(r)));
  return map;
}

/**
 * Admin decision on a listing: approve -> live, reject -> rejected. Notifies the
 * owning host. Supabase in live mode, seed store in mock.
 */
export async function reviewSpaceListing(
  spaceId: string,
  decision: "approved" | "rejected",
  reviewerId: string
): Promise<Space | null> {
  if (!IS_LIVE) return mockReviewSpace(spaceId, decision, reviewerId) ?? null;

  const status = decision === "approved" ? "live" : "rejected";
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { data: row, error } = await admin
    .from("spaces")
    .update({ status })
    .eq("id", spaceId)
    .select(SPACE_COLS)
    .single();
  if (error || !row) return null;
  const space = spaceFromRow(row);

  // Notify the owning host.
  const { data: host } = await admin
    .from("hosts")
    .select("user_id")
    .eq("id", space.hostId)
    .maybeSingle();
  if (host?.user_id) {
    await admin.from("notifications").insert({
      user_id: host.user_id,
      title: decision === "approved" ? "Listing approved 🎉" : "Listing needs changes",
      body:
        decision === "approved"
          ? `“${space.title}” is now live and visible to travellers searching near your airport.`
          : `“${space.title}” wasn't approved. Please update the details and resubmit.`,
      kind: "verification",
    });
  }
  return space;
}

/**
 * Pause/reactivate a listing that's already live. Pausing hides it from
 * traveller search without deleting anything; reactivating restores it.
 * Only flips between live <-> paused, so pending/rejected listings are safe.
 * notifyHost=false when the host paused their own listing (holiday mode) —
 * the notification is worded as an admin action.
 */
export async function setSpacePausedAdmin(
  spaceId: string,
  paused: boolean,
  notifyHost = true
): Promise<Space | null> {
  if (!IS_LIVE) return mockSetSpacePaused(spaceId, paused, notifyHost) ?? null;

  const from = paused ? "live" : "paused";
  const to = paused ? "paused" : "live";
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const { data: row, error } = await admin
    .from("spaces")
    .update({ status: to })
    .eq("id", spaceId)
    .eq("status", from)
    .select(SPACE_COLS)
    .single();
  if (error || !row) return null;
  const space = spaceFromRow(row);

  const { data: host } = await admin
    .from("hosts")
    .select("user_id")
    .eq("id", space.hostId)
    .maybeSingle();
  if (host?.user_id && notifyHost) {
    await admin.from("notifications").insert({
      user_id: host.user_id,
      title: paused ? "Listing paused" : "Listing reactivated",
      body: paused
        ? `“${space.title}” was paused by the ParkGo team and is hidden from search. Contact support for details.`
        : `“${space.title}” is live again and visible to travellers searching near your airport.`,
      kind: "verification",
    });
  }
  return space;
}

export interface UpdateSpaceInput {
  title: string;
  approxArea: string;
  exactAddress: string;
  pricePerDay: number; // pence
  pricePerHour?: number | null; // pence, null clears the hourly rate
  capacity: number;
  maxVehicleSize: Space["maxVehicleSize"];
  cctv: boolean;
  liveCamera: boolean;
  covered?: boolean;
  evCharger: Space["evCharger"];
  accessRules: string;
  lengthM: number;
  widthM: number;
  /** Appended to existing photos (uploaded URLs). */
  newPhotos?: string[];
  /** Existing photo entries (URL or scene token) to drop from the listing. */
  removePhotos?: string[];
  /** Full replacement set of host-blocked days ("YYYY-MM-DD"); omit = unchanged. */
  blockedDates?: string[];
  /** Weekend (Sat/Sun) uplift percent; omit = unchanged, 0 clears it. */
  weekendUpliftPct?: number;
  /** Per-date price overrides in pence; omit = unchanged, {} clears all. */
  customPrices?: Record<string, number>;
  /** Named bays for multi-car spaces; omit = unchanged, [] clears. */
  bayNames?: string[];
  /** Approval-first bookings; omit = unchanged. */
  requestToBook?: boolean;
}

/**
 * Host edit of their own listing. A rejected listing that gets edited goes back
 * into the review queue (resubmit); other statuses are preserved.
 */
export async function updateSpaceForHost(
  spaceId: string,
  hostId: string,
  input: UpdateSpaceInput
): Promise<Space | null> {
  if (!IS_LIVE) {
    const s = mockGetSpace(spaceId);
    if (!s || s.hostId !== hostId) return null;
    s.title = input.title;
    s.approxArea = input.approxArea;
    s.exactAddress = input.exactAddress;
    s.pricePerDay = input.pricePerDay;
    s.pricePerHour = input.pricePerHour ?? undefined;
    s.capacity = Math.max(1, input.capacity || 1);
    s.maxVehicleSize = input.maxVehicleSize;
    s.cctv = input.cctv;
    s.liveCamera = input.liveCamera;
    s.covered = input.covered ?? false;
    s.evCharger = input.evCharger;
    s.accessRules = input.accessRules;
    s.dimensions = { lengthM: input.lengthM, widthM: input.widthM };
    if (input.blockedDates !== undefined) s.blockedDates = input.blockedDates;
    if (input.weekendUpliftPct !== undefined)
      s.weekendUpliftPct = input.weekendUpliftPct || undefined;
    if (input.customPrices !== undefined)
      s.customPrices = Object.keys(input.customPrices).length ? input.customPrices : undefined;
    if (input.bayNames !== undefined)
      s.bayNames = input.bayNames.length ? input.bayNames : undefined;
    if (input.requestToBook !== undefined) s.requestToBook = input.requestToBook || undefined;
    {
      const removeSet = new Set(input.removePhotos ?? []);
      let photos = s.photos.filter((p) => !removeSet.has(p));
      if (input.newPhotos?.length) {
        // Real uploads replace placeholder tokens (non-URL entries).
        photos = [...photos.filter((p) => p.startsWith("http")), ...input.newPhotos];
      }
      // A listing always keeps at least one image.
      s.photos = (photos.length ? photos : ["drive-1"]).slice(0, 6);
    }
    if (s.status === "rejected") s.status = "pending_review";
    return s;
  }

  const current = await getSpaceById(spaceId);
  if (!current || current.hostId !== hostId) return null;

  const removeSet = new Set(input.removePhotos ?? []);
  let photos = current.photos.filter((p) => !removeSet.has(p));
  if (input.newPhotos?.length) {
    photos = [...photos.filter((p) => p.startsWith("http")), ...input.newPhotos];
  }
  photos = (photos.length ? photos : ["drive-1"]).slice(0, 6);

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const baseUpdate = {
    title: input.title,
    approx_area: input.approxArea,
    exact_address: input.exactAddress,
    price_per_day: input.pricePerDay,
    price_per_hour: input.pricePerHour ?? null,
    capacity: Math.max(1, input.capacity || 1),
    max_vehicle_size: input.maxVehicleSize,
    cctv: input.cctv,
    live_camera: input.liveCamera,
    covered: input.covered ?? false,
    ev_charger: input.evCharger,
    access_rules: input.accessRules,
    dimensions: { lengthM: input.lengthM, widthM: input.widthM },
    photos,
    ...(current.status === "rejected" ? { status: "pending_review" } : {}),
  };
  const doUpdate = (payload: Record<string, unknown>) =>
    supabaseAdmin()
      .from("spaces")
      .update(payload)
      .eq("id", spaceId)
      .eq("host_id", hostId)
      .select(SPACE_COLS)
      .single();

  // Columns added by later migrations (0014/0020/0021) — sent only when the
  // form provided them, dropped wholesale if the database predates them.
  const extras: Record<string, unknown> = {
    ...(input.blockedDates !== undefined ? { blocked_dates: input.blockedDates } : {}),
    ...(input.weekendUpliftPct !== undefined
      ? { weekend_uplift_pct: input.weekendUpliftPct || null }
      : {}),
    ...(input.customPrices !== undefined ? { custom_prices: input.customPrices } : {}),
    ...(input.bayNames !== undefined ? { bay_names: input.bayNames } : {}),
    ...(input.requestToBook !== undefined ? { request_to_book: input.requestToBook } : {}),
  };
  const hasExtras = Object.keys(extras).length > 0;
  let { data, error } = await doUpdate(hasExtras ? { ...baseUpdate, ...extras } : baseUpdate);
  if (error && hasExtras) {
    ({ data, error } = await doUpdate(baseUpdate));
  }
  if (error || !data) return null;

  // Purge files for uploads that actually came off this listing (never raw
  // input — only URLs that were on current.photos and are now removed).
  const removedFiles = current.photos.filter(
    (p) => p.startsWith("http") && !photos.includes(p)
  );
  if (removedFiles.length) {
    const { deleteSpacePhotos } = await import("@/lib/storage");
    await deleteSpacePhotos(removedFiles);
  }
  return spaceFromRow(data);
}

/** Persist the host's Stripe Connect account id (payout_account_ref). */
/** Manual payout details for pre-Stripe bank runs (digits only, masked in UI). */
export async function setHostBank(
  hostId: string,
  bankSort: string,
  bankAccount: string
): Promise<boolean> {
  const sort = bankSort.replace(/\D/g, "").slice(0, 6);
  const account = bankAccount.replace(/\D/g, "").slice(0, 8);
  if (sort.length !== 6 || account.length !== 8) return false;
  if (!IS_LIVE) {
    const { getHost } = await import("@/lib/data/store");
    const h = getHost(hostId);
    if (!h) return false;
    h.bankSort = sort;
    h.bankAccount = account;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("hosts")
      .update({ bank_sort: sort, bank_account: account })
      .eq("id", hostId);
    return !error;
  } catch {
    return false;
  }
}

/** Welcome message auto-posted into the thread when a booking is confirmed. */
export async function setHostAutoWelcome(hostId: string, text: string): Promise<boolean> {
  const welcome = text.trim().slice(0, 600) || null;
  if (!IS_LIVE) {
    const { getHost } = await import("@/lib/data/store");
    const h = getHost(hostId);
    if (!h) return false;
    h.autoWelcome = welcome ?? undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("hosts")
      .update({ auto_welcome: welcome })
      .eq("id", hostId);
    return !error;
  } catch {
    return false;
  }
}

/** Full replacement of the host's blocked-guest list (capped). */
export async function setHostBlockedGuests(hostId: string, guestIds: string[]): Promise<boolean> {
  const list = [...new Set(guestIds.filter(Boolean))].slice(0, 200);
  if (!IS_LIVE) {
    const { getHost } = await import("@/lib/data/store");
    const h = getHost(hostId);
    if (!h) return false;
    h.blockedGuests = list.length ? list : undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("hosts")
      .update({ blocked_guests: list })
      .eq("id", hostId);
    return !error;
  } catch {
    return false;
  }
}

/** Link (or clear) the host's limited co-host account. */
export async function setHostCohost(
  hostId: string,
  cohost: { userId: string; email: string } | null
): Promise<boolean> {
  if (!IS_LIVE) {
    const { getHost } = await import("@/lib/data/store");
    const h = getHost(hostId);
    if (!h) return false;
    h.cohostUserId = cohost?.userId ?? undefined;
    h.cohostEmail = cohost?.email ?? undefined;
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("hosts")
      .update({
        cohost_user_id: cohost?.userId ?? null,
        cohost_email: cohost?.email ?? null,
      })
      .eq("id", hostId);
    return !error;
  } catch {
    return false;
  }
}

export async function setHostPayoutAccount(hostId: string, accountId: string): Promise<void> {
  if (!IS_LIVE) return;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  await supabaseAdmin().from("hosts").update({ payout_account_ref: accountId }).eq("id", hostId);
}

/** Update the host's public bio. False when the write failed (e.g. hosts.bio
 *  column missing — migration 0009 not run yet), so the UI can say so. */
export async function updateHostBio(hostId: string, bio: string): Promise<boolean> {
  if (!IS_LIVE) {
    return !!mockUpdateHostProfile(hostId, { bio });
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin().from("hosts").update({ bio }).eq("id", hostId);
    return !error;
  } catch {
    return false;
  }
}
