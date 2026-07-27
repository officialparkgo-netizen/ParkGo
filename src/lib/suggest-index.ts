import { IS_LIVE } from "@/lib/config";
import { getAirports } from "@/lib/data/store";
import { listAllSpaces } from "@/lib/data/hosts";
import { buildSuggestIndex, type IndexRow } from "@/lib/suggest";
import { readSuggestCache, writeSuggestCache } from "@/lib/suggest-cache";

/**
 * The autocomplete index.
 *
 * Autocomplete runs on every keystroke and building the index means reading
 * every listing, so a five-letter query would be five full table reads in live
 * mode. Hence the cache.
 *
 * Mock mode does not cache at all. `listAllSpaces()` there is an array
 * reference and the rebuild is microseconds, so paying it buys us a suggester
 * that is *always* consistent with the store and one less thing that can go
 * stale. The cache only exists to spare the database.
 *
 * The TTL matches the route's own `max-age=60`.
 */
const TTL_MS = 60_000;

async function build(): Promise<IndexRow[]> {
  return buildSuggestIndex(getAirports(), await listAllSpaces());
}

export async function getSuggestIndex(now = Date.now()): Promise<IndexRow[]> {
  if (!IS_LIVE) return build();
  const cached = readSuggestCache(now, TTL_MS);
  if (cached) return cached;
  const rows = await build();
  writeSuggestCache(rows, now);
  return rows;
}

export { invalidateSuggestIndex } from "@/lib/suggest-cache";
