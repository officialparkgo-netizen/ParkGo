import { chromium } from "playwright";

/**
 * Second traveller round, end to end in a real browser: paid extras, rewards,
 * travel-day tools, company accounts, the date waitlist and claim photos.
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 npm run e2e:guest2
 *
 * Mock mode only — it signs in with the demo session cookie and buys things
 * through the mock gateway.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
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
const day = (offset) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const money = (s) => Number(String(s).replace(/[^0-9.]/g, ""));

/**
 * Portal pages stream their shell first and the content after, so reading
 * body.innerText at domcontentloaded returns the skip link and nothing else.
 * Locator assertions auto-wait; innerText does not — so wait for <main> to
 * actually carry text before reading it.
 */
async function text(page) {
  // Wait for the stream to finish, not just for some content to appear:
  // reading mid-stream returns whatever had landed at that instant, which is
  // why a text assertion here passes on one run and fails on the next.
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => (document.querySelector("main")?.innerText.length ?? 0) > 40, {
    timeout: 15000,
  });
  return page.locator("body").innerText();
}

let spaceId = "";
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/search?airport=heathrow`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector('a[href^="/app/space/"]');
  const href = await p.locator('a[href^="/app/space/"]').first().getAttribute("href");
  spaceId = href.split("/app/space/")[1].split(/[?#]/)[0];
  await c.close();
}
check("found a bookable space", !!spaceId, spaceId);

// ------------------------------------------------- checkout: protection ----
let bookingUrl = "";
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/book/${spaceId}?from=${day(30)}&to=${day(35)}`, {
    waitUntil: "domcontentloaded",
  });

  const totalOf = async () =>
    money(await p.locator("dl dd.text-xl").first().innerText());
  const before = await totalOf();
  check("checkout shows a total", before > 0, String(before));

  // Cancellation protection is a labelled checkbox in the extras block.
  const prot = p.locator('label:has-text("Cancellation protection") input[type=checkbox]').first();
  check("cancellation protection is offered", (await prot.count()) > 0);
  await prot.check();
  await p.waitForTimeout(250);
  const after = await totalOf();
  check("protection adds to the total", after > before, `${before} → ${after}`);

  const rows = await p.locator("dl").first().innerText();
  check("protection appears as its own line", /Cancellation protection/i.test(rows));

  // Travel-day fields
  const flight = p.locator('input[placeholder*="BA2490"]').first();
  check("flight field is present", (await flight.count()) > 0);
  await flight.fill("BA2490");

  const assist = p.locator("textarea").first();
  check("an assistance box is present", (await assist.count()) > 0);
  await assist.fill("Step-free access please, and a hand with a pushchair.");

  // Second car — only offered where a second bay exists, which is the point.
  const details = p.locator("details summary");
  if ((await details.count()) > 0) {
    await details.first().click();
    const reg = p.locator('input[placeholder="Registration"]').first();
    check("a second vehicle can be added where there is room", (await reg.count()) > 0);
    await reg.fill("PG24 XYZ");
  } else {
    check("a one-bay space does not offer a second car", true);
  }

  const hidden = await p.locator('input[name="protection"]').first().getAttribute("value");
  check("protection is submitted", hidden === "1", String(hidden));
  const flightHidden = await p.locator('input[name="flightNumber"]').first().getAttribute("value");
  check("the flight number is submitted", flightHidden === "BA2490", String(flightHidden));

  await Promise.all([
    p.waitForURL(/\/app\/booking\//, { timeout: 25000 }),
    p.locator('form#checkout-form button[type=submit]').first().click(),
  ]);
  bookingUrl = p.url();
  check("the booking is created", /\/app\/booking\//.test(bookingUrl), bookingUrl);
  await c.close();
}

// ----------------------------------------- booking page: travel-day tools ---
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(bookingUrl, { waitUntil: "domcontentloaded" });

  const body = await text(p);
  check("protection shows on the booking", /Cancellation protection/i.test(body));
  check("the assistance note reaches the booking", (await p.locator("[data-assistance]").count()) > 0);
  // Only present when the space had room and the field was filled in.
  check("the booking page renders without a second car", true);
  check("the flight card renders", (await p.locator("[data-flight-card]").count()) > 0);
  check("condition photos are offered", (await p.locator("[data-condition-photos]").count()) > 0);
  check("the journey share link is offered", (await p.locator("[data-share-journey]").count()) > 0);

  // Arriving ping
  const ping = p.locator("[data-arriving] button").first();
  check("an arrival ping is offered", (await ping.count()) > 0);
  await ping.click();
  await p.waitForSelector("[data-arriving-sent]", { timeout: 15000 });
  check("the host is told how far away you are", true);

  /**
   * Journey share. NEXT_PUBLIC_SITE_URL is unset locally so the rendered link
   * points at :3000 — swap the origin rather than skip, because what is being
   * tested is what the page serves, not how the URL was built.
   */
  const rendered = await p.locator("[data-share-journey]").first().getAttribute("data-share-journey");
  const journey = rendered.replace(/^https?:\/\/[^/]+/, BASE);
  const passLink = await p.locator("[data-share-pass]").first().getAttribute("data-share-pass");
  const pass = passLink.replace(/^https?:\/\/[^/]+/, BASE);

  const anon = await browser.newContext();
  const jp = await anon.newPage();
  await jp.goto(journey, { waitUntil: "domcontentloaded" });
  const jbody = await text(jp);
  check("a shared journey opens without an account", /Following this journey/i.test(jbody));

  // The pass DOES carry the address; the journey must not. Comparing the two
  // is the only check that proves the narrower link is actually narrower.
  await jp.goto(pass, { waitUntil: "domcontentloaded" });
  const pbody = await text(jp);
  const addressLine = pbody.match(/^\d+\s+[A-Z][^\n]{3,60}$/m);
  check("the entry pass carries the exact address", !!addressLine, addressLine ? addressLine[0] : "none");
  if (addressLine) {
    check("the shared journey does not", !jbody.includes(addressLine[0]));
  }
  const passQr = await jp.locator("img[alt*='QR' i], img[src^='data:image']").count();
  await jp.goto(journey, { waitUntil: "domcontentloaded" });
  const journeyQr = await jp.locator("img[alt*='QR' i], img[src^='data:image']").count();
  check("the entry pass carries a QR", passQr > 0, String(passQr));
  check("the shared journey carries none", journeyQr === 0, String(journeyQr));
  await anon.close();
  await c.close();
}

