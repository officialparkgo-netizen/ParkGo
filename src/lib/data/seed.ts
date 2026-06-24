/**
 * Seed dataset for mock mode. Rich enough to demo every flow with zero API keys:
 * 4 demo logins (one per role), live listings across UK/IE airports, an in-flight
 * booking with a licensed transfer + live camera for the travel-day demo, plus
 * verification queues, reviews, payouts and notifications.
 *
 * Dates are anchored relative to "now" at module load so the demo always shows a
 * current travel day. IDs are stable and human-readable for easy debugging.
 */
import type {
  Airport,
  Booking,
  CameraStream,
  CorporateAccount,
  Driver,
  Host,
  Notification,
  Payment,
  Referral,
  Review,
  Space,
  Transfer,
  TransferProvider,
  User,
  Vehicle,
  Verification,
  WaitlistEntry,
} from "@/types";
import { priceBundle } from "@/lib/pricing";

const now = new Date();
const iso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// -----------------------------------------------------------------------------
// Airports (launch hubs: priority UK + Dublin)
// -----------------------------------------------------------------------------
export const airports: Airport[] = [
  { slug: "heathrow", code: "LHR", name: "London Heathrow", city: "London", country: "UK", lat: 51.47, lng: -0.4543, terminals: ["T2", "T3", "T4", "T5"] },
  { slug: "gatwick", code: "LGW", name: "London Gatwick", city: "London", country: "UK", lat: 51.1537, lng: -0.1821, terminals: ["North", "South"] },
  { slug: "stansted", code: "STN", name: "London Stansted", city: "London", country: "UK", lat: 51.885, lng: 0.235, terminals: ["Main"] },
  { slug: "luton", code: "LTN", name: "London Luton", city: "Luton", country: "UK", lat: 51.8747, lng: -0.3683, terminals: ["Main"] },
  { slug: "manchester", code: "MAN", name: "Manchester", city: "Manchester", country: "UK", lat: 53.365, lng: -2.2727, terminals: ["T1", "T2", "T3"] },
  { slug: "birmingham", code: "BHX", name: "Birmingham", city: "Birmingham", country: "UK", lat: 52.4539, lng: -1.748, terminals: ["Main"] },
  { slug: "edinburgh", code: "EDI", name: "Edinburgh", city: "Edinburgh", country: "UK", lat: 55.95, lng: -3.3725, terminals: ["Main"] },
  { slug: "dublin", code: "DUB", name: "Dublin", city: "Dublin", country: "IE", lat: 53.4264, lng: -6.2499, terminals: ["T1", "T2"] },
];

// -----------------------------------------------------------------------------
// Users — demo login per role
// -----------------------------------------------------------------------------
export const users: User[] = [
  {
    id: "user_traveller",
    role: "traveller",
    name: "Aisha Khan",
    email: "traveller@parkgo.demo",
    phone: "+44 7700 900123",
    locale: "en",
    avatarColor: "#1B6CB3",
    vehicle: { make: "Tesla", model: "Model 3", colour: "White", reg: "LV71 OGB", size: "medium", ev: true },
    corporateAccountId: "corp_acme",
    createdAt: iso(-220 * DAY),
  },
  {
    id: "user_host",
    role: "host",
    name: "Tom Bywater",
    email: "host@parkgo.demo",
    phone: "+44 7700 900456",
    locale: "en",
    avatarColor: "#36B24A",
    createdAt: iso(-410 * DAY),
  },
  {
    id: "user_transfer",
    role: "transfer",
    name: "SwiftLink Cars (Operator)",
    email: "transfer@parkgo.demo",
    phone: "+44 7700 900789",
    locale: "en",
    avatarColor: "#E8842B",
    createdAt: iso(-300 * DAY),
  },
  {
    id: "user_admin",
    role: "admin",
    name: "Priya Compliance",
    email: "admin@parkgo.demo",
    phone: "+44 7700 900000",
    locale: "en",
    avatarColor: "#0E2A47",
    createdAt: iso(-500 * DAY),
  },
  // extra hosts for richer listings
  { id: "user_host2", role: "host", name: "Grace O'Neill", email: "grace@parkgo.demo", locale: "en", avatarColor: "#2a9a3d", createdAt: iso(-260 * DAY) },
  { id: "user_host3", role: "host", name: "Derek Shaw", email: "derek@parkgo.demo", locale: "en", avatarColor: "#175a96", createdAt: iso(-150 * DAY) },
];

