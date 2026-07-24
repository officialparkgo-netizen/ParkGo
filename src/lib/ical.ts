import { createHmac } from "crypto";

/**
 * Shareable-but-unguessable token for a host's iCal feed. Calendar apps poll
 * the URL without cookies, so the link itself must carry the proof.
 */
function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

export function icalToken(hostId: string): string {
  return createHmac("sha256", secret()).update(`ical.${hostId}`).digest("hex").slice(0, 32);
}

export function verifyIcalToken(hostId: string, token: string): boolean {
  return !!hostId && !!token && icalToken(hostId) === token;
}

/** Escape per RFC 5545 (commas, semicolons, newlines). */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export interface IcalEvent {
  uid: string;
  start: string; // ISO
  end: string; // ISO
  summary: string;
  description?: string;
  location?: string;
}

export function buildIcs(name: string, events: IcalEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ParkGo//Host bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${esc(e.uid)}@parkgo.ai`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(e.start)}`,
      `DTEND:${icsDate(e.end)}`,
      `SUMMARY:${esc(e.summary)}`,
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
      ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
