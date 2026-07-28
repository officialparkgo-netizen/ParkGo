import "server-only";
import type { Locale } from "@/types";

/**
 * Machine translation for support, so an agent who reads only English can
 * still answer someone writing in Urdu, Hindi, German or Chinese.
 *
 * Two rules shape everything here.
 *
 * The original is **never replaced**. A translation is stored alongside the
 * text the person actually typed, and the agent sees both. Machine translation
 * drops negations and reverses modals often enough that an agent acting only
 * on the English could refund the wrong booking — "I could not cancel" and "I
 * cancelled" are one dropped word apart.
 *
 * And it is gated on a provider key. Without one nothing is translated and the
 * agent sees what they see today: the original text plus a language badge. A
 * missing key must never lose a message.
 */

export type Provider = "deepl" | "google" | "demo";

/**
 * Which provider to use.
 *
 * Google first. DeepL translates German better, but ParkGo's second language
 * is Urdu, and that is the one Google certainly covers — a provider that is
 * excellent at a language we barely see and unreliable at the one we do is the
 * wrong default. `TRANSLATE_PROVIDER=deepl` overrides it for anyone who
 * decides otherwise, and is ignored unless that provider's key is actually set,
 * so a stale override can never silently turn translation off.
 */
export function translationProvider(): Provider | null {
  const google = !!process.env.GOOGLE_TRANSLATE_API_KEY;
  const deepl = !!process.env.DEEPL_API_KEY;
  const forced = process.env.TRANSLATE_PROVIDER;

  if (forced === "deepl" && deepl) return "deepl";
  if (forced === "google" && google) return "google";
  if (google) return "google";
  if (deepl) return "deepl";

  // Demo only, and only when asked for by name: it lets the console be seen
  // working before anyone buys a translation plan. It never runs in live mode,
  // and what it emits is labelled so it cannot be mistaken for a translation.
  if (process.env.PARKGO_DEMO_TRANSLATE === "1" && process.env.PARKGO_MODE !== "live") {
    return "demo";
  }
  return null;
}

export function isTranslationConfigured(): boolean {
  return translationProvider() !== null;
}

export interface Translation {
  text: string;
  /** What the provider thought the source was, when it says. */
  detected?: string;
  provider: Provider;
}

/** DeepL's target codes differ from ours; anything else it takes as-is. */
const DEEPL_TARGET: Record<string, string> = { en: "EN-GB", zh: "ZH", pt: "PT-PT" };

/**
 * Translate one message. Returns null when there is no provider, nothing to
 * translate, or the call fails — every caller treats null as "leave it alone".
 */
export async function translateText(
  text: string,
  target: Locale | string = "en",
  source?: Locale | string
): Promise<Translation | null> {
  const body = text.trim();
  if (!body) return null;
  const provider = translationProvider();
  if (!provider) return null;
  // Nothing to do, and a needless API call besides.
  if (source && source === target) return null;

  try {
    if (provider === "demo") {
      // Deliberately not a translation. Anything that looked like one would
      // eventually be believed, and a believed fake translation is worse than
      // no translation at all.
      return { text: `[demo — no translation provider configured] ${body}`, provider: "demo" };
    }
    return provider === "deepl"
      ? await viaDeepL(body, target, source)
      : await viaGoogle(body, target, source);
  } catch {
    // A provider outage must never swallow a customer's message.
    return null;
  }
}

async function viaDeepL(
  text: string,
  target: string,
  source?: string
): Promise<Translation | null> {
  const key = process.env.DEEPL_API_KEY!;
  // Free-tier keys end in ":fx" and live on a different host.
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      target_lang: DEEPL_TARGET[target] ?? target.toUpperCase(),
      ...(source ? { source_lang: source.toUpperCase() } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    translations?: { text?: string; detected_source_language?: string }[];
  };
  const hit = data.translations?.[0];
  if (!hit?.text) return null;
  return {
    text: hit.text,
    detected: hit.detected_source_language?.toLowerCase(),
    provider: "deepl",
  };
}

async function viaGoogle(
  text: string,
  target: string,
  source?: string
): Promise<Translation | null> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY!;
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target,
        format: "text",
        ...(source ? { source } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data?: { translations?: { translatedText?: string; detectedSourceLanguage?: string }[] };
  };
  const hit = data.data?.translations?.[0];
  if (!hit?.translatedText) return null;
  return {
    text: hit.translatedText,
    detected: hit.detectedSourceLanguage?.toLowerCase(),
    provider: "google",
  };
}

/**
 * Should this message be translated for the team at all?
 *
 * Deliberately conservative. A one-word "ok", a booking reference or a bare
 * URL carries no language, and running it through a translator produces noise
 * that makes the thread harder to read rather than easier.
 */
export function worthTranslating(text: string, detected: Locale): boolean {
  if (detected === "en") return false;
  const stripped = text.replace(/https?:\/\/\S+/g, " ").trim();
  // Two words, or any non-Latin script at all — a single Urdu word is still
  // a word an English reader cannot read.
  const hasNonLatin = /[؀-ۿऀ-ॿ一-鿿]/.test(stripped);
  return hasNonLatin || stripped.split(/\s+/).filter(Boolean).length >= 2;
}
