import { describe, expect, it } from "vitest";
import { airports, spaces } from "@/lib/data/seed";
import {
  buildSuggestIndex,
  norm,
  publicAddressTokens,
  squash,
  suggestFromIndex,
} from "./suggest";
import { resolveSearchQuery } from "./geo-search";

/**
 * Fixtures are the REAL seed, not hand-written stand-ins, and that is
 * deliberate. The older geo-search tests invent `approxArea: "Hounslow West"`,
 * but in the actual data "Hounslow" appears only inside an exactAddress and the
 * area is "Hatton Cross". Test against an invented corpus and you watch the
 * suite go green while the queries the user reported stay broken.
 */
const index = buildSuggestIndex(airports, spaces);
const ask = (q: string) => suggestFromIndex(q, index);
const labels = (q: string) => ask(q).map((s) => s.label);

describe("publicAddressTokens", () => {
  it("takes the town and the outward code, never the street", () => {
    expect(publicAddressTokens("2 Charlwood Rd, Crawley RH11 0PT")).toEqual({
      localities: ["Crawley"],
      outward: "RH11",
    });
    expect(publicAddressTokens("Unit 3, Dovedale Close, Hounslow TW6 2AB")).toEqual({
      localities: ["Hounslow"],
      outward: "TW6",
    });
    expect(publicAddressTokens("14 Bath Road, Longford UB7 0EX")).toEqual({
      localities: ["Longford"],
      outward: "UB7",
    });
  });

  it("reaches one segment further only when that cannot be the street", () => {
    // Three segments and no UK postcode, so "Santry" is safe to take.
    expect(publicAddressTokens("Old Airport Rd, Santry, Dublin 9")).toEqual({
      localities: ["Dublin", "Santry"],
      outward: null,
    });
    // Two segments: the second-to-last IS the street, so it must be left alone.
    expect(publicAddressTokens("Old Airport Rd, Santry")).toEqual({
      localities: ["Santry"],
      outward: null,
    });
  });

  it("returns nothing for an address with no comma", () => {
    expect(publicAddressTokens("Somewhere")).toEqual({ localities: [], outward: null });
  });
});

describe("norm / squash", () => {
  it("folds apostrophes, punctuation, case and repeated spaces", () => {
    expect(norm("London King's Cross")).toBe("london kings cross");
    expect(norm("  london   HEATHROW ")).toBe("london heathrow");
    expect(norm("kings-cross")).toBe("kings cross");
  });
  it("squash removes the postcode space", () => {
    expect(squash("RH11 0PT")).toBe("rh110pt");
    expect(squash("rh110pt")).toBe("rh110pt");
  });
});

describe("destinations", () => {
  it("still answers the queries that already worked", () => {
    expect(labels("heath")).toContain("London Heathrow (LHR)");
    expect(labels("gat")).toContain("London Gatwick (LGW)");
    expect(labels("manch")).toContain("Manchester (MAN)");
    expect(labels("dubl")).toContain("Dublin (DUB)");
  });

  it("matches a code and a slug exactly", () => {
    expect(labels("LGW")[0]).toBe("London Gatwick (LGW)");
    expect(labels("lhr")[0]).toBe("London Heathrow (LHR)");
    expect(labels("manchester-city")).toContain("Manchester City Centre");
  });

  it("folds the apostrophe in King's Cross", () => {
    // A station, so the label is the bare name — the "(CODE)" suffix is for
    // airports only.
    for (const q of ["kings cross", "king's cross", "kings-cross", "KINGS CROSS"]) {
      expect(labels(q), q).toContain("London King's Cross");
    }
  });

  it("treats 'airport' as a class, not a name", () => {
    const got = labels("airport");
    expect(got.length).toBeGreaterThan(0);
    expect(got).toContain("London Heathrow (LHR)");
    // "Old Airport Rd" is a street and must not have been indexed.
    expect(got).not.toContain("Santry");
  });

  it("ignores filler words around the place name", () => {
    expect(labels("gatwick parking")[0]).toBe("London Gatwick (LGW)");
    expect(labels("parking near luton")[0]).toBe("London Luton (LTN)");
    expect(labels("heathrow airport")[0]).toBe("London Heathrow (LHR)");
    expect(labels("cheap parking manchester")).toContain("Manchester (MAN)");
  });

  it("forgives a typo but not a stranger", () => {
    expect(labels("hethrow")).toContain("London Heathrow (LHR)");
    expect(labels("gatwik")).toContain("London Gatwick (LGW)");
    expect(ask("zzzqqq")).toEqual([]);
    expect(labels("manch")).not.toContain("Birmingham (BHX)");
  });
});

