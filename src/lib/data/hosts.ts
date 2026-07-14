import type { Host, Space, User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getHostByUserId as mockGetHostByUserId,
  getSpacesByHost as mockGetSpacesByHost,
  createSpace as mockCreateSpace,
  updateHostProfile as mockUpdateHostProfile,
  getAllSpaces as mockGetAllSpaces,
  getHost as mockGetHost,
  reviewSpace as mockReviewSpace,
  getAirport,
  type CreateSpaceInput,
} from "@/lib/data/store";

const HOST_COLS =
  "id, user_id, display_name, verification_status, payout_account_ref, rating, joined_at";
const SPACE_COLS =
  "id, host_id, title, airport_slug, approx_area, exact_address, lat, lng, distance_miles, drive_minutes, dimensions, max_vehicle_size, ev_charger, cctv, live_camera, access_rules, photos, price_per_day, rating, review_count, status, created_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function hostFromRow(r: any): Host {
  return {
    id: r.id,
    userId: r.user_id,
    displayName: r.display_name,
    verificationStatus: r.verification_status,
    payoutAccountRef: r.payout_account_ref ?? undefined,
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
    maxVehicleSize: r.max_vehicle_size,
    evCharger: r.ev_charger ?? null,
    cctv: r.cctv,
    liveCamera: r.live_camera,
    accessRules: r.access_rules,
    photos: r.photos ?? [],
    pricePerDay: r.price_per_day,
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

export async function createSpaceForHost(input: CreateSpaceInput): Promise<Space> {
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
      max_vehicle_size: input.maxVehicleSize,
      ev_charger: input.evCharger,
      cctv: input.cctv,
      live_camera: input.liveCamera,
      access_rules: input.accessRules,
      photos: ["drive-1"],
      price_per_day: input.pricePerDay,
      status: "pending_review",
    })
    .select(SPACE_COLS)
    .single();
  if (error || !data) throw new Error(`could not create space: ${error?.message}`);
  return spaceFromRow(data);
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

/** Update the host's public bio. Best-effort in live mode (column optional). */
export async function updateHostBio(hostId: string, bio: string): Promise<void> {
  if (!IS_LIVE) {
    mockUpdateHostProfile(hostId, { bio });
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("hosts").update({ bio }).eq("id", hostId);
  } catch {
    // hosts.bio column may not exist yet — non-fatal for the listing flow.
  }
}
