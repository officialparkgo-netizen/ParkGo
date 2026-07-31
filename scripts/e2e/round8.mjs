import { chromium } from "playwright";

/**
 * Round 8, end to end:
 *
 * - review photos render on the public space page and in moderation
 * - GDPR self-delete: typed confirmation enforced, blocked while a booking
 *   is live (asserted without destroying the shared demo account)
 * - yearly + UK-tax-year earnings statements, with the CSV twin
 * - the VAT invoice: business details on the receipt, VAT broken out once
 *   the platform VAT number is set
 * - campaigns: six segments with counts, instant send, schedule, cancel,
 *   and the digest sweep delivering a due one
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 node scripts/e2e/round8.mjs
 *
 * Mock mode only — it signs in with the demo session cookies.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const RUN = String(Date.now()).slice(-6);
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
async function ctx(userId) {
  const c = await browser.newContext();
  const cookies = [{ name: "parkgo_cookie_consent", value: "all", url: BASE }];
  if (userId) cookies.push({ name: "parkgo_session", value: userId, url: BASE });
  await c.addCookies(cookies);
  return c;
}
async function settled(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => (document.querySelector("main")?.innerText.length ?? 0) > 40, {
    timeout: 15000,
  });
  return page.locator("body").innerText();
}

// ------------------------------------------------------- review photos ----
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/space/space_lhr_2`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const photos = await p.locator("[data-review-photos] img").count();
  check("review photos render on the space page", photos >= 1, String(photos));
  await c.close();

  const a = await ctx("user_admin");
  const ap = await a.newPage();
  await ap.goto(`${BASE}/admin/reviews`, { waitUntil: "domcontentloaded" });
  await settled(ap);
  check(
    "moderation sees the photos too",
    (await ap.locator('img[src*="demo-review-bay"]').count()) >= 1
  );
  await a.close();
}

// ---------------------------------------------------- GDPR self-delete ----
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/account`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check("the delete-account section renders", (await p.locator("[data-delete-account]").count()) === 1);

  // Wrong confirmation text: refused, nothing deleted.
  await p.fill("#delete-confirm", "nope");
  await p.locator("[data-delete-submit]").click();
  await p.waitForURL("**privacy=confirm**", { timeout: 15000 });
  await p.waitForSelector("[data-delete-confirm-error]");
  check("a wrong confirmation is refused", true);

  // Right text, but the demo traveller has an upcoming booking: blocked.
  await p.fill("#delete-confirm", "DELETE");
  await p.locator("[data-delete-submit]").click();
  await p.waitForURL("**privacy=blocked**", { timeout: 15000 });
  await p.waitForSelector("[data-delete-blocked]");
  check("a live booking blocks deletion", true);

  // And the account still works.
  await p.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle");
  check("the account survives the blocked attempt", p.url().includes("/app"), p.url());
  await c.close();
}

// ------------------------------------------------- earnings statements ----
{
  const year = new Date().getUTCFullYear();
  const c = await ctx("user_host");
  const p = await c.newPage();

  // The statement is a print page without the portal shell — wait on its own
  // markers, not on <main>.
  await p.goto(`${BASE}/host/statement`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-statement-periods]", { timeout: 15000 });
  check("the period rail renders", (await p.locator("[data-statement-periods] a").count()) >= 5);

  await p.goto(`${BASE}/host/statement?year=${year}&basis=tax`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-statement-month]", { timeout: 15000 });
  const body = await p.locator("body").innerText();
  check("the tax-year statement opens", /UK tax year/i.test(body));
  check("it shows a total", (await p.locator("[data-statement-total]").count()) >= 1);

  const csv = await p.request.get(`${BASE}/host/statement.csv?year=${year}&basis=tax`);
  const csvBody = await csv.text();
  check("the CSV twin serves", csv.status() === 200, String(csv.status()));
  check("the CSV has the header and totals", csvBody.startsWith("Booking,Space") && csvBody.includes("TOTAL"));

  await p.goto(`${BASE}/host/payouts`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check(
    "payouts links the tax-year statements",
    (await p.locator("[data-taxyear-statement]").count()) >= 1
  );
  await c.close();
}

// ------------------------------------------------------- VAT invoice ----
{
  // Start from a clean slate: clear any platform VAT number a previous run
  // left behind, so "before registration" is actually before.
  {
    const a0 = await ctx("user_admin");
    const p0 = await a0.newPage();
    await p0.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
    await settled(p0);
    await p0.fill("#st-vat", "");
    await p0.locator('button[type="submit"]:has-text("Save")').first().click();
    await p0.waitForLoadState("networkidle");
    await a0.close();
  }

  // The traveller saves company details…
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/account`, { waitUntil: "domcontentloaded" });
  await settled(p);
  await p.fill("#company", `Acme Logistics ${RUN}`);
  await p.fill("#vatNumber", "GB123456789");
  await p.locator('[data-business-card] button[type="submit"]').click();
  await p.waitForSelector("[data-saved-banner]", { timeout: 15000 });

  // …which land on the receipt (still a plain receipt: no platform VAT yet).
  await p.goto(`${BASE}/app/booking/bk_past/receipt`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-invoice-business]", { timeout: 15000 });
  const before = await p.locator("body").innerText();
  check("the receipt shows the company details", before.includes(`Acme Logistics ${RUN}`));
  check("no VAT line before the platform is registered", (await p.locator("[data-vat-line]").count()) === 0);

  // The admin sets the platform VAT number…
  const a = await ctx("user_admin");
  const ap = await a.newPage();
  await ap.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
  await settled(ap);
  await ap.fill("#st-vat", "GB999 9999 73");
  await ap.locator('button[type="submit"]:has-text("Save")').first().click();
  await ap.waitForLoadState("networkidle");
  await a.close();

  // …and the same URL is now a numbered VAT invoice with the VAT broken out.
  await p.goto(`${BASE}/app/booking/bk_past/receipt`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-vat-line]", { timeout: 15000 });
  const after = await p.locator("body").innerText();
  check("the receipt becomes a VAT invoice", /VAT invoice/i.test(after));
  check("it is numbered", /INV-PG-/.test(after));
  check("the platform VAT number is on it", after.includes("GB999 9999 73"));
  await c.close();
}

// ---------------------------------------------------------- campaigns ----
{
  const a = await ctx("user_admin");
  const p = await a.newPage();
  await p.goto(`${BASE}/admin/broadcast`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const segs = await p.locator("#bc-aud option").count();
  check("six segments with counts", segs === 6, String(segs));

  // Instant send (mock has no mailer → preview banner, campaign recorded).
  await p.selectOption("#bc-aud", "hosts");
  await p.fill("#bc-subject", `Host news ${RUN}`);
  await p.fill("#bc-message", "Winter rates are live.");
  await p.locator('form button[type="submit"]:has-text("Send")').click();
  await p.waitForURL("**sent=**", { timeout: 20000 });
  await settled(p);
  check("an instant campaign sends and records", (await p.locator(`[data-campaign]:has-text("Host news ${RUN}")`).count()) === 1);

  // Scheduled far out → cancel.
  await p.fill("#bc-subject", `Spring launch ${RUN}`);
  await p.fill("#bc-message", "Coming soon.");
  await p.fill("#bc-sendat", "2030-05-01T09:00");
  await p.locator('form button[type="submit"]:has-text("Send")').click();
  await p.waitForSelector("[data-scheduled-banner]", { timeout: 20000 });
  const row = p.locator(`[data-campaign]:has-text("Spring launch ${RUN}")`);
  check("a scheduled campaign is listed", (await row.locator('[data-campaign-status="scheduled"]').count()) === 1);
  await row.locator("[data-campaign-cancel]").click();
  await p.waitForSelector("[data-cancelled-banner]", { timeout: 20000 });
  check(
    "cancelling flips its status",
    (await p
      .locator(`[data-campaign]:has-text("Spring launch ${RUN}") [data-campaign-status="cancelled"]`)
      .count()) === 1
  );

  // Scheduled one minute out → the digest sweep delivers it. datetime-local
  // has minute precision, so +61s rounds to the NEXT minute and stays in the
  // future; the wait rides it out.
  const soon = new Date(Date.now() + 61_000);
  const local = new Date(soon.getTime() - soon.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  await p.fill("#bc-subject", `Sweep test ${RUN}`);
  await p.fill("#bc-message", "Due imminently.");
  await p.fill("#bc-sendat", local);
  await p.locator('form button[type="submit"]:has-text("Send")').click();
  await p.waitForSelector("[data-scheduled-banner]", { timeout: 20000 });

  // Not due yet: an early sweep must leave it scheduled.
  await p.request.get(`${BASE}/api/admin/digest`);
  await p.goto(`${BASE}/admin/broadcast`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check(
    "an early sweep leaves it scheduled",
    (await p
      .locator(`[data-campaign]:has-text("Sweep test ${RUN}") [data-campaign-status="scheduled"]`)
      .count()) === 1
  );
  await new Promise((r) => setTimeout(r, 65_000));
  const digest = await p.request.get(`${BASE}/api/admin/digest`);
  check("the digest sweep runs", digest.status() === 200, String(digest.status()));
  await p.goto(`${BASE}/admin/broadcast`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check(
    "the sweep delivers the due campaign",
    (await p
      .locator(`[data-campaign]:has-text("Sweep test ${RUN}") [data-campaign-status="sent"]`)
      .count()) === 1
  );
  await a.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
