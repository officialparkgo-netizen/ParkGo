/**
 * Mock data API.
 *
 * In `mock` mode (the default) this is an in-memory store seeded from seed.ts.
 * State is held on `globalThis` so it survives Next.js HMR in dev and persists
 * writes (e.g. new bookings) for the life of the server process.
 *
 * In `live` mode each function here maps 1:1 to a Supabase query against the
 * schema in supabase/migrations/0001_init.sql — swap the bodies, keep the
 * signatures, and the UI/API layers are unchanged.
 */
import type {
  Airport,
  Booking,
  BookingBundle,
  CameraStream,
  Driver,
  Host,
  Notification,
  Payment,
  Review,
  SearchQuery,
  SearchResult,
  Space,
  Transfer,
  TransferProvider,
  TrustScore,
  User,
  Vehicle,
  Verification,
  VerificationStatus,
  WaitlistEntry,
  SupportTicket,
} from "@/types";
import * as seed from "@/lib/data/seed";
import { priceBundle } from "@/lib/pricing";
import { averageRating, computeTrustScore } from "@/lib/trust";
import { accessCode, nextId, shortRef } from "@/lib/utils";

interface DB {
  airports: Airport[];
  users: User[];
  hosts: Host[];
  spaces: Space[];
  transferProviders: TransferProvider[];
  drivers: Driver[];
  vehicles: Vehicle[];
  bookings: Booking[];
  transfers: Transfer[];
  cameraStreams: CameraStream[];
  payments: Payment[];
  reviews: Review[];
  verifications: Verification[];
  notifications: Notification[];
  waitlist: WaitlistEntry[];
}

const g = globalThis as unknown as { __parkgoDB?: DB };

function freshDB(): DB {
  // Shallow clone the seed arrays so mutations don't leak back into the module.
  return {
    airports: [...seed.airports],
    users: [...seed.users],
    hosts: [...seed.hosts],
    spaces: [...seed.spaces],
    transferProviders: [...seed.transferProviders],
    drivers: [...seed.drivers],
    vehicles: [...seed.vehicles],
    bookings: [...seed.bookings],
    transfers: [...seed.transfers],
    cameraStreams: [...seed.cameraStreams],
    payments: [...seed.payments],
    reviews: [...seed.reviews],
    verifications: [...seed.verifications],
    notifications: [...seed.notifications],
    waitlist: [...seed.waitlist],
  };
}

const db: DB = (g.__parkgoDB ??= freshDB());

// -----------------------------------------------------------------------------
// Airports
// -----------------------------------------------------------------------------
export const getAirports = () => db.airports;
export const getAirport = (slug: string) => db.airports.find((a) => a.slug === slug);

// -----------------------------------------------------------------------------
// Users / auth helpers
// -----------------------------------------------------------------------------
export const getUser = (id: string) => db.users.find((u) => u.id === id);
export const getUserByEmail = (email: string) =>
  db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

// -----------------------------------------------------------------------------
// Hosts & spaces
// -----------------------------------------------------------------------------
export const getHost = (id: string) => db.hosts.find((h) => h.id === id);
export const getHostByUserId = (userId: string) =>
  db.hosts.find((h) => h.userId === userId);

/** Host profile edit (Airbnb-style intro shown to guests). */
export function updateHostProfile(
  hostId: string,
  patch: { bio?: string }
): Host | undefined {
  const host = getHost(hostId);
  if (!host) return undefined;
  if (patch.bio !== undefined) host.bio = patch.bio;
  return host;
}
export const getSpace = (id: string) => db.spaces.find((s) => s.id === id);
export const getSpacesByHost = (hostId: string) =>
  db.spaces.filter((s) => s.hostId === hostId);
export const getAllSpaces = () => db.spaces;
export const getAllUsers = () => db.users;
export const getAllBookings = () => db.bookings;
export const getAllReviews = () => db.reviews;
export const getAllHosts = () => db.hosts;
export const getAllDrivers = () => db.drivers;
export const getAllTransfers = () => db.transfers;

export interface CreateSpaceInput {
  hostId: string;
  title: string;
  airportSlug: string;
  capacity?: number;
  approxArea: string;
  exactAddress: string;
  pricePerDay: number;
  pricePerHour?: number | null;
  maxVehicleSize: Space["maxVehicleSize"];
  cctv: boolean;
  liveCamera: boolean;
  covered?: boolean;
  evCharger: Space["evCharger"];
  accessRules: string;
  lengthM: number;
  widthM: number;
}

