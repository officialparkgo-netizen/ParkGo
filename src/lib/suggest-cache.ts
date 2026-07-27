import type { IndexRow } from "@/lib/suggest";

/**
 * Just the cache slot for the autocomplete index, deliberately in its own
 * module with no data-layer imports.
 *
 * The index is built from listings, so `suggest-index.ts` has to import
 * `data/hosts.ts`. But `data/hosts.ts` also has to drop the cache whenever a
 * listing changes — which would point an import straight back and close a
 * cycle. Keeping the slot here leaves both edges running one way into a leaf.
 *
 * Held on `globalThis` for the same reason the mock store is: it survives HMR
 * in dev and lives for the process in production.
 */
const g = globalThis as unknown as {
  __parkgoSuggestIndex?: { rows: IndexRow[]; builtAt: number };
};

export function readSuggestCache(now: number, ttlMs: number): IndexRow[] | null {
  const cached = g.__parkgoSuggestIndex;
  return cached && now - cached.builtAt < ttlMs ? cached.rows : null;
}

export function writeSuggestCache(rows: IndexRow[], now: number): void {
  g.__parkgoSuggestIndex = { rows, builtAt: now };
}

/**
 * Drop the cache after a listing write, so a newly approved space is findable
 * immediately and a paused one stops being offered. Missing a call site is not
 * fatal — the TTL catches it within a minute — but a space that is hidden from
 * search should not still be suggested by name.
 */
export function invalidateSuggestIndex(): void {
  g.__parkgoSuggestIndex = undefined;
}
