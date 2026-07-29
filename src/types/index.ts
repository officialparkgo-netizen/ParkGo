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
  /**
   * Traveller-only: the vehicle captured at signup. Kept as the primary car;
   * `vehicles` is the full list for households with more than one.
   */
  vehicle?: VehicleProfile;
  /** Every car on the account — the first is the default at checkout. */
  vehicles?: VehicleProfile[];
  /** Company details for anyone expensing the trip; printed on the receipt. */
  business?: BusinessProfile;
  /** Stripe customer, so a returning traveller is offered their saved card. */
  stripeCustomerId?: string;
  /** Share code others can book with; both sides earn credit. */
  referralCode?: string;
  referredBy?: UUID;
  /** Referral credit held against the account, pence. */
  creditPence?: number;
  /** Trips finished, which is what earns a loyalty tier — not money spent. */
  completedTrips?: number;
  /**
   * Account created for someone mid-checkout rather than by them signing up.
   * They booked as a guest and still have to claim it with the emailed link.
   */
  guestCreated?: boolean;
  corporateAccountId?: UUID;
  /** Company account this person books on. */
  organisationId?: UUID;
  organisationRole?: "owner" | "member";
  /** Opt-in to travel-day text messages. Requires a phone number. */
  smsOptIn?: boolean;
  /** Admin-set: suspended accounts are bounced at the sign-in guard. */
  suspended?: boolean;
  /** Admin self-service: require an email code at sign-in (2FA). */
  twofaEnabled?: boolean;
  /** Uploaded profile photo (public URL in live; data URL in mock). */
  avatarUrl?: string;
  /**
   * Set at runtime (never stored) when an admin is viewing the app as this
   * user via the support impersonation cookie. Holds the real admin's id.
   */
  impersonatedBy?: UUID;
  /**
   * Admin-only: "support" scope is locked out of the money pages
   * (payments, promos, broadcast, settings, finance exports). Absent = full.
   */
  adminScope?: "full" | "support";
  /** Host preference: email me when a booking lands (default on). */
  emailBookingAlerts?: boolean;
  /**
   * Co-host accounts: the host this helper belongs to. Grants only the Today
   * board + check-in/out + messages; every money page redirects away.
   */
  cohostHostId?: UUID;
  /**
   * Support agents: on duty or not. Auto-assignment only ever picks someone
   * who has put themselves on duty, so a day off never swallows a ticket.
   */
  supportAvailable?: boolean;
  /**
   * Pending staff invite: signs the set-password link and is cleared the
   * moment the password is set, making that link single-use.
   */
  inviteNonce?: string;
  /**
   * First-run profile setup done. Strictly `false` gates non-admins to
   * /welcome; undefined (pre-migration rows) never gates.
   */
  onboarded?: boolean;
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

