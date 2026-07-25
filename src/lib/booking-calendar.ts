/**
 * Add-to-calendar for a stay.
 *
 * A drop-off is a time-critical appointment and phones already handle those
 * well — so we hand out a real .ics rather than asking people to remember.
 * Two alarms: the night before (pack, plan the drive) and an hour ahead.
 *
 * Deliberately self-contained: no library, and every field escaped, because
 * an unescaped comma in an address silently corrupts the whole file.
 */

/** RFC 5545 escaping: backslash, semicolon, comma and newline are special. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** UTC stamp in the basic format iCalendar wants: 20260812T100000Z. */
export function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Long lines must be folded at 75 octets. Most clients cope without it, but
 * Outlook does not, and a broken invite is worse than none.
 */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  url?: string;
}

export function bookingIcs(event: CalendarEvent, now = "1970-01-01T00:00:00.000Z"): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ParkGo//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${esc(event.uid)}`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${icsStamp(event.startAt)}`,
    `DTEND:${icsStamp(event.endAt)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.description)}`,
    `LOCATION:${esc(event.location)}`,
    ...(event.url ? [`URL:${esc(event.url)}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT12H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(event.title)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n");
}