// -----------------------------------------------------------------------------
// Hosts
// -----------------------------------------------------------------------------
export const hosts: Host[] = [
  { id: "host_tom", userId: "user_host", displayName: "Tom's Driveways", verificationStatus: "approved", payoutAccountRef: "acct_mock_tom", rating: 4.9, joinedAt: iso(-400 * DAY) },
  { id: "host_grace", userId: "user_host2", displayName: "Grace Secure Parking", verificationStatus: "approved", payoutAccountRef: "acct_mock_grace", rating: 4.7, joinedAt: iso(-255 * DAY) },
  { id: "host_derek", userId: "user_host3", displayName: "Derek's Yard", verificationStatus: "in_review", rating: 0, joinedAt: iso(-3 * DAY) },
];

// -----------------------------------------------------------------------------
// Spaces (photos are on-brand placeholder tokens rendered by <Photo/>)
// -----------------------------------------------------------------------------
export const spaces: Space[] = [
  {
    id: "space_lhr_1", hostId: "host_tom", title: "Secure driveway · 4 min to T5",
    airportSlug: "heathrow", approxArea: "Longford, near Heathrow T5", exactAddress: "14 Bath Road, Longford UB7 0EX",
    lat: 51.482, lng: -0.46, distanceMiles: 1.2, driveMinutes: 4,
    dimensions: { lengthM: 5.5, widthM: 2.6 }, maxVehicleSize: "large",
    evCharger: { connector: "Type 2", kw: 7, pricePerKwh: 38 }, cctv: true, liveCamera: true,
    accessRules: "Park on the marked bay. Keys not required — keep your fob.",
    photos: ["drive-1", "drive-2", "ev-1"], pricePerDay: 1200, rating: 4.9, reviewCount: 128, status: "live", createdAt: iso(-380 * DAY),
  },
  {
    id: "space_lhr_2", hostId: "host_grace", title: "Gated yard · CCTV · 7 min to T2/T3",
    airportSlug: "heathrow", approxArea: "Hatton Cross", exactAddress: "Unit 3, Dovedale Close, Hounslow TW6 2AB",
    lat: 51.466, lng: -0.42, distanceMiles: 2.1, driveMinutes: 7,
    dimensions: { lengthM: 5.2, widthM: 2.5 }, maxVehicleSize: "large",
    evCharger: null, cctv: true, liveCamera: true,
    accessRules: "Gate code sent on arrival window. Reverse into bay 4.",
    photos: ["yard-1", "yard-2"], pricePerDay: 999, rating: 4.7, reviewCount: 86, status: "live", createdAt: iso(-250 * DAY),
  },
  {
    id: "space_lgw_1", hostId: "host_grace", title: "Covered carport · 6 min to South",
    airportSlug: "gatwick", approxArea: "Lowfield Heath", exactAddress: "2 Charlwood Rd, Crawley RH11 0PT",
    lat: 51.16, lng: -0.19, distanceMiles: 1.8, driveMinutes: 6,
    dimensions: { lengthM: 5.0, widthM: 2.4 }, maxVehicleSize: "medium",
    evCharger: { connector: "Type 2", kw: 7, pricePerKwh: 35 }, cctv: true, liveCamera: false,
    accessRules: "Covered bay under carport. Leave keys in lockbox (code on arrival).",
    photos: ["carport-1"], pricePerDay: 850, rating: 4.6, reviewCount: 54, status: "live", createdAt: iso(-180 * DAY),
  },
  {
    id: "space_man_1", hostId: "host_tom", title: "Driveway · EV · 9 min to T1",
    airportSlug: "manchester", approxArea: "Wythenshawe", exactAddress: "41 Ringway Rd, Manchester M22 5WB",
    lat: 53.375, lng: -2.27, distanceMiles: 2.6, driveMinutes: 9,
    dimensions: { lengthM: 5.4, widthM: 2.6 }, maxVehicleSize: "large",
    evCharger: { connector: "CCS", kw: 22, pricePerKwh: 42 }, cctv: false, liveCamera: false,
    accessRules: "Off-road driveway, well lit. EV cable provided.",
    photos: ["drive-3"], pricePerDay: 700, rating: 4.8, reviewCount: 39, status: "live", createdAt: iso(-120 * DAY),
  },
  {
    id: "space_dub_1", hostId: "host_grace", title: "Secure compound · 11 min to T2",
    airportSlug: "dublin", approxArea: "Santry", exactAddress: "Old Airport Rd, Santry, Dublin 9",
    lat: 53.41, lng: -6.25, distanceMiles: 3.1, driveMinutes: 11,
    dimensions: { lengthM: 6.0, widthM: 2.8 }, maxVehicleSize: "van",
    evCharger: null, cctv: true, liveCamera: true,
    accessRules: "Manned compound 24/7. Report to cabin on arrival.",
    photos: ["compound-1", "compound-2"], pricePerDay: 1100, rating: 4.5, reviewCount: 22, status: "live", createdAt: iso(-90 * DAY),
  },
  {
    id: "space_stn_1", hostId: "host_tom", title: "Family driveway · 12 min to terminal",
    airportSlug: "stansted", approxArea: "Takeley", exactAddress: "9 Dunmow Rd, Takeley CM22 6SP",
    lat: 51.87, lng: 0.25, distanceMiles: 3.4, driveMinutes: 12,
    dimensions: { lengthM: 5.0, widthM: 2.4 }, maxVehicleSize: "medium",
    evCharger: { connector: "Type 2", kw: 7, pricePerKwh: 36 }, cctv: true, liveCamera: false,
    accessRules: "Quiet residential street, park on driveway only.",
    photos: ["drive-4"], pricePerDay: 650, rating: 4.4, reviewCount: 17, status: "live", createdAt: iso(-60 * DAY),
  },
  // a pending listing for the admin verification demo
  {
    id: "space_edi_pending", hostId: "host_derek", title: "Yard space · 8 min to terminal",
    airportSlug: "edinburgh", approxArea: "Ingliston", exactAddress: "Eastfield Rd, Edinburgh EH28 8PL",
    lat: 55.95, lng: -3.37, distanceMiles: 2.2, driveMinutes: 8,
    dimensions: { lengthM: 5.5, widthM: 2.6 }, maxVehicleSize: "large",
    evCharger: null, cctv: true, liveCamera: false,
    accessRules: "Awaiting verification.",
    photos: ["yard-3"], pricePerDay: 600, rating: 0, reviewCount: 0, status: "pending_review", createdAt: iso(-2 * DAY),
  },
];

