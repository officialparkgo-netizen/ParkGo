/**
 * ParkGo domain model.
 *
 * Mirrors the entities in supabase/migrations/0001_init.sql. These types are the
 * single source of truth shared by the mock data layer, the API route handlers,
 * and the UI. Money is stored in minor units (pence) to avoid float drift.
 */

export type UUID = string;
export type ISODateString = string;
/** Money in minor units (pence). £49.00 === 4900. */
export type Pence = number;

// -----------------------------------------------------------------------------
// Roles & users
// -----------------------------------------------------------------------------

// Transfers are provided by an independent licensed operator (API-only), so
// there is no transfer/driver user role — the user-facing roles are three.
export type Role = "traveller" | "host" | "admin";

export type Locale = "en" | "ur" | "hi" | "de" | "zh";

export interface User {
  id: UUID;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  locale: Locale;
  avatarColor?: string;
  /** Traveller-only: minimal vehicle detail captured at signup. */
  vehicle?: VehicleProfile;
  corporateAccountId?: UUID;
  createdAt: ISODateString;
}

export interface VehicleProfile {
  make: string;
  model: string;
  colour: string;
  reg: string;
  size: VehicleSize;
  ev: boolean;
}

export type VehicleSize = "small" | "medium" | "large" | "van";

// -----------------------------------------------------------------------------
// Verification & compliance
// -----------------------------------------------------------------------------

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "in_review"
  | "approved"
  | "rejected";

export type DocumentType =
  | "id"
  | "address"
  | "operator_licence"
  | "driver_licence"
  | "driver_badge"
  | "vehicle_logbook"
  | "passenger_insurance"
  | "right_to_list"
  | "property_photo";

export interface VerificationDocument {
  id: UUID;
  type: DocumentType;
  label: string;
  /** Reference only — KYC files live in a separate, access-controlled store. */
  fileRef: string;
  uploadedAt: ISODateString;
  expiresAt?: ISODateString;
}

export interface Verification {
  id: UUID;
  subjectId: UUID; // user / host / transfer provider being verified
  subjectType: "host" | "transfer" | "traveller";
  status: VerificationStatus;
  documents: VerificationDocument[];
  submittedAt?: ISODateString;
  reviewedAt?: ISODateString;
  reviewerId?: UUID;
  notes?: string;
  /** Next periodic re-verification due date (transfer providers). */
  reverifyDueAt?: ISODateString;
}

// -----------------------------------------------------------------------------
// Airports
// -----------------------------------------------------------------------------

export type DestinationKind = "airport" | "city" | "station" | "stadium";

/**
 * A bookable destination. Historically airports only — now also city centres,
 * stations and stadiums/venues. `kind` defaults to "airport" when absent, so
 * existing data needs no change; airport-only features (terminal transfer)
 * gate on it.
 */
export interface Airport {
  /** IATA-like slug, e.g. "lhr". */
  slug: string;
  code: string; // LHR
  name: string; // London Heathrow
  city: string;
  country: "UK" | "IE";
  lat: number;
  lng: number;
  terminals: string[];
  kind?: DestinationKind;
}

// -----------------------------------------------------------------------------
// Hosts & spaces
// -----------------------------------------------------------------------------

export interface Host {
  id: UUID;
  userId: UUID;
  displayName: string;
  /** Short public introduction shown to travellers on the listing (Airbnb-style). */
  bio?: string;
  verificationStatus: VerificationStatus;
  payoutAccountRef?: string; // Stripe Connect account id (live mode)
  rating: number; // 0–5
  joinedAt: ISODateString;
}

export type SpaceStatus = "draft" | "pending_review" | "live" | "paused" | "rejected";

export interface Space {
  id: UUID;
  hostId: UUID;
  title: string;
  airportSlug: string;
  /** How many cars fit at once (availability limit). Defaults to 1. */
  capacity?: number;
  /** Free-text street/area shown publicly; exact address released post-payment. */
  approxArea: string;
  exactAddress: string; // released only after payment
  lat: number;
  lng: number;
  distanceMiles: number; // to terminal
  driveMinutes: number;
  dimensions: { lengthM: number; widthM: number };
  maxVehicleSize: VehicleSize;
  evCharger: EvCharger | null;
  cctv: boolean;
  liveCamera: boolean;
  /** Roofed/enclosed space (garage, carport, barn). */
  covered?: boolean;
  accessRules: string;
  photos: string[];
  pricePerDay: Pence;
  /** Optional hourly rate — enables short (under-a-day) stays. */
  pricePerHour?: Pence;
  rating: number;
  reviewCount: number;
  status: SpaceStatus;
  createdAt: ISODateString;
}

export interface EvCharger {
  connector: "Type 2" | "CCS" | "CHAdeMO";
  kw: number;
  pricePerKwh: Pence;
}

// -----------------------------------------------------------------------------
// Transfer providers, drivers, vehicles
// -----------------------------------------------------------------------------

export interface TransferProvider {
  id: UUID;
  userId: UUID;
  companyName: string;
  operatorLicenceNo: string;
  verificationStatus: VerificationStatus;
  reverifyDueAt?: ISODateString;
  rating: number;
  slaMinutes: number; // pickup SLA
}

export interface Driver {
  id: UUID;
  providerId: UUID;
  name: string;
  licenceNo: string;
  badgeNo: string;
  verificationStatus: VerificationStatus;
  rating: number;
}

export interface Vehicle {
  id: UUID;
  providerId: UUID;
  make: string;
  model: string;
  colour: string;
  reg: string;
  seats: number;
  insuranceExpiry: ISODateString;
}