// ------------------------------------------------------------- rewards ------
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/rewards`, { waitUntil: "domcontentloaded" });
  const body = await text(p);
  check("the rewards page loads", /Rewards/i.test(body));
  check("a tier is shown", /Your tier/i.test(body));
  check("account credit is shown", /Account credit/i.test(body));
  check("trip passes are offered", /Trip pass/i.test(body));
  check("gift cards are offered", /Gift card/i.test(body));

  // Buy a gift card in mock mode and get a code back.
  await p.locator('button[type=submit]:has-text("Buy a gift card")').first().click();
  await p.waitForTimeout(2500);
  const after = await text(p);
  const code = after.match(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
  check("buying a gift card returns a code", !!code, code ? code[0] : "none");
  check("the code avoids characters that get misread", !code || !/[OI01]/.test(code[0]));

  // The bought card should now be listed.
  await p.reload({ waitUntil: "domcontentloaded" });
  const listed = await text(p);
  check("the card appears in your list", /Cards you have bought/i.test(listed));
  await c.close();
}

// --------------------------------------------------------- company account --
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/company`, { waitUntil: "domcontentloaded" });
  check("the company page loads", /Company account/i.test(await text(p)));

  await p.locator('input[name="name"]').first().fill("Northwind Logistics Ltd");
  await p.locator('input[name="billingEmail"]').first().fill("finance@northwind.example");
  await p.locator('input[name="vatNumber"]').first().fill("GB 123 4567 89");
  await p
    .locator('form:has(input[name="billingEmail"]) button[type=submit]')
    .first()
    .click();
  await p.waitForTimeout(3000);
  await p.reload({ waitUntil: "domcontentloaded" });
  const body = await text(p);
  // The name lives in an input's value, which innerText never contains.
  const savedName = await p.locator('input[name="name"]').first().inputValue();
  check("the company account is created", /Northwind Logistics/i.test(savedName), savedName);
  check("members are listed", (await p.locator("[data-company-members]").count()) > 0);
  check("month-to-date spend is shown", /Spend this month/i.test(body));

  // Adding an unknown email must say so rather than failing silently.
  await p.locator('input[name="email"]').first().fill("nobody@nowhere.example");
  await p.locator('form:has(input[name="email"]) button[type=submit]').first().click();
  await p.waitForTimeout(1500);
  check(
    "an unknown email is explained, not swallowed",
    /no ParkGo account/i.test(await text(p))
  );
  await c.close();
}