// -----------------------------------------------------------------------------
// Transfer providers, drivers, vehicles
// -----------------------------------------------------------------------------
export const transferProviders: TransferProvider[] = [
  { id: "tp_swiftlink", userId: "user_transfer", companyName: "SwiftLink Cars", operatorLicenceNo: "PHV-LON-44821", verificationStatus: "approved", reverifyDueAt: iso(120 * DAY), rating: 4.8, slaMinutes: 12 },
  { id: "tp_citycabs", userId: "user_transfer", companyName: "City Cabs (pending)", operatorLicenceNo: "PHV-MAN-10233", verificationStatus: "in_review", reverifyDueAt: iso(20 * DAY), rating: 0, slaMinutes: 15 },
];

export const drivers: Driver[] = [
  { id: "drv_marek", providerId: "tp_swiftlink", name: "Marek Nowak", licenceNo: "NOWAK801129MK9AB", badgeNo: "BADGE-77120", verificationStatus: "approved", rating: 4.9 },
  { id: "drv_sam", providerId: "tp_swiftlink", name: "Sam Patel", licenceNo: "PATEL750312SP1CD", badgeNo: "BADGE-77121", verificationStatus: "approved", rating: 4.7 },
  { id: "drv_new", providerId: "tp_citycabs", name: "Jordan Lee", licenceNo: "LEE920811JL4EF", badgeNo: "BADGE-90011", verificationStatus: "pending", rating: 0 },
];

export const vehicles: Vehicle[] = [
  { id: "veh_1", providerId: "tp_swiftlink", make: "Toyota", model: "Prius", colour: "Silver", reg: "LR70 XPM", seats: 4, insuranceExpiry: iso(200 * DAY) },
  { id: "veh_2", providerId: "tp_swiftlink", make: "Mercedes", model: "Vito", colour: "Black", reg: "LK21 VTO", seats: 7, insuranceExpiry: iso(40 * DAY) },
];