describe("areas and postcodes — the queries the user reported", () => {
  it("finds a listing area by name", () => {
    for (const q of ["lowfield", "lowfield heath", "Lowfield Heath"]) {
      const hit = ask(q).find((s) => s.label === "Lowfield Heath");
      expect(hit, q).toBeTruthy();
      expect(hit!.type).toBe("area");
      expect(hit!.q).toBe("Lowfield Heath");
      expect(hit!.slug).toBeUndefined();
    }
  });

  it("covers every live area in the seed", () => {
    for (const area of ["Santry", "Wythenshawe", "Castlefield", "Barnsbury", "Takeley", "Wembley Park", "Hatton Cross"]) {
      expect(labels(area), area).toContain(area);
    }
  });

  it("finds an area by its outward postcode, with or without the space", () => {
    for (const q of ["RH11", "rh11", "RH11 0PT", "rh110pt"]) {
      expect(labels(q), q).toContain("Lowfield Heath");
    }
    expect(labels("M22")).toContain("Wythenshawe");
    // …and only that one: CM22 contains "m22" but is a different district.
    expect(labels("M22")).not.toContain("Takeley");
    expect(labels("TW6")).toContain("Hatton Cross");
    expect(labels("HA9")).toContain("Wembley Park");
    expect(labels("CM22")).toContain("Takeley");
    expect(labels("UB7")).toContain("Longford, near Heathrow T5");
  });

  it("finds an area by the town in its address", () => {
    expect(labels("hounslow")).toContain("Hatton Cross");
    expect(labels("crawley")).toContain("Lowfield Heath");
    expect(labels("santry")).toContain("Santry");
  });

  it("names the destination as a sublabel, never inside the label", () => {
    const hit = ask("lowfield").find((s) => s.label === "Lowfield Heath")!;
    expect(hit.sublabel).toBe("London Gatwick");
    expect(hit.label).toBe("Lowfield Heath");
  });
});

describe("the address boundary", () => {
  const CORPUS = [
    "lowfield", "RH11", "RH11 0PT", "rh110pt", "M22", "hounslow", "crawley",
    "santry", "wembley park", "takeley", "castlefield", "barnsbury",
    "wythenshawe", "hatton", "longford", "dublin", "manchester", "london",
    "airport", "heath", "N1", "M3", "UB7", "TW6", "HA9", "CM22",
  ];
  const everything = CORPUS.flatMap((q) =>
    ask(q).flatMap((s) => [s.label, s.sublabel ?? "", s.q ?? ""])
  );

  it("never emits a street name or a house number", () => {
    const STREETS =
      /(bath road|dovedale|charlwood|ringway|duke st|hemingford|oakington|dunmow|eastfield|old airport rd)/i;
    for (const text of everything) {
      expect(text, `leaked street in: ${text}`).not.toMatch(STREETS);
      expect(text, `leaked house number in: ${text}`).not.toMatch(/^\d+\s/);
    }
  });

  it("never emits an inward postcode half", () => {
    for (const text of everything) {
      expect(text, `leaked inward code in: ${text}`).not.toMatch(/\b\d[A-Z]{2}\b/);
    }
  });

  it("never offers a listing that is not live", () => {
    // Edinburgh's only space is pending_review (seed.ts) — its area, its
    // street and its postcode must all be invisible.
    expect(labels("ingliston")).not.toContain("Ingliston");
    expect(labels("EH28")).toEqual([]);
    expect(labels("eastfield")).toEqual([]);
  });
});

describe("ranking and shape", () => {
  it("puts destinations before areas and caps the list", () => {
    const rows = ask("manchester");
    expect(rows.length).toBeLessThanOrEqual(7);
    const firstArea = rows.findIndex((r) => r.type === "area");
    const lastDest = rows.map((r) => r.type).lastIndexOf("destination");
    if (firstArea !== -1 && lastDest !== -1) expect(lastDest).toBeLessThan(firstArea);
  });

  it("returns no duplicate labels", () => {
    for (const q of ["lon", "manchester", "dublin", "london"]) {
      const got = labels(q);
      expect(new Set(got).size, q).toBe(got.length);
    }
  });

  it("is deterministic", () => {
    expect(ask("lon")).toEqual(ask("lon"));
    expect(ask("manchester")).toEqual(ask("manchester"));
  });

  it("ignores queries that are too short or all filler", () => {
    expect(ask("m")).toEqual([]);
    expect(ask("")).toEqual([]);
    expect(ask("near me")).toEqual([]);
    expect(ask("parking")).toEqual([]);
  });

  it("survives an absurd query without hanging", () => {
    expect(ask("x".repeat(5000))).toEqual([]);
  });
});

describe("round-trip invariant", () => {
  /**
   * The load-bearing test. Whatever a row puts in the search box must still
   * resolve when the user presses Enter — otherwise a helpful-looking
   * suggestion silently makes the search worse than typing nothing.
   */
  it("every suggestion resolves when submitted", () => {
    const queries = [
      "heath", "gat", "lon", "manch", "dubl", "lowfield", "RH11", "santry",
      "hounslow", "crawley", "wembley park", "castlefield", "barnsbury",
      "takeley", "wythenshawe", "hatton", "longford", "kings cross",
      "airport", "hethrow", "M22", "UB7",
    ];
    for (const q of queries) {
      for (const row of ask(q)) {
        const submitted = row.q ?? row.label;
        const resolved = resolveSearchQuery(submitted, airports, spaces);
        expect(resolved.kind, `"${q}" → "${submitted}" did not resolve`).not.toBe("none");
      }
    }
  });
});
