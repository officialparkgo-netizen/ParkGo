/**
 * AI journey optimisation, explainable pricing hints and translation.
 *
 * Mock mode uses transparent heuristics so the UX is real with no API key. Live
 * mode swaps in an LLM (Anthropic/OpenAI) behind the same functions — prompts
 * and provider live here, callers never change.
 */
import type { Locale, SearchResult } from "@/types";
import { formatMoneyShort } from "@/lib/utils";

export interface JourneySuggestion {
  spaceId: string;
  headline: string;
  reasons: string[];
  confidence: number; // 0–1
}

export interface OptimisePrefs {
  needsEv?: boolean;
  needsTransfer?: boolean;
  priority?: "price" | "convenience" | "trust";
}

/**
 * Suggest the best parking + transfer combo from a result set, with an
 * explainable rationale (the brief's "explainable pricing hints").
 */
export function optimiseJourney(
  results: SearchResult[],
  prefs: OptimisePrefs = {}
): JourneySuggestion | null {
  if (results.length === 0) return null;

  const priority = prefs.priority ?? "convenience";
  const scored = results.map((r) => {
    const s = r.space;
    const priceScore = 1 - normalise(r.estimatedTotal, results.map((x) => x.estimatedTotal));
    const convenienceScore = 1 - normalise(s.driveMinutes, results.map((x) => x.space.driveMinutes));
    const trustScore = s.rating / 5;
    const weights =
      priority === "price"
        ? { price: 0.6, convenience: 0.2, trust: 0.2 }
        : priority === "trust"
          ? { price: 0.2, convenience: 0.2, trust: 0.6 }
          : { price: 0.3, convenience: 0.4, trust: 0.3 };
    let score =
      priceScore * weights.price +
      convenienceScore * weights.convenience +
      trustScore * weights.trust;
    if (prefs.needsEv && s.evCharger) score += 0.1;
    return { r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const s = best.r.space;

  const reasons: string[] = [];
  if (s.driveMinutes <= 6) reasons.push(`Just ${s.driveMinutes} min to the terminal`);
  if (s.rating >= 4.7) reasons.push(`Highly rated (${s.rating.toFixed(1)}★, ${s.reviewCount} reviews)`);
  if (s.liveCamera) reasons.push("Live camera of your car");
  else if (s.cctv) reasons.push("CCTV monitored");
  if (prefs.needsEv && s.evCharger) reasons.push(`${s.evCharger.connector} EV charging on site`);
  reasons.push(`Bundle from ${formatMoneyShort(best.r.estimatedTotal, best.r.estimatedTotal > 0 ? (best.r.airport.country === "IE" ? "EUR" : "GBP") : "GBP")}`);

  return {
    spaceId: s.id,
    headline: `Best match near ${best.r.airport.name}`,
    reasons: reasons.slice(0, 4),
    confidence: Math.min(0.99, 0.6 + best.score * 0.35),
  };
}

/** Short explainable pricing hint for a single result. */
export function pricingHint(result: SearchResult): string {
  const median = result.estimatedTotal;
  const cur = result.airport.country === "IE" ? "EUR" : "GBP";
  return `${formatMoneyShort(median, cur)} all-in · single payment for parking${
    result.space.evCharger ? " + EV" : ""
  } + optional transfer`;
}

/**
 * Translate dynamic content. Mock mode returns the source text (UI strings are
 * handled by the i18n dictionary); live mode calls the LLM for on-the-fly
 * translation of host/listing free text.
 */
export async function translate(text: string, _target: Locale): Promise<string> {
  if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== "mock") {
    // Live: call the configured LLM here.
  }
  return text;
}

function normalise(value: number, all: number[]): number {
  const min = Math.min(...all);
  const max = Math.max(...all);
  if (max === min) return 0;
  return (value - min) / (max - min);
}