// -----------------------------------------------------------------------------
// Bookings + transfer + camera (travel-day demo)
// -----------------------------------------------------------------------------
const activeStart = iso(2 * HOUR);
const activeEnd = iso(5 * DAY);
const activeSpace = spaces[0];
const activePrice = priceBundle(activeSpace, { parking: true, transfer: true, ev: true }, activeStart, activeEnd);

const upcomingStart = iso(9 * DAY);
const upcomingEnd = iso(13 * DAY);
const upcomingSpace = spaces[2];
const upcomingPrice = priceBundle(upcomingSpace, { parking: true, transfer: false, ev: true }, upcomingStart, upcomingEnd);

const pastStart = iso(-20 * DAY);
const pastEnd = iso(-15 * DAY);
const pastSpace = spaces[1];
const pastPrice = priceBundle(pastSpace, { parking: true, transfer: true, ev: false }, pastStart, pastEnd);

export const bookings: Booking[] = [
  {
    id: "bk_active", reference: "PG-7F3K9", travellerId: "user_traveller", spaceId: activeSpace.id,
    bundle: { parking: true, transfer: true, ev: true }, startAt: activeStart, endAt: activeEnd,
    status: "active", price: activePrice, qrToken: "PG-7F3K9|space_lhr_1|user_traveller",
    transferId: "tr_active", createdAt: iso(-3 * DAY),
  },
  {
    id: "bk_upcoming", reference: "PG-2M8Q4", travellerId: "user_traveller", spaceId: upcomingSpace.id,
    bundle: { parking: true, transfer: false, ev: true }, startAt: upcomingStart, endAt: upcomingEnd,
    status: "paid", price: upcomingPrice, qrToken: "PG-2M8Q4|space_lgw_1|user_traveller",
    createdAt: iso(-1 * DAY),
  },
  {
    id: "bk_past", reference: "PG-9X1B7", travellerId: "user_traveller", spaceId: pastSpace.id,
    bundle: { parking: true, transfer: true, ev: false }, startAt: pastStart, endAt: pastEnd,
    status: "completed", price: pastPrice, qrToken: "PG-9X1B7|space_lhr_2|user_traveller",
    transferId: "tr_past", createdAt: iso(-23 * DAY),
  },
];

export const transfers: Transfer[] = [
  { id: "tr_active", bookingId: "bk_active", providerId: "tp_swiftlink", driverId: "drv_marek", vehicleId: "veh_1", status: "en_route", pickupAt: activeStart, handoverCode: "4K9PQ2" },
  { id: "tr_past", bookingId: "bk_past", providerId: "tp_swiftlink", driverId: "drv_sam", vehicleId: "veh_1", status: "completed", pickupAt: pastStart, handoverCode: "8H2LM5", handoverConfirmedAt: pastStart },
];

export const cameraStreams: CameraStream[] = [
  { id: "cam_1", spaceId: "space_lhr_1", label: "Bay 1 — front", protocol: "hls", url: "mock://camera/space_lhr_1", live: true },
  { id: "cam_2", spaceId: "space_lhr_2", label: "Yard — wide", protocol: "hls", url: "mock://camera/space_lhr_2", live: true },
  { id: "cam_3", spaceId: "space_dub_1", label: "Compound — north", protocol: "webrtc", url: "mock://camera/space_dub_1", live: true },
];

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------
export const payments: Payment[] = [
  { id: "pay_active", bookingId: "bk_active", provider: "mock", method: "card", amount: activePrice.total, currency: "GBP", split: activePrice.split, payoutStatus: "scheduled", createdAt: iso(-3 * DAY) },
  { id: "pay_upcoming", bookingId: "bk_upcoming", provider: "mock", method: "wallet", amount: upcomingPrice.total, currency: "GBP", split: upcomingPrice.split, payoutStatus: "pending", createdAt: iso(-1 * DAY) },
  { id: "pay_past", bookingId: "bk_past", provider: "mock", method: "card", amount: pastPrice.total, currency: "GBP", split: pastPrice.split, payoutStatus: "paid", createdAt: iso(-23 * DAY) },
];

