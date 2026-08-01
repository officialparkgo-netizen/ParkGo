/**
 * Translation parity.
 *
 * English is the source of truth and every other locale falls back to it, so a
 * missing key is never a crash — which is exactly why it goes unnoticed. This
 * lists what each locale is missing, and fails only on the areas that are
 * meant to be complete everywhere.
 *
 *   node scripts/i18n/parity.mjs            # report
 *   node scripts/i18n/parity.mjs --strict   # fail on any gap in a full area
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const AREAS_DIR = "src/lib/i18n/areas";
const LOCALES = ["ur", "hi", "de", "zh", "ar"];

/**
 * Areas that must be complete in every locale. The marketing copy is a content
 * job and falls back to English by design; anything a signed-in user acts on
 * should be in their own language.
 */
const MUST_BE_COMPLETE = ["guestSuite", "core", "portalTraveller"];

/** Pull the `"key": "value"` pairs out of one locale block of an area file. */
function keysFor(source, locale) {
  const start = source.indexOf(`\n  ${locale}: {`);
  if (start < 0) return null;
  let depth = 0;
  let i = source.indexOf("{", start);
  const from = i;
  for (; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const block = source.slice(from, i);
  return new Set([...block.matchAll(/"([^"]+)"\s*:/g)].map((m) => m[1]));
}

const strict = process.argv.includes("--strict");
let problems = 0;

for (const file of readdirSync(AREAS_DIR).filter((f) => f.endsWith(".ts")).sort()) {
  const name = file.replace(/\.ts$/, "");
  const src = readFileSync(join(AREAS_DIR, file), "utf8");
  const en = keysFor(src, "en");
  if (!en) {
    console.log(`!! ${name}: no English block found`);
    problems += 1;
    continue;
  }
  const required = MUST_BE_COMPLETE.includes(name);
  const gaps = [];
  for (const loc of LOCALES) {
    const keys = keysFor(src, loc);
    const missing = keys ? [...en].filter((k) => !keys.has(k)) : [...en];
    if (missing.length) gaps.push([loc, missing]);
  }

  const tag = required ? "MUST" : "opt ";
  if (gaps.length === 0) {
    console.log(`${tag} ${name.padEnd(18)} ${en.size} keys · complete in all ${LOCALES.length}`);
    continue;
  }
  const summary = gaps.map(([l, m]) => `${l}:-${m.length}`).join(" ");
  console.log(`${tag} ${name.padEnd(18)} ${en.size} keys · ${summary}`);
  if (required) {
    for (const [loc, missing] of gaps) {
      console.log(`     ${loc} missing: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ` … +${missing.length - 8}` : ""}`);
      problems += missing.length;
    }
  }
}

console.log(
  problems === 0
    ? "\nEvery area that has to be translated everywhere, is."
    : `\n${problems} missing keys in areas that must be complete.`
);
process.exit(strict && problems > 0 ? 1 : 0);
