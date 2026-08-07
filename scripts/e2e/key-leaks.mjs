import { chromium } from "playwright";

/**
 * Whole-site guard against raw translation keys and broken pages.
 *
 * Every route — marketing, traveller, host, admin — is opened as the right
 * role, in English and Arabic, and fails the run if the page either errors
 * (HTTP ≥ 400) or shows anything shaped like a dictionary key
 * ("hero.searchCta"): that shape reaching a visitor always means a missing
 * or mistyped entry. Prefixes mirror the real dictionary namespaces.
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 node scripts/e2e/key-leaks.mjs
 *
 * Mock mode only — it signs in with the demo session cookies.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

// Top-level namespaces of the real dictionaries (single letters dropped —
// "e.g." is English, not a key).
const PREFIXES = [
  "about", "account", "admin", "airport", "app", "avatar", "blog", "book",
  "brand", "common", "contact", "cookie", "err", "faq", "footer", "guest",
  "hero", "home", "host", "hosts", "how", "imp", "journey", "login", "nav",
  "notif", "pass", "portal", "pricing", "privacy", "receipt", "role",
  "search", "status", "support", "team", "terminal", "terms", "thread",
  "trav", "travellers", "trust", "twofa", "value", "vehicle", "waitlist",
  "welcome",
];
const LEAK = new RegExp(`\\b(${PREFIXES.join("|")})\\.[a-zA-Z]+(\\.[a-zA-Z]+)*\\b`);

/** route → which demo session opens it (null = signed out). */
const ROUTES = [
  ["/", null],
  ["/about", null],
  ["/hosts", null],
  ["/travellers", null],
  ["/pricing", null],
  ["/how-it-works", null],
  ["/faq", null],
  ["/trust-safety", null],
  ["/contact", null],
  ["/terms", null],
  ["/privacy", null],
  ["/blog", null],
  ["/airports/heathrow", null],
  ["/airports/gatwick", null],
  ["/login", null],
  ["/team/login", null],
  ["/welcome", null],
  ["/app", "user_traveller"],
  ["/app/search?airport=heathrow", "user_traveller"],
  ["/app/trips", "user_traveller"],
  ["/app/saved", "user_traveller"],
  ["/app/rewards", "user_traveller"],
  ["/app/company", "user_traveller"],
  ["/app/space/space_lhr_1", "user_traveller"],
  ["/app/book/space_lhr_1", "user_traveller"],
  ["/app/booking/bk_active", "user_traveller"],
  ["/app/booking/bk_active/receipt", "user_traveller"],
  ["/app/booking/bk_active/track", "user_traveller"],
  ["/account", "user_traveller"],
  ["/notifications", "user_traveller"],
  ["/host", "user_host"],
  ["/host/today", "user_host"],
  ["/host/analytics", "user_host"],
  ["/host/payouts", "user_host"],
  ["/host/statement", "user_host"],
  ["/host/reviews", "user_host"],
  ["/host/settings", "user_host"],
  ["/host/verify", "user_host"],
  ["/host/new", "user_host"],
  ["/host/bookings/bk_active", "user_host"],
  ["/host/spaces/space_lhr_1/edit", "user_host"],
  ["/admin", "user_admin"],
  ["/admin/today", "user_admin"],
  ["/admin/analytics", "user_admin"],
  ["/admin/verification", "user_admin"],
  ["/admin/operator", "user_admin"],
  ["/admin/listings", "user_admin"],
  ["/admin/bookings", "user_admin"],
  ["/admin/users", "user_admin"],
  ["/admin/users/user_traveller", "user_admin"],
  ["/admin/payments", "user_admin"],
  ["/admin/reviews", "user_admin"],
  ["/admin/claims", "user_admin"],
  ["/admin/promos", "user_admin"],
  ["/admin/broadcast", "user_admin"],
  ["/admin/blog", "user_admin"],
  ["/admin/settings", "user_admin"],
  ["/admin/audit", "user_admin"],
  ["/admin/support", "user_admin"],
];

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});

for (const locale of ["en", "ar"]) {
  /** One context per (role, locale) — contexts are cheap, cookies are not shared. */
  const contexts = new Map();
  async function ctxFor(userId) {
    const key = userId ?? "public";
    if (contexts.has(key)) return contexts.get(key);
    const c = await browser.newContext();
    const cookies = [
      { name: "parkgo_cookie_consent", value: "all", url: BASE },
      { name: "parkgo_locale", value: locale, url: BASE },
    ];
    if (userId) cookies.push({ name: "parkgo_session", value: userId, url: BASE });
    await c.addCookies(cookies);
    contexts.set(key, c);
    return c;
  }

  for (const [path, role] of ROUTES) {
    const c = await ctxFor(role);
    const p = await c.newPage();
    try {
      const res = await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      const status = res?.status() ?? 0;
      if (status >= 400) {
        check(`[${locale}] ${path}`, false, `HTTP ${status}`);
        continue;
      }
      await p.waitForTimeout(250);
      // Elements marked data-raw-code (audit-log action codes) are data that
      // legitimately looks key-shaped — dropped from the live DOM before the
      // read. innerText (not textContent) keeps block boundaries as line
      // breaks, so "…the app." + "EV…" never fuses into a fake key.
      const body = await p.evaluate(() => {
        document.querySelectorAll("[data-raw-code]").forEach((n) => n.remove());
        return document.body.innerText;
      });
      const leak = body.match(LEAK);
      check(`[${locale}] ${path}`, !leak, leak ? `leaks "${leak[0]}"` : "");
    } catch (err) {
      check(`[${locale}] ${path}`, false, String(err).slice(0, 80));
    } finally {
      await p.close();
    }
  }
  for (const c of contexts.values()) await c.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
