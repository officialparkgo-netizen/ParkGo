import type { Locale } from "@/types";

/**
 * Which language is the visitor writing in?
 *
 * Script beats vocabulary for the non-Latin locales we support — Devanagari
 * means Hindi, CJK means Chinese, and that holds however the sentence is
 * phrased. The Arabic script carries two of our locales: Urdu extends it with
 * letters Arabic never uses (ٹ ڈ ڑ ں ے پ چ گ ک ی and aspirate ھ ہ), so any of
 * those decides Urdu, and plain Arabic script without them reads as Arabic.
 * German is the awkward one: it shares the Latin alphabet with English, so it
 * needs common-word evidence and only wins on a clear signal. Anything
 * unconvincing stays English.
 *
 * This drives a badge for the agent and which canned replies to offer — it is
 * never used to hide content, so a wrong guess costs nothing.
 */
const GERMAN_WORDS = [
  " ich ", " nicht ", " und ", " mein ", " meine ", " buchung", " kann ", " ist ",
  " wie ", " wo ", " wann ", " bitte", " danke", " haben", " sie ", " für ",
  " parkplatz", " stornieren", " geld", " auto", " flughafen",
];

export function detectLocale(text: string, fallback: Locale = "en"): Locale {
  if (!text.trim()) return fallback;
  if (/[؀-ۿ]/.test(text)) {
    // Letters Urdu uses and Arabic does not (incl. Perso-Arabic کی forms).
    return /[ٹڈڑںےپچگژکہھی]/.test(text) ? "ur" : "ar";
  }
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  if (/[一-鿿㐀-䶿]/.test(text)) return "zh";

  // Pad so the word list can match on whole words at either end.
  const padded = ` ${text.toLowerCase().replace(/[^\p{L}\s]/gu, " ")} `.replace(/\s+/g, " ");
  const hits = GERMAN_WORDS.filter((w) => padded.includes(w)).length;
  // Umlauts or ß alone are weak evidence; two common words is a real signal.
  if (hits >= 2 || (hits >= 1 && /[äöüß]/.test(text.toLowerCase()))) return "de";
  return fallback;
}

/** The visitor's language across a whole conversation, not one line. */
export function detectThreadLocale(
  messages: { role: string; text: string }[],
  fallback: Locale = "en"
): Locale {
  const said = messages
    .filter((m) => m.role === "user")
    .map((m) => m.text)
    .join(" ");
  return detectLocale(said, fallback);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
  hi: "हिन्दी",
  de: "Deutsch",
  zh: "中文",
  ar: "العربية",
};
