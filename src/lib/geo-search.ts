import type { Space } from "@/types";

/**
 * Free-text destination search: "Gatwick", "LGW", "Lowfield Heath" or
 * "RH11 0PT" all resolve to somewhere we can show results for. Postcodes are
 * matched space-insensitively so RH110PT and "rh11 0pt" both hit.
 */
export interface DestLite {
  slug: string;
  name: string;
  code: string;
  kind?: string;
}

export type QueryResolution =
  | { kind: "destination"; slug: string }
  | { kind: "spaces"; slug: string; spaceIds: string[] }
  | { kind: "none" };

const strip = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export function resolveSearchQuery(
  qRaw: string,
  destinations: DestLite[],
  spaces: Array<
    Pick<Space, "id" | "airportSlug" | "approxArea" | "exactAddress" | "title" | "status">
  >
): QueryResolution {
  const q = qRaw.trim().toLowerCase();
  if (!q) return { kind: "none" };

  // 1. Destination by exact code or slug ("LGW", "heathrow").
  const byCode = destinations.find(
    (d) => d.code.toLowerCase() === q || d.slug === q
  );
  if (byCode) return { kind: "destination", slug: byCode.slug };
  if (q.length < 3) return { kind: "none" };

  // 2. Destination by name, either direction ("gatwick" ⊆ "Gatwick Airport",
  //    "london gatwick airport" ⊇ "Gatwick Airport").
  const byName = destinations.find((d) => {
    const name = d.name.toLowerCase();
    return name.includes(q) || q.includes(name);
  });
  if (byName) return { kind: "destination", slug: byName.slug };

  // 3. Live spaces by area, street or postcode.
  const qs = strip(q);
  const matches = spaces.filter((s) => {
    if (s.status !== "live") return false;
    const hay = `${s.title} ${s.approxArea} ${s.exactAddress}`.toLowerCase();
    return hay.includes(q) || strip(hay).includes(qs);
  });
  if (matches.length > 0) {
    // The destination with the most matching spaces wins; show only those.
    const counts = new Map<string, number>();
    for (const m of matches) counts.set(m.airportSlug, (counts.get(m.airportSlug) ?? 0) + 1);
    const slug = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return {
      kind: "spaces",
      slug,
      spaceIds: matches.filter((m) => m.airportSlug === slug).map((m) => m.id),
    };
  }
  return { kind: "none" };
}