/** Create a host listing (enters the verification queue as pending_review). */
export function createSpace(input: CreateSpaceInput): Space {
  const airport = getAirport(input.airportSlug);
  const id = `space_${input.airportSlug}_${db.spaces.length + 1}`;
  const space: Space = {
    id,
    hostId: input.hostId,
    title: input.title,
    airportSlug: input.airportSlug,
    approxArea: input.approxArea,
    exactAddress: input.exactAddress,
    lat: (airport?.lat ?? 51.47) + 0.02,
    lng: (airport?.lng ?? -0.45) + 0.02,
    distanceMiles: 2.5,
    driveMinutes: 9,
    dimensions: { lengthM: input.lengthM, widthM: input.widthM },
    capacity: input.capacity ?? 1,
    maxVehicleSize: input.maxVehicleSize,
    evCharger: input.evCharger,
    cctv: input.cctv,
    liveCamera: input.liveCamera,
    covered: input.covered ?? false,
    accessRules: input.accessRules,
    photos: ["drive-1"],
    pricePerDay: input.pricePerDay,
    pricePerHour: input.pricePerHour ?? undefined,
    rating: 0,
    reviewCount: 0,
    status: "pending_review",
    createdAt: new Date().toISOString(),
  };
  db.spaces.push(space);
  return space;
}

export function searchSpaces(query: SearchQuery): SearchResult[] {
  const airport = getAirport(query.airportSlug);
  if (!airport) return [];
  return db.spaces
    .filter((s) => s.airportSlug === query.airportSlug && s.status === "live")
    .filter((s) => (query.needsEv ? !!s.evCharger : true))
    .filter((s) => (query.needsCctv ? s.cctv || s.liveCamera : true))
    .filter((s) => (query.needsCovered ? !!s.covered : true))
    .filter((s) => (query.maxPricePerDay ? s.pricePerDay <= query.maxPricePerDay : true))
    .filter((s) => (query.vehicleSize ? fitsVehicle(s, query.vehicleSize) : true))
    .map((space) => {
      const start = query.startAt ?? new Date().toISOString();
      const end = query.endAt ?? new Date(Date.now() + 5 * 86_400_000).toISOString();
      const bundle: BookingBundle = {
        parking: true,
        transfer: !!query.needsTransfer,
        ev: !!query.needsEv && !!space.evCharger,
      };
      const price = priceBundle(space, bundle, start, end, airport.country === "IE" ? "EUR" : "GBP");
      return { space, airport, estimatedTotal: price.total };
    })
    .sort((a, b) => b.space.rating - a.space.rating || a.space.driveMinutes - b.space.driveMinutes);
}

const SIZE_ORDER = { small: 0, medium: 1, large: 2, van: 3 } as const;
function fitsVehicle(space: Space, size: SearchQuery["vehicleSize"]) {
  if (!size) return true;
  return SIZE_ORDER[space.maxVehicleSize] >= SIZE_ORDER[size];
}

// -----------------------------------------------------------------------------
// Transfer providers, drivers, vehicles
// -----------------------------------------------------------------------------
export const getTransferProvider = (id: string) =>
  db.transferProviders.find((p) => p.id === id);
export const getTransferProviderByUser = (userId: string) =>
  db.transferProviders.find((p) => p.userId === userId);
export const getDriversByProvider = (providerId: string) =>
  db.drivers.filter((d) => d.providerId === providerId);
export const getVehiclesByProvider = (providerId: string) =>
  db.vehicles.filter((v) => v.providerId === providerId);
export const getDriver = (id: string) => db.drivers.find((d) => d.id === id);
export const getVehicle = (id: string) => db.vehicles.find((v) => v.id === id);

// -----------------------------------------------------------------------------
// Bookings & transfers
// -----------------------------------------------------------------------------
export const getBooking = (id: string) => db.bookings.find((b) => b.id === id);
export const getBookingByReference = (reference: string) =>
  db.bookings.find((b) => b.reference === reference);
export const getBookingsByTraveller = (travellerId: string) =>
  db.bookings
    .filter((b) => b.travellerId === travellerId)
    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
export const getBookingsForHost = (hostId: string) => {
  const spaceIds = new Set(getSpacesByHost(hostId).map((s) => s.id));
  return db.bookings.filter((b) => spaceIds.has(b.spaceId));
};
export const getTransfer = (id: string) => db.transfers.find((t) => t.id === id);
export const getTransferByBooking = (bookingId: string) =>
  db.transfers.find((t) => t.bookingId === bookingId);
