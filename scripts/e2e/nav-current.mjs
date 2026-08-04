import { chromium } from "playwright";
/**
 * "Which page am I on?" — asserts the header marks exactly one link with
 * aria-current="page", and marks nothing on pages the nav does not point at.
 * The styling is the visible half; aria-current is the half a screen reader
 * relies on, and it is the one nothing else would catch if it regressed.
 */

// BASE=http://localhost:3000 node scripts/e2e/nav-current.mjs
const BASE = process.env.BASE ?? "http://localhost:3000";
const ok = [], bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
await c.addCookies([{ name: "parkgo_cookie_consent", value: "all", url: BASE }]);
const p = await c.newPage();

const CASES = [
  ["/how-it-works", "/how-it-works"],
  ["/travellers", "/travellers"],
  ["/hosts", "/hosts"],
  ["/pricing", "/pricing"],
  ["/trust-safety", "/trust-safety"],
  ["/", null],                       // home is not in the nav — nothing marked
  ["/airports/heathrow", null],      // not a nav destination either
];
for (const [path, expected] of CASES) {
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  const marked = await p.evaluate(() =>
    [...document.querySelectorAll('header nav a[aria-current="page"]')].map(a => new URL(a.href).pathname));
  const desktopMarked = marked.filter((h, i) => marked.indexOf(h) === i);
  check(`${path}: marks ${expected ?? "nothing"}`,
        expected ? desktopMarked.includes(expected) : desktopMarked.length === 0,
        JSON.stringify(desktopMarked));
  if (expected) check(`${path}: marks only one link`, desktopMarked.length === 1, `${desktopMarked.length}`);
}
// No raw i18n keys may ever reach a visitor — a missing dictionary entry
// renders as its own key ("hero.searchCta"), which is exactly this shape.
for (const path of ["/", "/about", "/hosts", "/travellers", "/pricing"]) {
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  const body = await p.evaluate(() => document.body.innerText);
  const leak = body.match(/\b(hero|home|nav|common|about|footer|value|waitlist|travellers|hosts|pricing)\.[a-zA-Z]+(\.[a-zA-Z]+)*\b/);
  check(`${path}: no raw translation keys leak`, !leak, leak?.[0] ?? "");
}

// the underline should actually be visible on the active one
await p.goto(BASE + "/hosts", { waitUntil: "networkidle" });
const vis = await p.evaluate(() => {
  const a = document.querySelector('header nav a[aria-current="page"]');
  if (!a) return null;
  return getComputedStyle(a, "::after").opacity;
});
check("the active link shows its underline", vis === "1", String(vis));
await b.close();
console.log([...ok, ...bad].join("\n"));
console.log(bad.length ? `\n${bad.length} FAILED` : `\nAll ${ok.length} checks passed.`);
process.exit(bad.length ? 1 : 0);