/** Company details for expensing a trip — shown on the VAT receipt. */
export interface BusinessProfile {
  company: string;
  vatNumber?: string;
  /** Free-text cost centre / PO reference the finance team asked for. */
  costCentre?: string;
}

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
  /** Manual payout details (pre-Stripe): UK sort code + account number. */
  bankSort?: string;
  bankAccount?: string;
  /** Auto-sent as the first thread message when a booking is confirmed. */
  autoWelcome?: string;
  /** Traveller ids this host refuses bookings from. */
  blockedGuests?: string[];
  /** Limited helper account (check-ins only) linked to this host. */
  cohostUserId?: string;
  cohostEmail?: string;
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
  /** Step-free approach and a bay wide enough to get a wheelchair out. */
  accessible?: boolean;
  accessRules: string;
  photos: string[];
  pricePerDay: Pence;
  /** Optional hourly rate — enables short (under-a-day) stays. */
  pricePerHour?: Pence;
  /** Host-blocked days ("YYYY-MM-DD") — not bookable (holiday / own use). */
  blockedDates?: string[];
  /** Weekend (Sat/Sun) price uplift in percent, applied per day. 0–100. */
  weekendUpliftPct?: number;
  /** Per-date overrides ("YYYY-MM-DD" → pence/day) beating base + uplift. */
  customPrices?: Record<string, Pence>;
  /** Named bays for multi-car spaces ("A", "B" …); bookings get assigned one. */
  bayNames?: string[];
  /** Bookings need the host's approval (24h window, else auto-refund). */
  requestToBook?: boolean;
  /** Extras this host will perform while the car is here, priced per stay. */
  careServices?: CareService[];
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
  /** Transfer covers both directions (return leg on the pick-up day). */
  transferReturn?: boolean;
  /** Requested taxi pickup time on drop-off day, "HH:MM". */
  transferTime?: string;
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
  /** Request-to-book state; absent for instant-book spaces. */
  approval?: "pending" | "approved" | "declined";
  /** Auto-decline (full refund) when still pending past this moment. */
  approvalDeadline?: ISODateString;
  /** Index into the space's bayNames the host assigned this stay to. */
  bayIndex?: number;
  /** Flight this trip is tied to — drives the dates and the delay watch. */
  flight?: FlightLink;
  /** Cars on this booking. One entry is the normal case; two is a group stay. */
  vehicles?: VehicleProfile[];
  /** Cancellation protection was bought. */
  protection?: boolean;
  /** Car care bought at checkout, priced at the time of booking. */
  care?: CareService[];
  /** Free-text help the traveller asked for at handover. */
  assistance?: string;
  /** "I'm N minutes away", set by the traveller so the host can be ready. */
  arrivingEtaMin?: number;
  arrivingPingedAt?: ISODateString;
  /** Billed to a company account rather than the individual. */
  organisationId?: UUID;
  /**
   * Paid with a gift card or trip pass at checkout. The price is unchanged —
   * this is only how much of it had already been handed over, so the card is
   * charged for the rest and the host is still owed their full share.
   */
  prepaid?: Pence;
  /** Which balances the prepayment came out of, for the receipt and refunds. */
  prepaidFrom?: { giftCard?: string; passId?: string; passDays?: number };
  createdAt: ISODateString;
}

/** A flight the booking is pinned to. Dates follow it; delays extend it. */
export interface FlightLink {
  /** IATA flight designator, e.g. "BA2490". */
  number: string;
  /** Scheduled arrival back at the origin airport. */
  scheduledArrival: ISODateString;
  /** Latest known arrival — differs from scheduled once a delay is known. */
  estimatedArrival?: ISODateString;
  status: "scheduled" | "delayed" | "landed" | "cancelled" | "unknown";
  /** Set once a delay has already pushed the booking's end date out. */
  extendedAt?: ISODateString;
  checkedAt?: ISODateString;
}

/** Something the host will do to the car while it is parked. */
export interface CareService {
  id: string;
  label: string;
  pricePence: Pence;
}

/** Timestamped evidence of the car's condition, both sides of the stay. */
export interface ConditionPhoto {
  id: UUID;
  bookingId: UUID;
  phase: "dropoff" | "pickup";
  url: string;
  takenBy: UUID;
  createdAt: ISODateString;
}

/** A traveller waiting for a sold-out date range to open up. */
export interface DateWatch {
  id: UUID;
  userId: UUID;
  airportSlug: string;
  /** Set when waiting on one specific space rather than the destination. */
  spaceId?: UUID;
  startAt: ISODateString;
  endAt: ISODateString;
  notifiedAt?: ISODateString;
  createdAt: ISODateString;
}

/** Prepaid balance, bought by one person and spent by another. */
export interface GiftCard {
  id: UUID;
  code: string;
  initialPence: Pence;
  balancePence: Pence;
  purchasedBy?: UUID;
  recipientEmail?: string;
  message?: string;
  /** The payment that bought it, so a repeated redirect cannot mint a second. */
  stripeRef?: string;
  createdAt: ISODateString;
}

/** Days bought up front at a discount, spent one per booked day. */
export interface TripPass {
  id: UUID;
  userId: UUID;
  daysTotal: number;
  daysUsed: number;
  pricePence: Pence;
  /** What one day is worth when spent, fixed at purchase so a later price
   *  rise at the destination cannot devalue a pass already bought. */
  dayValuePence: Pence;
  expiresAt: ISODateString;
  /** See GiftCard.stripeRef. */
  stripeRef?: string;
  createdAt: ISODateString;
}

/** A company whose employees book on one account. */
export interface Organisation {
  id: UUID;
  name: string;
  vatNumber?: string;
  billingEmail: string;
  ownerId: UUID;
  /** Invoice monthly instead of charging each booking. */
  monthlyInvoice?: boolean;
  createdAt: ISODateString;
}