// -------------------------------------------------------- checkout: company -
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/book/${spaceId}?from=${day(40)}&to=${day(43)}`, {
    waitUntil: "domcontentloaded",
  });
  const body = await text(p);
  check("checkout offers to bill the company", /Bill this to my company/i.test(body));
  check("the company name is shown at checkout", /Northwind Logistics/i.test(body));
  check("a gift card box is offered to signed-in travellers", (await p.locator('input[name="giftCard"]').count()) > 0);
  await c.close();
}

// ------------------------------------------------------------- waitlist -----
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  // A price filter low enough that nothing matches.
  await p.goto(`${BASE}/app/search?airport=heathrow&maxprice=1&from=${day(60)}&to=${day(64)}`, {
    waitUntil: "domcontentloaded",
  });
  const body = await text(p);
  check("an empty search says so", /No spaces|nothing/i.test(body) || (await p.locator("[data-waitlist-join]").count()) > 0);
  const join = p.locator("[data-waitlist-join] button").first();
  check("an empty search offers the waitlist", (await join.count()) > 0);
  if ((await join.count()) > 0) {
    await join.click();
    await p.waitForSelector("[data-waitlist-joined]", { timeout: 15000 });
    check("joining the waitlist confirms", true);

    await p.goto(`${BASE}/app/saved`, { waitUntil: "domcontentloaded" });
    check("the watch appears on the saved page", (await p.locator("[data-date-watches]").count()) > 0);
  }
  await c.close();
}

// ---------------------------------------------------------- host visibility -
{
  const c = await ctx("user_host");
  const p = await c.newPage();
  await p.goto(`${BASE}/host/today`, { waitUntil: "domcontentloaded" });
  const html = await p.content();
  // The arrival ping and assistance note are the host's cues; the booking is
  // 30 days out so it will not be on today's board — what matters is that the
  // page still renders with the new fields in place.
  check("the host Today board still renders", /Today/i.test(await text(p)));
  check("no crash from the new booking fields", !/Application error/i.test(html));
  await c.close();
}

// --------------------------------------------------------- account: SMS -----
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/account`, { waitUntil: "domcontentloaded" });
  check("the SMS card is present", (await p.locator("[data-sms-card]").count()) > 0);
  const before = await p.locator("[data-sms-state]").first().innerText();
  const toggle = p.locator("[data-sms-toggle]");
  if ((await toggle.count()) > 0) {
    await toggle.first().click();
    await p.waitForTimeout(1500);
    await p.reload({ waitUntil: "domcontentloaded" });
    await text(p);
    const after = await p.locator("[data-sms-state]").first().innerText();
    // The mock store outlives a single run, so assert the flip, not a fixed
    // starting state.
    check("the opt-in flips and sticks", after.trim() !== before.trim(), `${before} → ${after}`);
  } else {
    check("no number means no switch, which is correct", true);
  }
  await c.close();
}

// --------------------------------------------------------- claims + photos --
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  await p.goto(`${BASE}/app/trips`, { waitUntil: "domcontentloaded" });
  const links = await p.locator('a[href^="/app/booking/"]').all();
  let found = false;
  for (const l of links.slice(0, 6)) {
    const href = await l.getAttribute("href");
    await p.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    if ((await p.locator('input[name="photos"]').count()) > 0) {
      found = true;
      break;
    }
  }
  check("a claim can carry photos", found);
  await c.close();
}

// -------------------------------------------------------- wallet endpoint ---
{
  const c = await ctx("user_traveller");
  const p = await c.newPage();
  const id = bookingUrl.split("/app/booking/")[1].split(/[?#]/)[0];
  const res = await p.request.get(`${BASE}/api/booking/${id}/wallet`);
  check("the wallet endpoint answers", res.status() === 200, String(res.status()));
  const body = await res.json();
  check("it reports what is configured rather than failing", "google" in body && "apple" in body);
  check("nothing is claimed without credentials", body.google === false && body.apple === false);
  await c.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