export const getJobsForProvider = (providerId: string) =>
  db.transfers.filter((t) => t.providerId === providerId);

export interface CreateBookingInput {
  travellerId: string;
  spaceId: string;
  bundle: BookingBundle;
  startAt: string;
  endAt: string;
  method?: Payment["method"];
}

/** Create a booking + payment (+ transfer job if bundled). Returns the booking. */
export function createBooking(input: CreateBookingInput): Booking {
  const space = getSpace(input.spaceId);
  if (!space) throw new Error(`Unknown space: ${input.spaceId}`);
  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";

  const price = priceBundle(space, input.bundle, input.startAt, input.endAt, currency);
  const reference = shortRef(`${input.spaceId}|${input.travellerId}|${db.bookings.length}`);
  const id = `bk_${reference.replace("PG-", "").toLowerCase()}`;
  const qrToken = `${reference}|${space.id}|${input.travellerId}`;

  const booking: Booking = {
    id,
    reference,
    travellerId: input.travellerId,
    spaceId: input.spaceId,
    bundle: input.bundle,
    startAt: input.startAt,
    endAt: input.endAt,
    status: "paid",
    price,
    qrToken,
    createdAt: new Date().toISOString(),
  };

  // Payment with marketplace split (mock provider).
  db.payments.push({
    id: `pay_${id}`,
    bookingId: id,
    provider: "mock",
    method: input.method ?? "card",
    amount: price.total,
    currency,
    split: price.split,
    payoutStatus: "pending",
    createdAt: booking.createdAt,
  });

  // Auto-create an unassigned transfer job when bundled.
  if (input.bundle.transfer) {
    const provider = db.transferProviders.find((p) => p.verificationStatus === "approved");
    const transferId = `tr_${id}`;
    db.transfers.push({
      id: transferId,
      bookingId: id,
      providerId: provider?.id ?? "tp_swiftlink",
      status: "unassigned",
      pickupAt: input.startAt,
      handoverCode: accessCode(qrToken, 6),
    });
    booking.transferId = transferId;
  }

  db.bookings.unshift(booking);
  db.notifications.unshift({
    id: `ntf_${id}`,
    userId: input.travellerId,
    title: "Booking confirmed",
    body: `${reference} · QR ready in your wallet.`,
    kind: "booking",
    read: false,
    createdAt: booking.createdAt,
  });
  return booking;
}

/**
 * Extend a paid/active booking to a later pick-up: reprice the whole window,
 * charge the difference as a second payment, and notify both sides.
 */
export function extendBooking(bookingId: string, newEndAt: string): Booking | undefined {
  const booking = getBooking(bookingId);
  if (!booking) return undefined;
  if (booking.status !== "paid" && booking.status !== "active") return undefined;
  if (new Date(newEndAt) <= new Date(booking.endAt)) return booking; // already covers it

  const space = getSpace(booking.spaceId);
  if (!space) return undefined;
  const airport = getAirport(space.airportSlug);
  const newPrice = priceBundle(
    space,
    booking.bundle,
    booking.startAt,
    newEndAt,
    airport?.country === "IE" ? "EUR" : "GBP"
  );
  const extra = newPrice.total - booking.price.total;
  if (extra <= 0) return booking;
  const deltaSplit = {
    platform: newPrice.split.platform - booking.price.split.platform,
    hostPayout: newPrice.split.hostPayout - booking.price.split.hostPayout,
    driverPayout: newPrice.split.driverPayout - booking.price.split.driverPayout,
  };

  booking.endAt = newEndAt;
  booking.price = newPrice;

  db.payments.push({
    id: `pay_ext_${bookingId}_${db.payments.length}`,
    bookingId,
    provider: "mock",
    method: "card",
    amount: extra,
    currency: newPrice.currency,
    split: deltaSplit,
    payoutStatus: "pending",
    createdAt: new Date().toISOString(),
  });

  addNotification({
    userId: booking.travellerId,
    title: "Booking extended",
    body: `${booking.reference} now ends ${new Date(newEndAt).toDateString()}.`,
    kind: "booking",
  });
  const host = getHost(space.hostId);
  const hostUser = host ? getUser(host.userId) : undefined;
  if (hostUser) {
    addNotification({
      userId: hostUser.id,
      title: `Booking extended · ${booking.reference}`,
      body: `“${space.title}” is now booked until ${new Date(newEndAt).toDateString()}.`,
      kind: "booking",
    });
  }
  return booking;
}