/**
 * A blog article written in the admin console, as opposed to the built-in
 * launch posts that ship as code (src/content/blog.ts). The two live side by
 * side: built-ins carry translations and never change; these are the client's
 * own words, written once in whatever language they wrote them.
 */
export interface BlogArticle {
  id: UUID;
  /** URL path segment. Unique across articles AND the built-in posts. */
  slug: string;
  title: string;
  /** Shown on cards and used as the meta description. */
  excerpt: string;
  /** Markdown. Rendered by src/lib/markdown.ts, which escapes first. */
  body: string;
  coverUrl?: string;
  author: string;
  tags: string[];
  /** Drafts are visible only in the admin console; the public page 404s. */
  status: "draft" | "published";
  publishedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PriceBreakdown {
  parking: Pence;
  transfer: Pence;
  ev: Pence;
  serviceFee: Pence;
  /** Cancellation protection premium. Pure platform revenue. */
  protection: Pence;
  /** Car care bought at checkout. The host performs it, so it is host revenue
   *  net of the usual parking commission. */
  care: Pence;
  total: Pence;
  /** Marketplace split derived from the total. */
  split: PaymentSplit;
  currency: "GBP" | "EUR";
  /** Promo discount already subtracted from total (absorbed by the platform). */
  promoCode?: string;
  discount?: Pence;
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
  /** Hidden by an admin (inappropriate content) — excluded from public pages. */
  hidden?: boolean;
  /** Host's public reply, shown under the review. */
  reply?: string;
  repliedAt?: ISODateString;
}

// -----------------------------------------------------------------------------
// Admin suite: action log, promo codes, damage claims
// -----------------------------------------------------------------------------

/** A record of something an admin did (approve, suspend, refund, note …). */
export interface AdminAction {
  id: UUID;
  adminId: UUID;
  adminName: string;
  action: string; // e.g. "verification.approved", "user.suspended", "note"
  targetType: "user" | "host" | "space" | "booking" | "payment" | "review" | "promo" | "claim" | "verification" | "broadcast" | "blog";
  targetId: string;
  detail?: string;
  createdAt: ISODateString;
}

export type PromoKind = "percent" | "fixed";

export interface PromoCode {
  id: UUID;
  code: string; // uppercase, e.g. PARKGO10
  kind: PromoKind;
  /** Percent (1–100) for "percent", pence for "fixed". */
  value: number;
  active: boolean;
  uses: number;
  maxUses?: number;
  expiresAt?: ISODateString;
  createdAt: ISODateString;
}

/** DB-backed platform configuration, editable at /admin/settings. */
export interface PlatformSettings {
  /** Flat traveller service fee, pence. */
  serviceFee: Pence;
  /** Commission on parking + EV lines, basis points. */
  parkingCommissionBps: number;
  /** Commission on the transfer line, basis points. */
  transferCommissionBps: number;
  /** Free-cancellation cut-off before drop-off, hours. */
  cancelWindowHours: number;
  /** Late-cancellation fee, basis points of the total. */
  cancelFeeBps: number;
  /** Days after pick-up before a host payout can be released (protection window). */
  payoutHoldDays: number;
  /** Support desk opening hours (0–23, London time). Equal values = 24/7. */
  supportOpenHour: number;
  supportCloseHour: number;
  /** Typical first-reply time shown in the chat widget, minutes. */
  supportReplyMinutes: number;
  /** WhatsApp number (international format) offered as a fallback channel. */
  supportWhatsapp?: string;
  /** Editable canned replies for agents. */
  supportMacros?: { id: string; label: string; text: string }[];
  /** Minutes an urgent ticket may sit unanswered before admins are alerted. */
  supportSlaMinutes: number;
  /** Cap on new tickets per email per hour — a spam brake, not a policy. */
  supportMaxPerHour: number;
  /** Hand new tickets to the least-loaded agent who is on duty. */
  supportAutoAssign: boolean;
  /** Overrides ADMIN_ALERT_EMAIL for admin notification emails. */
  adminAlertEmail?: string;
  /** Slack-compatible webhook for instant ops alerts. */
  opsWebhookUrl?: string;
  /** Site-wide announcement banner (marketing pages). */
  announcement?: string;
  announcementOn: boolean;
}

export type ClaimStatus = "open" | "in_review" | "resolved" | "rejected";

/** Damage / incident claim raised against a booking. */
export interface Claim {
  id: UUID;
  bookingId: UUID;
  bookingRef: string;
  openedBy: UUID;
  openedByRole: Role;
  description: string;
  status: ClaimStatus;
  /** Admin's decision note, shown to the claimant. */
  resolution?: string;
  /** Evidence attached by whoever raised it. Photographs settle these. */
  photos?: string[];
  createdAt: ISODateString;
  updatedAt?: ISODateString;
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
  needsAccessible?: boolean;
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
  /** Set when an admin sent this signup an invite email. */
  invitedAt?: ISODateString;
  /** Referring user id when the signup arrived via a referral link. */
  referredBy?: UUID;
}

/** One message between the traveller and the host on a booking. */
export interface BookingMessage {
  id: UUID;
  bookingId: UUID;
  from: "host" | "traveller";
  text: string;
  at: ISODateString;
}

/** One message between a traveller and their transfer driver. */
export interface TransferMessage {
  id: UUID;
  bookingId: UUID;
  from: "traveller" | "driver";
  text: string;
  at: ISODateString;
}

/**
 * A watch on a space or an airport: tell me when it frees up on my dates, or
 * when something drops below what I'm willing to pay. Cleared once it fires.
 */
export interface SpaceAlert {
  id: UUID;
  userId: UUID;
  /** Either a specific space, or a whole airport. */
  spaceId?: UUID;
  airportSlug?: string;
  startAt?: ISODateString;
  endAt?: ISODateString;
  maxPricePence?: Pence;
  notifiedAt?: ISODateString;
  createdAt: ISODateString;
}

/** One line of a support-chat conversation. */
export interface SupportMessage {
  role: "bot" | "user" | "agent";
  /** Exactly what was typed. Never overwritten by a translation. */
  text: string;
  /**
   * `text` rendered into the *other* party's language — English on a visitor's
   * message, the visitor's language on an agent's reply. Only set when the two
   * sides differ and a translation provider is configured.
   *
   * Both sides are always shown the original alongside it. Machine translation
   * loses negations, and neither an agent deciding a refund nor a customer
   * reading one should have to act on a rendering they cannot check.
   */
  translated?: string;
  /** Language `text` was written in. */
  sourceLocale?: Locale;
  /** ISO timestamp — absent on messages written before attachments landed. */
  at?: ISODateString;
  /**
   * Image or document shared in the chat. Live mode stores the private
   * storage `path` and signs a short-lived `url` at read time; mock mode has
   * only an inline data `url`.
   */
  attachment?: { url: string; name: string; kind: "image" | "file"; path?: string };
}

/** An agent-only note on a ticket — never sent to the visitor. */
export interface SupportNote {
  at: ISODateString;
  by: string;
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
  /** Admin who picked the ticket up (display name). */
  assignedTo?: string;
  /** Signed-in account behind the chat (lets agents see their bookings). */
  userId?: UUID;
  /** Urgent tickets sort to the top of the queue. */
  priority?: "normal" | "urgent";
  /** When the team first replied — powers the response-time stat. */
  firstResponseAt?: ISODateString;
  /** Live-chat presence: who typed last and when. */
  typingBy?: "user" | "agent";
  typingAt?: ISODateString;
  /** Read receipts per side. */
  userReadAt?: ISODateString;
  agentReadAt?: ISODateString;
  /** Post-resolution rating: 1 = happy, -1 = unhappy. */
  csat?: 1 | -1;
  csatComment?: string;
  /** Agent-only notes for handover — never leave the admin console. */
  notes?: SupportNote[];
  /** Free-form labels agents add for triage and search. */
  tags?: string[];
  /** Parked until this moment: drops out of the live queue, then returns. */
  snoozeUntil?: ISODateString;
  /** Set when a breached SLA has already alerted the admins (dedupe). */
  escalatedAt?: ISODateString;
  /** Callback request: the number to ring and when. */
  phone?: string;
  callbackAt?: ISODateString;
  /** Language the visitor is writing in, so agents can reply in kind. */
  locale?: Locale;
}