// -----------------------------------------------------------------------------
// Reviews
// -----------------------------------------------------------------------------
export const reviews: Review[] = [
  { id: "rev_1", bookingId: "bk_past", authorId: "user_traveller", authorRole: "traveller", subjectId: "space_lhr_2", subjectType: "space", rating: 5, comment: "Spotless, secure and the live camera gave real peace of mind. Driver was early.", createdAt: iso(-14 * DAY) },
  { id: "rev_2", bookingId: "bk_past", authorId: "user_host2", authorRole: "host", subjectId: "user_traveller", subjectType: "traveller", rating: 5, comment: "Lovely traveller, left the bay tidy. Welcome back any time.", createdAt: iso(-14 * DAY) },
  { id: "rev_3", bookingId: "bk_past", authorId: "user_traveller", authorRole: "traveller", subjectId: "drv_sam", subjectType: "driver", rating: 5, comment: "Smooth, professional handover.", createdAt: iso(-14 * DAY) },
];

// -----------------------------------------------------------------------------
// Verifications (admin queue)
// -----------------------------------------------------------------------------
export const verifications: Verification[] = [
  {
    id: "ver_derek", subjectId: "host_derek", subjectType: "host", status: "in_review",
    submittedAt: iso(-2 * DAY),
    documents: [
      { id: "doc_1", type: "id", label: "Passport", fileRef: "kyc://derek/id", uploadedAt: iso(-2 * DAY) },
      { id: "doc_2", type: "address", label: "Utility bill", fileRef: "kyc://derek/addr", uploadedAt: iso(-2 * DAY) },
      { id: "doc_3", type: "right_to_list", label: "Right-to-list declaration", fileRef: "kyc://derek/rtl", uploadedAt: iso(-2 * DAY) },
      { id: "doc_4", type: "property_photo", label: "Space photo", fileRef: "kyc://derek/photo", uploadedAt: iso(-2 * DAY) },
    ],
  },
  {
    id: "ver_citycabs", subjectId: "tp_citycabs", subjectType: "transfer", status: "in_review",
    submittedAt: iso(-1 * DAY), reverifyDueAt: iso(20 * DAY),
    documents: [
      { id: "doc_5", type: "operator_licence", label: "Operator licence", fileRef: "kyc://citycabs/op", uploadedAt: iso(-1 * DAY) },
      { id: "doc_6", type: "passenger_insurance", label: "Commercial passenger insurance", fileRef: "kyc://citycabs/ins", uploadedAt: iso(-1 * DAY), expiresAt: iso(300 * DAY) },
      { id: "doc_7", type: "driver_badge", label: "Driver PHV badge", fileRef: "kyc://citycabs/badge", uploadedAt: iso(-1 * DAY) },
    ],
  },
];

// -----------------------------------------------------------------------------
// Notifications, corporate, referrals, waitlist
// -----------------------------------------------------------------------------
export const notifications: Notification[] = [
  { id: "ntf_1", userId: "user_traveller", title: "Your driver is en route", body: "Marek will reach Heathrow T5 in ~12 min. Tap to track live.", kind: "handover", read: false, createdAt: iso(-1 * HOUR) },
  { id: "ntf_2", userId: "user_traveller", title: "Booking confirmed", body: "PG-2M8Q4 · Gatwick · QR ready in your wallet.", kind: "booking", read: true, createdAt: iso(-1 * DAY) },
  { id: "ntf_3", userId: "user_host", title: "Payout scheduled", body: "£48.50 for PG-7F3K9 will arrive in 2 working days.", kind: "payout", read: false, createdAt: iso(-2 * HOUR) },
  { id: "ntf_4", userId: "user_admin", title: "2 items awaiting review", body: "Derek's Yard (host) and City Cabs (transfer) need a decision.", kind: "verification", read: false, createdAt: iso(-3 * HOUR) },
];

export const corporateAccounts: CorporateAccount[] = [
  { id: "corp_acme", name: "Acme Logistics Ltd", billingEmail: "travel@acme.example", invoiceMonthly: true, prioritySupport: true, seats: 24 },
];

export const referrals: Referral[] = [
  { id: "ref_1", referrerId: "user_traveller", code: "AISHA-PARK", rewardPence: 1000 },
];

export const waitlist: WaitlistEntry[] = [];
