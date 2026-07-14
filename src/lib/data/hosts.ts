import type { Host, Space, User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import {
  getHostByUserId as mockGetHostByUserId,
  getSpacesByHost as mockGetSpacesByHost,
  createSpace as mockCreateSpace,
  updateHostProfile as mockUpdateHostProfile,
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