export type HandoverResult =
  | { ok: true; transfer: Transfer }
  | { ok: false; error: string };

/** Verified handover: both parties confirm the 6-char code. */
export function confirmHandover(transferId: string, code: string): HandoverResult {
  const transfer = getTransfer(transferId);
  if (!transfer) return { ok: false, error: "Transfer not found" };
  if (transfer.handoverConfirmedAt) return { ok: false, error: "Handover already confirmed" };
  if (transfer.handoverCode.toUpperCase() !== code.trim().toUpperCase()) {
    return { ok: false, error: "Code does not match" };
  }
  transfer.status = "completed";
  transfer.handoverConfirmedAt = new Date().toISOString();
  return { ok: true, transfer };
}

// -----------------------------------------------------------------------------
// Camera & realtime
// -----------------------------------------------------------------------------
export const getCamerasForSpace = (spaceId: string) =>
  db.cameraStreams.filter((c) => c.spaceId === spaceId);

// -----------------------------------------------------------------------------
// Reviews & trust
// -----------------------------------------------------------------------------
export const getReviewsForSubject = (subjectId: string) =>
  db.reviews.filter((r) => r.subjectId === subjectId);
export const getReviewsForSpace = (spaceId: string) =>
  db.reviews.filter((r) => r.subjectId === spaceId && r.subjectType === "space");

export function addReview(input: Omit<Review, "id" | "createdAt">): Review {
  const review: Review = {
    ...input,
    id: `rev_${db.reviews.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  // Recompute the space's headline rating when a space is reviewed.
  if (input.subjectType === "space") {
    const space = getSpace(input.subjectId);
    if (space) {
      const spaceReviews = getReviewsForSpace(space.id);
      space.reviewCount = spaceReviews.length;
      space.rating =
        Math.round(
          (spaceReviews.reduce((s, r) => s + r.rating, 0) / spaceReviews.length) * 10
        ) / 10;
    }
  }
  return review;
}

export function setBookingStatus(id: string, status: Booking["status"]) {
  const booking = getBooking(id);
  if (booking) booking.status = status;
  return booking;
}

export function trustScoreFor(
  subjectId: string,
  subjectType: TrustScore["subjectType"]
): TrustScore {
  const reviews = getReviewsForSubject(subjectId);
  let verification: VerificationStatus = "approved";
  let tenureDays = 365;

  if (subjectType === "host") {
    const host = getHost(subjectId);
    verification = host?.verificationStatus ?? "not_started";
    tenureDays = host ? daysSince(host.joinedAt) : 0;
  } else if (subjectType === "driver") {
    const driver = getDriver(subjectId);
    verification = driver?.verificationStatus ?? "not_started";
  } else if (subjectType === "traveller") {
    const user = getUser(subjectId);
    tenureDays = user ? daysSince(user.createdAt) : 0;
  }

  // Reliability: completed vs cancelled bookings touching this subject.
  const reliability = 0.95;

  return computeTrustScore({
    subjectId,
    subjectType,
    verification,
    reviews,
    reliability,
    tenureDays,
    updatedAt: new Date().toISOString(),
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// -----------------------------------------------------------------------------
// Verification (admin)
// -----------------------------------------------------------------------------
export const getVerifications = () => db.verifications;
export const getPendingVerifications = () =>
  db.verifications.filter((v) => v.status === "in_review" || v.status === "pending");

export function reviewVerification(
  id: string,
  decision: "approved" | "rejected",
  reviewerId: string,
  notes?: string
): Verification | undefined {
  const v = db.verifications.find((x) => x.id === id);
  if (!v) return undefined;
  v.status = decision;
  v.reviewedAt = new Date().toISOString();
  v.reviewerId = reviewerId;
  v.notes = notes;

  // Propagate the decision to the underlying subject + go live.
  if (v.subjectType === "host") {
    const host = getHost(v.subjectId);
    if (host) host.verificationStatus = decision;
    if (decision === "approved") {
      db.spaces
        .filter((s) => s.hostId === v.subjectId && s.status === "pending_review")
        .forEach((s) => (s.status = "live"));
    }
    notifySubjectUser(host?.userId, decision, "Host verification");
  } else if (v.subjectType === "transfer") {
    const provider = getTransferProvider(v.subjectId);
    if (provider) provider.verificationStatus = decision;
    notifySubjectUser(provider?.userId, decision, "Operator verification");
  }
  return v;
}

function notifySubjectUser(
  userId: string | undefined,
  decision: "approved" | "rejected",
  subject: string
) {
  if (!userId) return;
  addNotification({
    userId,
    title: decision === "approved" ? `${subject} approved` : `${subject} declined`,
    body:
      decision === "approved"
        ? `${subject} is approved — you're good to go.`
        : `${subject} needs attention. Please review and resubmit.`,
    kind: "verification",
  });
}