// -----------------------------------------------------------------------------
// Bookings, transfers, handover
// -----------------------------------------------------------------------------

export type BookingStatus =
  | "requested"
  | "paid"
  | "active"
  | "completed"
  | "reviewed"
  | "cancelled";

export interface BookingBundle {
  parking: true;
  transfer: boolean;
  ev: boolean;
}

export interface Booking {
  id: UUID;
  reference: string; // human-friendly, e.g. PG-7F3K9
  travellerId: UUID;
  spaceId: UUID;
  bundle: BookingBundle;
  startAt: ISODateString;
  endAt: ISODateString;
  status: BookingStatus;
  price: PriceBreakdown;
  qrToken: string; // encodes access credential
  transferId?: UUID;
  createdAt: ISODateString;
}

export interface PriceBreakdown {
  parking: Pence;
  transfer: Pence;
  ev: Pence;
  serviceFee: Pence;
  total: Pence;
  /** Marketplace split derived from the total. */
  split: PaymentSplit;
  currency: "GBP" | "EUR";
}

export type TransferStatus =
  | "unassigned"
  | "assigned"
  | "en_route"
  | "arrived"
  | "handover_pending"
  | "completed";

export interface Transfer {
  id: UUID;
  bookingId: UUID;
  providerId: UUID;
  driverId?: UUID;
  vehicleId?: UUID;
  status: TransferStatus;
  pickupAt: ISODateString;
  handoverCode: string; // 6-char code both parties confirm
  handoverConfirmedAt?: ISODateString;
}

// -----------------------------------------------------------------------------
// Realtime: live location & camera
// -----------------------------------------------------------------------------

export type LiveActor = "traveller" | "host" | "driver";

export interface LiveLocation {
  bookingId: UUID;
  actor: LiveActor;
  lat: number;
  lng: number;
  headingDeg?: number;
  updatedAt: ISODateString;
}

export interface CameraStream {
  id: UUID;
  spaceId: UUID;
  label: string; // "Bay 3 — front"
  protocol: "hls" | "webrtc";
  /** Signed, short-lived in live mode; a sample loop in mock mode. */
  url: string;
  live: boolean;
}

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------

export type PaymentMethod = "card" | "wallet";
export type PaymentProvider = "stripe" | "mock";
export type PayoutStatus = "pending" | "scheduled" | "paid" | "refunded";

export interface PaymentSplit {
  /** Platform commission (parking + transfer commissions combined). */
  platform: Pence;
  hostPayout: Pence;
  driverPayout: Pence;
}

export interface Payment {
  id: UUID;
  bookingId: UUID;
  provider: PaymentProvider;
  method: PaymentMethod;
  amount: Pence;
  currency: "GBP" | "EUR";
  split: PaymentSplit;
  payoutStatus: PayoutStatus;
  createdAt: ISODateString;
}

// -----------------------------------------------------------------------------
// Reviews & trust
// -----------------------------------------------------------------------------

export interface Review {
  id: UUID;
  bookingId: UUID;
  authorId: UUID;
  authorRole: Role;
  subjectId: UUID; // space / host / driver / traveller
  subjectType: "space" | "host" | "driver" | "traveller";
  rating: number; // 1–5
  comment: string;
  createdAt: ISODateString;
}

export interface TrustScore {
  subjectId: UUID;
  subjectType: "host" | "driver" | "traveller";
  score: number; // 0–100
  components: {
    verification: number;
    reviews: number;
    reliability: number;
    tenure: number;
  };
  updatedAt: ISODateString;
}

// -----------------------------------------------------------------------------
// Notifications, corporate, referrals, audit
// -----------------------------------------------------------------------------

export interface Notification {
  id: UUID;
  userId: UUID;
  title: string;
  body: string;
  kind: "booking" | "verification" | "payout" | "system" | "handover";
  read: boolean;
  createdAt: ISODateString;
}

export interface CorporateAccount {
  id: UUID;
  name: string;
  billingEmail: string;
  invoiceMonthly: boolean;
  prioritySupport: boolean;
  seats: number;
}

export interface Referral {
  id: UUID;
  referrerId: UUID;
  code: string;
  rewardPence: Pence;
  redeemedById?: UUID;
  redeemedAt?: ISODateString;
}

export interface AuditLogEntry {
  id: UUID;
  actorId: UUID;
  action: string;
  target: string;
  meta?: Record<string, unknown>;
  createdAt: ISODateString;
}

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------

export interface SearchQuery {
  airportSlug: string;
  startAt?: ISODateString;
  endAt?: ISODateString;
  vehicleSize?: VehicleSize;
  needsEv?: boolean;
  needsTransfer?: boolean;
  needsCctv?: boolean;
  needsCovered?: boolean;
  /** Only show spaces at or below this daily rate (pence). */
  maxPricePerDay?: Pence;
}

export interface SearchResult {
  space: Space;
  airport: Airport;
  estimatedTotal: Pence;
}

// -----------------------------------------------------------------------------
// Waitlist (marketing site)
// -----------------------------------------------------------------------------

export interface WaitlistEntry {
  id: UUID;
  email: string;
  role: Role | "traveller";
  airport?: string;
  createdAt: ISODateString;
}

/** One line of a support-chat conversation. */
export interface SupportMessage {
  role: "bot" | "user";
  text: string;
}

/** A chat escalated to a human agent. */
export interface SupportTicket {
  id: UUID;
  name: string;
  email: string;
  topic: string;
  transcript: SupportMessage[];
  status: "open" | "resolved";
  createdAt: ISODateString;
}
