import type { Space } from "@/types";

/**
 * Destination autocomplete.
 *
 * The rule this module exists to enforce: **the dropdown must never offer less
 * than pressing Enter would find.** Before this, suggestions came from a
 * separate, weaker matcher that only knew about the 14 destinations, while
 * `resolveSearchQuery` (the submit-time matcher) searched every live listing's
 * title, area and address. So "lowfield", "RH11", "crawley" and "santry" all
 * showed an empty dropdown and then worked perfectly on Enter — the dropdown
 * was lying about what the search could do.
 *
 * ── The address rule, which is a security boundary ────────────────────────
 * `Space.exactAddress` is "released only after payment" (src/types/index.ts).
 * This endpoint has no auth and is reachable from the anonymous marketing home,
 * so an address must never reach a label. Matching the raw string is not safe
 * either: it would turn the box into an oracle where "2 charlwood rd" hits and
 * "3 charlwood rd" misses, confirming a host's home address one keystroke at a
 * time. Instead `publicAddressTokens` derives, positionally, only the parts
 * that are already public elsewhere on the site — the town and the outward
 * half of the postcode — and never the first comma-segment (the street) nor
 * the inward code. See its own comment for why position, not pattern.
 */

export type SuggestType = "destination" | "area" | "place";

export interface SuggestRow {
  /** Goes into the input verbatim on pick — must round-trip through search. */
  label: string;
  /** Rendered as a separate muted line. Never concatenated into `label`. */
  sublabel?: string;
  type: SuggestType;
  /** Served destination. */
  slug?: string;
  /** Free-text to submit as `?q=` — set on area rows. */
  q?: string;
  lat?: number;
  lng?: number;
}

export interface IndexRow extends SuggestRow {
  type: "destination" | "area";
  /** Single tokens, prefix-matched. */
  keys: string[];
  /** Whole normalised strings, substring-matched. */
  phrases: string[];
  /** Live listings behind this row. Tie-break only — never rendered. */
  supply: number;
}

export interface DestinationLite {
  slug: string;
  name: string;
  code: string;
  city: string;
  kind?: string;
}

/** Lowercase, fold diacritics, drop punctuation, collapse whitespace. */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** `norm` with the spaces removed, so "rh11 0pt" and "RH110PT" compare equal. */
export function squash(s: string): string {
  return norm(s).replace(/ /g, "");
}

/**
 * Filler people type around a place name. Stripped before matching so
 * "gatwick parking" and "parking near luton" behave like "gatwick" and "luton".
 * "airport" is deliberately absent — it is a kind alias below, because no
 * destination is literally named "… Airport".
 */
const STOPWORDS = new Set([
  "parking", "park", "car", "cars", "space", "spaces", "near", "nearby", "me",
  "my", "at", "in", "on", "the", "a", "to", "cheap", "cheapest", "long",
  "stay", "for", "and",
]);

/** Words that should find a whole class of destination. */
const KIND_ALIASES: Record<string, string[]> = {
  airport: ["airport", "airports", "terminal", "terminals", "flight", "flights"],
  city: ["city", "centre", "center", "downtown"],
  station: ["station", "train", "rail"],
  stadium: ["stadium", "arena"],
};

/** Local shorthand that no substring match would ever catch. */
const NICKNAMES: Record<string, string> = {
  brum: "birmingham",
  manc: "manchester",
  kx: "kings cross",
};

const tokens = (s: string): string[] => (s ? norm(s).split(" ").filter(Boolean) : []);

/** UK outward code: the half before the space (SW1A, RH11, M22, N1). */
const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;

/** A query that reads like a postcode, so it should anchor rather than float. */
const POSTCODE_SHAPED = /^[a-z]{1,2}\d/;

export interface AddressTokens {
  localities: string[];
  /** Outward code only. The inward half is never indexed. */
  outward: string | null;
}

/**
 * Pull the publicly-safe parts out of an exact address.
 *
 * Positional, not pattern-based, and that choice is the whole safety argument.
 * A pattern like "any word that looks like a town" would happily match
 * "Charlwood" out of "2 Charlwood Rd" and put a street into a public index. UK
 * and IE addresses put the street first and the town last, so taking only the
 * final comma-segment — never `segments[0]` — is what makes the output safe by
 * construction rather than by a blocklist that has to keep up.
 *
 *   "2 Charlwood Rd, Crawley RH11 0PT"        → { localities: [Crawley], outward: RH11 }
 *   "Unit 3, Dovedale Close, Hounslow TW6 2AB" → { localities: [Hounslow], outward: TW6 }
 *   "Old Airport Rd, Santry, Dublin 9"         → { localities: [Dublin, Santry], outward: null }
 *
 * Note the third case: no UK postcode, so the second-to-last segment is taken
 * too — that is the only way "Santry" becomes findable. It is still never
 * `segments[0]`, so "Old Airport Rd" stays out and typing "airport" cannot
 * surface a Dublin driveway.
 */
