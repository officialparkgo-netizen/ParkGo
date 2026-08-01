import { chromium } from "playwright";

/**
 * Arabic, end to end at the rendering layer: pick العربية and the whole
 * document flips to RTL Arabic — marketing page, portal chrome, and the
 * language switcher itself. Urdu is asserted alongside as the second RTL
 * locale, so a regression in the dir plumbing cannot hide behind either.
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 node scripts/e2e/rtl-arabic.mjs
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});

async function pageAs(locale, userId) {
  const c = await browser.newContext();
  const cookies = [
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_locale", value: locale, url: BASE },
  ];
  if (userId) cookies.push({ name: "parkgo_session", value: userId, url: BASE });
  await c.addCookies(cookies);
  return { c, p: await c.newPage() };
}

// ------------------------------------------------ the public site, Arabic --
{
  const { c, p } = await pageAs("ar");
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("html lang is ar", (await p.getAttribute("html", "lang")) === "ar");
  check("html dir is rtl", (await p.getAttribute("html", "dir")) === "rtl");
  const body = await p.locator("body").innerText();
  check("the homepage renders Arabic text", /[؀-ۿ]{3,}/.test(body));
  check(
    "the language switcher names العربية",
    body.includes("العربية")
  );

  // The stats band's language counter counts the registry — now six.
  const langStat = await p
    .locator("[data-stat-counter][data-stat-target]")
    .evaluateAll((els) => els.map((e) => e.dataset.statTarget));
  check("the language stat says 6", langStat.includes("6"), langStat.join(","));

  await p.goto(`${BASE}/blog`, { waitUntil: "networkidle" });
  const blog = await p.locator("body").innerText();
  check("the blog chrome is Arabic", /[؀-ۿ]{3,}/.test(blog));
  await c.close();
}

// ----------------------------------------------- the portal chrome, Arabic --
{
  const { c, p } = await pageAs("ar", "user_traveller");
  await p.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  check("the portal keeps dir rtl", (await p.getAttribute("html", "dir")) === "rtl");
  const body = await p.locator("body").innerText();
  check("the traveller portal renders Arabic", /[؀-ۿ]{3,}/.test(body));
  await c.close();
}

// ------------------------------------------- Urdu still works beside it --
{
  const { c, p } = await pageAs("ur");
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("Urdu keeps lang ur + dir rtl", (await p.getAttribute("html", "lang")) === "ur" && (await p.getAttribute("html", "dir")) === "rtl");
  await c.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
