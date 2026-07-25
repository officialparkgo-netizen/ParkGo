/**
 * Support desk availability. Hours are London local (the desk's home time),
 * so a Karachi visitor at 2am still sees the honest "we're closed" line
 * instead of a promise nobody will keep.
 */
export interface DeskState {
  open: boolean;
  /** Minutes until the desk opens again (0 when open). */
  opensInMinutes: number;
  /** Expected first reply while open, minutes. */
  replyMinutes: number;
}

/** London wall-clock hour + minute for an instant, DST-aware. */
export function londonTime(now: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  // Midnight can come back as "24" in some ICU builds.
  return { hour: get("hour") % 24, minute: get("minute") };
}

export function deskState(
  settings: { supportOpenHour: number; supportCloseHour: number; supportReplyMinutes: number },
  now: Date = new Date()
): DeskState {
  const { supportOpenHour: open, supportCloseHour: close, supportReplyMinutes } = settings;
  const replyMinutes = Math.max(1, supportReplyMinutes);
  // Equal hours mean the desk never closes.
  if (open === close) return { open: true, opensInMinutes: 0, replyMinutes };

  const { hour, minute } = londonTime(now);
  const mins = hour * 60 + minute;
  const openMins = open * 60;
  const closeMins = close * 60;
  // A window that wraps midnight (e.g. 20:00 → 06:00) is inclusive of both ends.
  const isOpen =
    openMins < closeMins
      ? mins >= openMins && mins < closeMins
      : mins >= openMins || mins < closeMins;
  if (isOpen) return { open: true, opensInMinutes: 0, replyMinutes };

  const untilOpen = (openMins - mins + 24 * 60) % (24 * 60);
  return { open: false, opensInMinutes: untilOpen || 24 * 60, replyMinutes };
}

/** "in 2h 15m" / "in 40m" for the closed-desk line. */
export function formatWait(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Anything that sounds like a car stuck, an accident or a flight about to
 * leave jumps the queue. Deliberately generous — a false urgent costs the
 * team a minute; a missed one costs a customer.
 */
const URGENT_WORDS = [
  "urgent", "emergency", "asap", "right now", "stuck", "stranded", "locked",
  "can't get", "cannot get", "accident", "crash", "damaged", "stolen", "theft",
  "police", "flight is", "missing my flight", "miss my flight", "no one is",
  "nobody is", "gate won't", "gate wont",
  // ur / hi / de / zh
  "فوری", "ایمرجنسی", "پھنس", "چوری", "तुरंत", "आपात", "फंस", "चोरी",
  "dringend", "notfall", "steckt fest", "gestohlen", "紧急", "被困", "被偷",
];

export function detectPriority(text: string): "normal" | "urgent" {
  const q = text.toLowerCase();
  return URGENT_WORDS.some((w) => q.includes(w)) ? "urgent" : "normal";
}