export function publicAddressTokens(exactAddress: string): AddressTokens {
  const segments = exactAddress.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length < 2) return { localities: [], outward: null };

  const last = segments[segments.length - 1];
  const pc = last.match(UK_POSTCODE);
  const localities: string[] = [];

  if (pc) {
    const town = last.replace(UK_POSTCODE, "").trim();
    if (town) localities.push(town);
    return { localities, outward: pc[1] };
  }

  // No UK postcode: an Irish "Dublin 9" style tail, or a bare town.
  const town = last.replace(/\s+\d{1,2}$/, "").trim();
  if (town) localities.push(town);
  // Only reach back when doing so cannot touch the street at segments[0].
  if (segments.length >= 3) localities.push(segments[segments.length - 2]);
  return { localities, outward: null };
}

type SpaceLite = Pick<
  Space,
  "airportSlug" | "approxArea" | "exactAddress" | "title" | "status"
>;

/**
 * Build the searchable index. Destinations first, then one row per distinct
 * area of a **live** listing — `listAllSpaces()` does not filter by status, so
 * without the guard here a `pending_review` listing would be advertised on the
 * public homepage before anyone had approved it.
 */
export function buildSuggestIndex(
  destinations: DestinationLite[],
  spaces: SpaceLite[]
): IndexRow[] {
  const bySlug = new Map(destinations.map((d) => [d.slug, d]));
  const live = spaces.filter((s) => s.status === "live");

  const supply = new Map<string, number>();
  for (const s of live) supply.set(s.airportSlug, (supply.get(s.airportSlug) ?? 0) + 1);

  const rows: IndexRow[] = destinations.map((d) => {
    const kind = d.kind ?? "airport";
    const label = kind === "airport" ? `${d.name} (${d.code})` : d.name;
    return {
      label,
      type: "destination" as const,
      slug: d.slug,
      supply: supply.get(d.slug) ?? 0,
      keys: [
        ...tokens(d.name),
        ...tokens(d.city),
        ...tokens(d.slug),
        d.code.toLowerCase(),
        ...(KIND_ALIASES[kind] ?? []),
      ],
      phrases: [norm(d.name), norm(d.city), norm(d.slug), norm(label)],
    };
  });

  // One row per distinct area. Two listings in the same area share a row.
  const areas = new Map<string, IndexRow>();
  for (const s of live) {
    if (!s.approxArea) continue;
    const key = norm(s.approxArea);
    if (!key) continue;
    const dest = bySlug.get(s.airportSlug);
    const { localities, outward } = publicAddressTokens(s.exactAddress ?? "");

    const existing = areas.get(key);
    const row: IndexRow =
      existing ??
      ({
        label: s.approxArea,
        sublabel: dest?.name,
        type: "area",
        // Submit the area as free text, never the destination slug: picking
        // "Lowfield Heath" must narrow to Lowfield Heath, not widen to Gatwick.
        q: s.approxArea,
        supply: 0,
        keys: [],
        phrases: [],
      } as IndexRow);

    row.supply += 1;
    row.keys.push(
      ...tokens(s.approxArea),
      ...tokens(s.title ?? ""),
      ...localities.flatMap((l) => tokens(l)),
      ...(outward ? [norm(outward)] : [])
    );
    row.phrases.push(
      norm(s.approxArea),
      ...localities.map((l) => norm(l)),
      ...(outward ? [norm(outward)] : [])
    );
    areas.set(key, row);
  }

  for (const row of areas.values()) {
    // Tokens shorter than 3 are noise ("st", "rd") except terminal codes.
    row.keys = [...new Set(row.keys)].filter(
      (k) => k.length >= 3 || /^t\d$/.test(k) || /^n\d$/.test(k)
    );
    row.keys = row.keys.filter((k) => !STOPWORDS.has(k));
    row.phrases = [...new Set(row.phrases)].filter(Boolean);
    rows.push(row);
  }

  return rows;
}

/** Damerau–Levenshtein, capped — we only ever care about "within 2". */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        cur[j] = Math.min(cur[j], prev[j - 1]);
      }
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = cur[j];
  }
  return prev[b.length];
}