/**
 * Admin decision on a single listing (works for any host, including those
 * already verified). Approving flips the space to `live`; rejecting marks it
 * `rejected`. Either way the host is notified.
 */
export function reviewSpace(
  spaceId: string,
  decision: "approved" | "rejected",
  _reviewerId: string,
  notes?: string
): Space | undefined {
  const space = getSpace(spaceId);
  if (!space) return undefined;
  space.status = decision === "approved" ? "live" : "rejected";

  const host = getHost(space.hostId);
  const hostUser = host ? getUser(host.userId) : undefined;
  if (hostUser) {
    addNotification({
      userId: hostUser.id,
      title: decision === "approved" ? "Listing approved 🎉" : "Listing needs changes",
      body:
        decision === "approved"
          ? `“${space.title}” is now live and visible to travellers in search.`
          : `“${space.title}” wasn't approved.${notes ? ` ${notes}` : " Please update the details and resubmit."}`,
      kind: "verification",
    });
  }
  return space;
}

/** Admin pause/reactivate of a live listing. Pausing hides it from search. */
export function setSpacePaused(spaceId: string, paused: boolean): Space | undefined {
  const space = getSpace(spaceId);
  if (!space) return undefined;
  if (space.status !== "live" && space.status !== "paused") return undefined;
  space.status = paused ? "paused" : "live";

  const host = getHost(space.hostId);
  const hostUser = host ? getUser(host.userId) : undefined;
  if (hostUser) {
    addNotification({
      userId: hostUser.id,
      title: paused ? "Listing paused" : "Listing reactivated",
      body: paused
        ? `“${space.title}” was paused by the ParkGo team and is hidden from search. Contact support for details.`
        : `“${space.title}” is live again and visible to travellers in search.`,
      kind: "verification",
    });
  }
  return space;
}

// -----------------------------------------------------------------------------
// Payments / payouts
// -----------------------------------------------------------------------------
export const getPaymentsForHost = (hostId: string) => {
  const bookingIds = new Set(getBookingsForHost(hostId).map((b) => b.id));
  return db.payments.filter((p) => bookingIds.has(p.bookingId));
};
export const getAllPayments = () => db.payments;

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------
export const getNotifications = (userId: string) =>
  db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
export const unreadCount = (userId: string) =>
  db.notifications.filter((n) => n.userId === userId && !n.read).length;

export function addNotification(
  input: Omit<Notification, "id" | "createdAt" | "read"> & { read?: boolean }
): Notification {
  const n: Notification = {
    ...input,
    id: nextId("ntf"),
    read: input.read ?? false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(n);
  return n;
}

// -----------------------------------------------------------------------------
// Waitlist (marketing)
// -----------------------------------------------------------------------------
export function addWaitlist(entry: Omit<WaitlistEntry, "id" | "createdAt">): WaitlistEntry {
  const row: WaitlistEntry = {
    ...entry,
    id: `wl_${db.waitlist.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  db.waitlist.push(row);
  return row;
}
export const getWaitlist = () => db.waitlist;

// -----------------------------------------------------------------------------
// Support tickets (chat escalations) — on globalThis like `db`, so the server
// action and the admin page (separate route bundles) share one list.
// -----------------------------------------------------------------------------
const sg = globalThis as unknown as { __parkgoSupport?: SupportTicket[] };
const supportTickets: SupportTicket[] = (sg.__parkgoSupport ??= []);

export function addSupportTicket(
  entry: Omit<SupportTicket, "id" | "createdAt" | "status">
): SupportTicket {
  const row: SupportTicket = {
    ...entry,
    id: `sp_${supportTickets.length + 1}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  supportTickets.push(row);
  return row;
}
export const getSupportTickets = () =>
  [...supportTickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export function resolveSupportTicket(id: string): boolean {
  const t = supportTickets.find((x) => x.id === id);
  if (!t) return false;
  t.status = "resolved";
  return true;
}

// Re-export for convenience in admin views.
export const averageRatingFor = (subjectId: string) =>
  averageRating(getReviewsForSubject(subjectId));
