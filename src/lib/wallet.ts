import "server-only";
import crypto from "node:crypto";
import type { Booking, Space } from "@/types";

/**
 * The entry pass as a phone wallet pass, so it is on the lock screen at the
 * barrier instead of three taps into a browser.
 *
 * Both platforms need signing credentials that only the account owner can
 * issue, so both are gated. When neither is configured the booking page falls
 * back to /pass/[id], which already works offline — the wallet pass is a
 * convenience on top of that, never the only way in.
 *
 * Google Wallet is a signed JWT and needs a service-account key. Apple Wallet
 * needs a .pkpass archive signed with a Pass Type ID certificate and Apple's
 * WWDR intermediate; that is a build-time artefact rather than an env var, so
 * the Apple path reports what is missing instead of pretending.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SA_EMAIL &&
    process.env.GOOGLE_WALLET_SA_KEY &&
    process.env.GOOGLE_WALLET_CLASS_ID
  );
}

export function isAppleWalletConfigured(): boolean {
  return !!(
    process.env.APPLE_PASS_TYPE_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_PASS_CERT_P12 &&
    process.env.APPLE_WWDR_CERT
  );
}

export function walletAvailability() {
  return {
    google: isGoogleWalletConfigured(),
    apple: isAppleWalletConfigured(),
  };
}

/**
 * A "Save to Google Wallet" link. The pass is described inline in the JWT, so
 * no pass object has to be created through the API first — one signed link is
 * the whole integration.
 */
export function googleWalletSaveUrl(
  booking: Booking,
  space: Space,
  shareUrl: string
): string | null {
  if (!isGoogleWalletConfigured()) return null;

  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID!;
  const saEmail = process.env.GOOGLE_WALLET_SA_EMAIL!;
  const key = normalisePrivateKey(process.env.GOOGLE_WALLET_SA_KEY!);

  const object = {
    id: `${issuerId}.${booking.reference.replace(/[^A-Za-z0-9_-]/g, "")}`,
    classId,
    state: "ACTIVE",
    // The QR is what the barrier reads; everything else is for the human.
    barcode: { type: "QR_CODE", value: booking.qrToken, alternateText: booking.reference },
    cardTitle: { defaultValue: { language: "en", value: "ParkGo" } },
    header: { defaultValue: { language: "en", value: space.title } },
    subheader: { defaultValue: { language: "en", value: space.approxArea } },
    textModulesData: [
      { header: "Drop-off", body: fmt(booking.startAt), id: "dropoff" },
      { header: "Pick-up", body: fmt(booking.endAt), id: "pickup" },
      { header: "Reference", body: booking.reference, id: "ref" },
    ],
    linksModuleData: {
      uris: [
        { uri: shareUrl, description: "Open full pass" },
        {
          uri: `https://www.google.com/maps/dir/?api=1&destination=${space.lat},${space.lng}`,
          description: "Directions",
        },
      ],
    },
    hexBackgroundColor: "#15171A",
  };

  const claims = {
    iss: saEmail,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [SITE],
    payload: { genericObjects: [object] },
  };

  try {
    const token = signJwtRs256(claims, key);
    return `https://pay.google.com/gp/v/save/${token}`;
  } catch {
    // A malformed key must not break the booking page.
    return null;
  }
}

/** What is still needed for Apple Wallet, for the admin-facing status list. */
export function appleWalletMissing(): string[] {
  const need: [string, string | undefined][] = [
    ["APPLE_PASS_TYPE_ID", process.env.APPLE_PASS_TYPE_ID],
    ["APPLE_TEAM_ID", process.env.APPLE_TEAM_ID],
    ["APPLE_PASS_CERT_P12", process.env.APPLE_PASS_CERT_P12],
    ["APPLE_WWDR_CERT", process.env.APPLE_WWDR_CERT],
  ];
  return need.filter(([, v]) => !v).map(([k]) => k);
}

/**
 * The pass.json an Apple Wallet pass is built from. Produced separately from
 * the signing so it can be inspected and tested without a certificate.
 */
export function applePassJson(booking: Booking, space: Space) {
  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID ?? "pass.ai.parkgo.entry",
    teamIdentifier: process.env.APPLE_TEAM_ID ?? "",
    organizationName: "ParkGo",
    description: `Parking at ${space.title}`,
    serialNumber: booking.reference,
    backgroundColor: "rgb(21,23,26)",
    foregroundColor: "rgb(255,255,255)",
    labelColor: "rgb(242,106,27)",
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: booking.qrToken,
        messageEncoding: "iso-8859-1",
        altText: booking.reference,
      },
    ],
    locations: [{ latitude: space.lat, longitude: space.lng, relevantText: "Your ParkGo space" }],
    // A generic pass rather than an event ticket: the relevant window is the
    // whole stay, not a single admission time.
    generic: {
      primaryFields: [{ key: "space", label: "SPACE", value: space.title }],
      secondaryFields: [
        { key: "dropoff", label: "DROP-OFF", value: fmt(booking.startAt) },
        { key: "pickup", label: "PICK-UP", value: fmt(booking.endAt) },
      ],
      auxiliaryFields: [{ key: "ref", label: "REFERENCE", value: booking.reference }],
      backFields: [
        { key: "area", label: "Area", value: space.approxArea },
        { key: "rules", label: "Access", value: space.accessRules || "—" },
        { key: "help", label: "Help", value: `${SITE}/help` },
      ],
    },
  };
}

// -----------------------------------------------------------------------------

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

/** Env vars cannot hold real newlines, so keys arrive with "\n" escaped. */
function normalisePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** RS256, which is all Google Wallet accepts. */
function signJwtRs256(claims: object, privateKey: string): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${body}`)
    .sign(privateKey);
  return `${header}.${body}.${b64url(signature)}`;
}