function scoreRow(row: IndexRow, q: string, qTokens: string[], qSquash: string): number {
  if (row.type === "destination" && row.slug) {
    if (q === row.slug || row.keys.includes(q)) {
      // Exact code or slug — "LGW", "heathrow".
      if (q === row.slug || q === row.label.match(/\(([^)]+)\)$/)?.[1].toLowerCase()) return 100;
    }
  }
  if (row.phrases.includes(q)) return 95;

  const prefixesAKey = (t: string) => row.keys.some((k) => k.startsWith(t));
  const allTokensPrefix = qTokens.length > 0 && qTokens.every(prefixesAKey);
  const labelStarts = norm(row.label).startsWith(qTokens[0] ?? " ");

  if (allTokensPrefix && labelStarts) return 90;

  // A postcode-shaped query only ever matches from the start of a district.
  // Left free-floating, "M22" also matches "CM22" and a Manchester search
  // offers a space in Essex.
  const anchored = POSTCODE_SHAPED.test(qSquash);

  // Reverse containment mirrors resolveSearchQuery: "london gatwick airport"
  // still finds "London Gatwick", and "RH11 0PT" still finds district RH11.
  // Safe under anchoring, because it only ever widens the query, never the
  // phrase — "m22" does not contain "cm22".
  if (row.phrases.some((p) => p.startsWith(q) || (p.length >= 3 && q.includes(p)))) return 80;
  // Forward containment is the one that has to be anchored: it is what lets
  // "CM22" answer to "M22".
  if (!anchored && row.phrases.some((p) => p.includes(q))) return 70;
  if (allTokensPrefix) return 65;
  // Space-insensitive, so "rh110pt" finds "RH11 0PT".
  if (
    qSquash.length >= 2 &&
    row.phrases.some((p) =>
      anchored ? squash(p).startsWith(qSquash) : squash(p).includes(qSquash)
    )
  ) {
    return 60;
  }

  // Typos, last resort only, and never on a query short enough for a random
  // two-edit hop to land on an unrelated town.
  if (q.length >= 4) {
    for (const k of row.keys) {
      if (k[0] !== q[0]) continue;
      if (editDistance(q, k, 2) <= 2) return 30;
    }
  }
  return 0;
}

const TYPE_RANK: Record<string, number> = { destination: 0, area: 1, place: 2 };

/**
 * Rank the index against a query. Text only — there is no location signal in
 * scope, and live-space count is a tie-break rather than a term so the endpoint
 * never becomes a readout of which hosts have supply.
 */
export function suggestFromIndex(
  qRaw: string,
  index: IndexRow[],
  limit = 7
): SuggestRow[] {
  const cleaned = norm(qRaw);
  if (cleaned.length < 2) return [];

  const kept = cleaned.split(" ").filter((t) => !STOPWORDS.has(t));
  const expanded = kept.map((t) => NICKNAMES[t] ?? t);
  const q = expanded.join(" ").trim();
  if (q.length < 2) return [];
  const qTokens = q.split(" ").filter(Boolean);
  const qSquash = q.replace(/ /g, "");

  const scored: Array<{ row: IndexRow; score: number }> = [];
  for (const row of index) {
    const score = scoreRow(row, q, qTokens, qSquash);
    if (score > 0) scored.push({ row, score });
  }

  // Highest score wins per destination/area; a slug can only appear once.
  const best = new Map<string, { row: IndexRow; score: number }>();
  for (const s of scored) {
    const key = s.row.slug ?? `area:${norm(s.row.label)}`;
    const prev = best.get(key);
    if (!prev || s.score > prev.score) best.set(key, s);
  }

  const ordered = [...best.values()].sort(
    (a, b) =>
      b.score - a.score ||
      TYPE_RANK[a.row.type] - TYPE_RANK[b.row.type] ||
      b.row.supply - a.row.supply ||
      (a.row.slug ?? a.row.label).localeCompare(b.row.slug ?? b.row.label)
  );

  // Quotas so a query like "manchester" can't fill the list with one city's
  // areas and hide the other destinations.
  const out: SuggestRow[] = [];
  let dests = 0;
  let areas = 0;
  for (const { row } of ordered) {
    if (out.length >= limit) break;
    if (row.type === "destination") {
      if (dests >= 4) continue;
      dests += 1;
    } else {
      if (areas >= 3) continue;
      areas += 1;
    }
    const { keys: _keys, phrases: _phrases, supply: _supply, ...rest } = row;
    void _keys;
    void _phrases;
    void _supply;
    out.push(rest);
  }
  return out;
}
