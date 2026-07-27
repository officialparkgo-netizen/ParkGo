import { chromium } from "playwright";
/**
 * Destination autocomplete, end to end in a real browser.
 *
 * Guards the two bugs that made the box look broken — the dropdown being
 * clipped to invisibility on desktop, and the server only knowing about
 * destination names — plus the address boundary, which no unit test can prove
 * for the rendered DOM.
 */

// BASE=http://localhost:3000 node scripts/e2e/search-suggest.mjs
const BASE = process.env.BASE ?? "http://localhost:3000";
const ok = [], bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = async (user) => {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const ck = [{ name: "parkgo_cookie_consent", value: "all", url: BASE }];
  if (user) ck.push({ name: "parkgo_session", value: user, url: BASE });
  await c.addCookies(ck); return c;
};
const type = async (p, q) => {
  const i = p.locator("[data-dest-input]").first();
  await i.click(); await i.fill(""); await i.type(q, { delay: 30 });
  await p.waitForTimeout(800);
};

// 1. the reported queries produce visible rows
{
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  for (const q of ["lowfield", "RH11", "hounslow", "santry", "crawley"]) {
    await type(p, q);
    const n = await p.locator("[data-dest-suggestions] li").count();
    const txt = (await p.locator("[data-dest-suggestions]").innerText().catch(() => "")).replace(/\n/g, " / ");
    check(`"${q}" suggests something`, n > 0 && !txt.includes("No matches"), txt.slice(0, 60));
  }
  // 2. empty state instead of silence
  await type(p, "zzzqqq");
  const empty = await p.locator("[data-dest-empty]").count();
  check("a miss says so instead of showing nothing", empty === 1,
    (await p.locator("[data-dest-empty]").innerText().catch(() => "")).slice(0, 50));
  await c.close();
}

// 3. no address ever reaches the DOM
{
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  let leak = null;
  for (const q of ["RH11 0PT", "crawley", "hounslow", "santry", "M22", "lowfield"]) {
    await type(p, q);
    const txt = await p.locator("[data-dest-suggestions]").innerText().catch(() => "");
    if (/charlwood|dovedale|ringway|bath road|hemingford|oakington|dunmow|0PT|5WB|2AB|0EX/i.test(txt)) leak = `${q}: ${txt}`;
  }
  check("no street or full postcode is ever rendered", !leak, leak ?? "");
  await c.close();
}

// 4. pick an area → submit → results actually narrow
{
  const c = await ctx("user_traveller"); const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await type(p, "lowfield");
  await p.locator("[data-dest-suggestions] li button").first().click();
  const val = await p.locator("[data-dest-input]").first().inputValue();
  check("picking fills the box with the bare area name", val === "Lowfield Heath", val);
  await Promise.all([p.waitForURL(/\/app\/search/, { timeout: 20000 }), p.locator("form button[type=submit]").first().click()]);
  await p.waitForSelector("main", { timeout: 15000 });
  const url = p.url();
  check("submits as ?q=, not a widened airport", /[?&]q=Lowfield/i.test(url), url.slice(url.indexOf("?"), 60));
  const body = await p.locator("main").innerText();
  check("the search finds it (no no-match banner)", !/no results|couldn't find|no matches/i.test(body.slice(0, 400)),
    body.split("\n").slice(0, 2).join(" / ").slice(0, 70));
  await c.close();
}

// 5. keyboard
{
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await type(p, "lon");
  await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown");
  const act = await p.locator("[data-dest-input]").first().getAttribute("aria-activedescendant");
  check("arrow keys move an active option", !!act, String(act));
  await p.keyboard.press("Enter");
  const v = await p.locator("[data-dest-input]").first().inputValue();
  check("Enter commits the highlighted row", v.length > 0 && v !== "lon", v);
  await p.keyboard.press("Escape");
  await c.close();
}

// 6. stale response cannot overwrite a newer one
{
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const i = p.locator("[data-dest-input]").first();
  await i.click(); await i.fill(""); await i.type("lon", { delay: 20 });
  await p.waitForTimeout(120);
  await i.fill(""); await i.type("manch", { delay: 20 });
  await p.waitForTimeout(1200);
  const txt = await p.locator("[data-dest-suggestions]").innerText().catch(() => "");
  check("a superseded query's rows never land", !/Gatwick|Stansted|Luton/.test(txt), txt.replace(/\n/g, " / ").slice(0, 60));
  await c.close();
}

// 7. no dropdown on load of a prefilled field
{
  const c = await ctx("user_traveller"); const p = await c.newPage();
  await p.goto(BASE + "/app/search?q=hounslow", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  check("a prefilled field does not open a dropdown on load",
    await p.locator("[data-dest-suggestions]").count() === 0);
  await c.close();
}

await b.close();
console.log([...ok, ...bad].join("\n"));
console.log(bad.length ? `\n${bad.length} FAILED` : `\nAll ${ok.length} checks passed.`);
process.exit(bad.length ? 1 : 0);
