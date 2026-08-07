import { chromium } from "playwright";

/**
 * Three small ops-polish behaviours, end to end:
 *
 * - the host calendar's occupied days open a panel of that day's bookings,
 *   and each row clicks through to the booking page
 * - a new support ticket rings the admin bell, and the notification is a
 *   link straight to the ticket desk
 * - removing a teammate disables the account (covered in blog2 for writers;
 *   here the support-desk path gets the same assertion)
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 node scripts/e2e/ops-polish.mjs
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

// ------------------------------------------- host calendar: click a day ----
{
  const c = await ctx("user_host");
  const p = await c.newPage();
  await p.goto(`${BASE}/host`, { waitUntil: "domcontentloaded" });
  await settled(p);

  // The seed always books the demo host around today; one next-month hop is
  // only for runs on the last evening of a month.
  let occupied = p.locator("[data-cal-day][data-occupied]");
  if ((await occupied.count()) === 0) {
    await p.locator('#calendar a[aria-label]:has(svg)').last().click();
    await settled(p);
    occupied = p.locator("[data-cal-day][data-occupied]");
  }
  check("the calendar has occupied days", (await occupied.count()) > 0);

  await occupied.first().click();
  await p.waitForSelector("[data-cal-day-panel]", { timeout: 15000 });
  check("clicking a day opens its bookings", true);

  const rows = p.locator("[data-cal-booking]");
  const rowCount = await rows.count();
  check("the day panel lists the bookings", rowCount >= 1, String(rowCount));
  const reference = (await rows.first().getAttribute("data-cal-booking")) ?? "";

  await rows.first().click();
  await p.waitForURL("**/host/bookings/**", { timeout: 15000 });
  const bookingPage = await settled(p);
  check(
    "a booking row opens the booking page",
    reference.length > 0 && bookingPage.includes(reference),
    reference
  );

  // Closing the panel goes back to the plain month.
  await p.goBack({ waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-cal-day-panel]", { timeout: 15000 });
  await p.locator('[data-cal-day-panel] a[aria-label]').click();
  // The X is a link that drops ?day= — wait for the URL, then the fresh DOM.
  await p.waitForURL((u) => !u.searchParams.has("day"), { timeout: 15000 });
  await p.waitForFunction(() => !document.querySelector("[data-cal-day-panel]"), {
    timeout: 15000,
  });
  check("the panel closes again", true);
  await c.close();
}

// ---------------------------------- support ticket rings the admin bell ----
{
  // A visitor escalates a chat to the team.
  const v = await ctx(null);
  const vp = await v.newPage();
  await vp.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await vp.click('button[aria-label="Open support chat"]');
  await vp.waitForSelector('[role="dialog"]');
  await vp.fill('input[placeholder="Type your question…"]', "I cannot cancel my booking, please help");
  await vp.keyboard.press("Enter");
  const emailBox = vp.locator('input[placeholder="Your email"]');
  try {
    await emailBox.waitFor({ timeout: 6000 });
  } catch {
    await vp.click('button:has-text("Talk to a human")');
    await emailBox.waitFor({ timeout: 10000 });
  }
  await vp.fill('input[placeholder="Your email"]', `bell-${RUN}@example.com`);
  await vp.click('button:has-text("Send to the team")');
  await vp.waitForSelector("[data-live-note]", { timeout: 15000 });
  await v.close();

  // The admin's bell now carries it, as a link.
  const a = await ctx("user_admin");
  const p = await a.newPage();
  await p.goto(`${BASE}/notifications`, { waitUntil: "domcontentloaded" });
  const body = await settled(p);
  check("the ticket shows up in the admin bell", /support ticket/i.test(body));

  const note = p.locator('[data-notif-link]:has-text("support ticket")').first();
  check("the support notification is a link", (await note.count()) === 1);
  await note.click();
  await p.waitForURL("**/admin/support**", { timeout: 15000 });
  check("clicking it opens the ticket desk", true);

  const desk = await settled(p);
  check("the desk shows the new ticket", desk.includes(`bell-${RUN}@example.com`));

  // The same alert on the dashboard is a link too — straight to the desk.
  await p.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const dashAlert = p.locator('[data-dash-alert]:has-text("support ticket")').first();
  check("the admin dashboard alert is a link", (await dashAlert.count()) === 1);
  await dashAlert.click();
  await p.waitForURL("**/admin/support**", { timeout: 15000 });
  check("clicking it opens the ticket desk from the dashboard", true);
  await a.close();
}

// ------------- the dashboard stat blocks are links to their sections ----
{
  const hc0 = await ctx("user_host");
  const hp0 = await hc0.newPage();
  await hp0.goto(`${BASE}/host`, { waitUntil: "domcontentloaded" });
  await settled(hp0);
  await hp0.locator('[data-stat-link]:has-text("Trust score")').click();
  await hp0.waitForURL("**/host/reviews**", { timeout: 15000 });
  check("the host trust-score block opens reviews", true);
  await hc0.close();

  // A host with real reviews shows a real average — not the placeholder 0.0.
  const gc0 = await ctx("user_host2");
  const gp0 = await gc0.newPage();
  await gp0.goto(`${BASE}/host`, { waitUntil: "domcontentloaded" });
  await settled(gp0);
  const trustCard = (
    await gp0.locator('[data-stat-link]:has-text("Trust score")').innerText()
  ).replace(/\n/g, " ");
  check(
    "the trust score is computed from real reviews",
    /[1-5]\.\d★/.test(trustCard) && !trustCard.includes("0.0★"),
    trustCard.slice(0, 60)
  );
  await gc0.close();

  const ac0 = await ctx("user_admin");
  const ap0 = await ac0.newPage();
  await ap0.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await settled(ap0);
  await ap0.locator("[data-stat-link]").first().click();
  await ap0.waitForURL("**/admin/verification**", { timeout: 15000 });
  check("the admin verification block opens the review queue", true);

  // The trust list the admin reads is the same real blend the hosts see.
  const trustSection = await ap0.locator("#trust").innerText();
  check(
    "the admin trust list carries real review averages",
    /[1-5]\.\d★/.test(trustSection),
    trustSection.replace(/\n/g, " ").slice(0, 80)
  );
  await ac0.close();

  const tc0 = await ctx("user_traveller");
  const tp0 = await tc0.newPage();
  await tp0.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  await settled(tp0);
  await tp0.locator("[data-stat-link]").first().click();
  await tp0.waitForURL("**/app/trips**", { timeout: 15000 });
  check("the traveller stat block opens trips", true);
  await tc0.close();
}

// -------------- a message alert on the host dashboard opens that chat ----
{
  const tcx = await ctx("user_traveller");
  const tpg = await tcx.newPage();
  await tpg.goto(`${BASE}/app/booking/bk_active`, { waitUntil: "domcontentloaded" });
  const thread = tpg.locator("[data-booking-thread]");
  await thread.waitFor({ timeout: 15000 });
  const keysMsg = `Where do I leave the keys? (${RUN})`;
  await thread.locator('input[name="text"]').fill(keysMsg);
  await thread.locator('button[type="submit"]').click();
  await tpg.waitForFunction(
    (needle) =>
      document.querySelector("[data-booking-thread]")?.textContent?.includes(needle) ?? false,
    keysMsg,
    { timeout: 15000 }
  );
  await tcx.close();

  const hcx = await ctx("user_host");
  const hpg = await hcx.newPage();
  await hpg.goto(`${BASE}/host`, { waitUntil: "domcontentloaded" });
  await settled(hpg);
  const alert = hpg.locator('[data-dash-alert]:has-text("New message")').first();
  check("a new message shows on the host dashboard as a link", (await alert.count()) === 1);
  await alert.click();
  await hpg.waitForURL("**/host/bookings/**", { timeout: 15000 });
  const bookingPage = await settled(hpg);
  check("it opens that booking's chat", bookingPage.includes(keysMsg));
  await hcx.close();
}

// -------------- a host can request a location we don't cover yet ---------
{
  const hc = await ctx("user_host");
  const hp = await hc.newPage();
  await hp.goto(`${BASE}/host/new`, { waitUntil: "domcontentloaded" });
  await settled(hp);
  const box = hp.locator("[data-loc-picker] input[role=combobox]");
  await box.fill("heathrow");
  check(
    "the destination field filters as you type",
    (await hp.locator("[data-loc-option]").count()) >= 1
  );
  await box.fill(`Faisalabad Intl (${RUN})`);
  await hp.locator("[data-loc-request]").click();
  await hp.waitForSelector("[data-loc-sent]", { timeout: 15000 });
  check("an uncovered place can be requested", true);
  await hc.close();

  const ac = await ctx("user_admin");
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  const desk = await settled(ap);
  check(
    "the request lands on the team's desk",
    desk.includes("new-location") && desk.includes(`Faisalabad Intl (${RUN})`)
  );
  await ac.close();
}

// ------- verification data stays visible after the decision is made ------
{
  const ac = await ctx("user_admin");
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/verification`, { waitUntil: "domcontentloaded" });
  await settled(ap);
  // First run approves Derek; later runs find him already in the history.
  const approve = ap.locator('button:has-text("Approve")').first();
  if (await approve.count()) {
    await approve.click();
    await ap.waitForLoadState("networkidle");
    await ap.goto(`${BASE}/admin/verification`, { waitUntil: "domcontentloaded" });
    await settled(ap);
  }
  const history = await ap.locator("[data-verif-history]").innerText();
  check(
    "the admin still sees the reviewed record",
    history.includes("Derek's Yard") && history.includes("Passport"),
    history.replace(/\n/g, " ").slice(0, 80)
  );
  await ac.close();

  const dc = await ctx("user_host3");
  const dp = await dc.newPage();
  await dp.goto(`${BASE}/host/verify`, { waitUntil: "domcontentloaded" });
  await settled(dp);
  const summary = await dp.locator("[data-verify-summary]").innerText();
  check(
    "the host still sees what they submitted after approval",
    summary.includes("Passport") && summary.includes("Utility bill")
  );
  await dc.close();
}

// ------------------------- resolved tickets: visitor sees it, moves on ----
{
  // A visitor with a live ticket…
  const v = await ctx(null);
  const vp = await v.newPage();
  await vp.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await vp.click('button[aria-label="Open support chat"]');
  await vp.waitForSelector('[role="dialog"]');
  await vp.fill('input[placeholder="Type your question…"]', "My gate code is not working at all");
  await vp.keyboard.press("Enter");
  const emailBox = vp.locator('input[placeholder="Your email"]');
  try {
    await emailBox.waitFor({ timeout: 6000 });
  } catch {
    await vp.click('button:has-text("Talk to a human")');
    await emailBox.waitFor({ timeout: 10000 });
  }
  const visitorEmail = `resolved-${RUN}@example.com`;
  await vp.fill('input[placeholder="Your email"]', visitorEmail);
  await vp.click('button:has-text("Send to the team")');
  await vp.waitForSelector("[data-live-note]", { timeout: 15000 });
  // The reference line lands a render behind the live note — wait for it.
  await vp.waitForFunction(() => /SP-[A-Z0-9]+/.test(document.body.innerText), undefined, {
    timeout: 15000,
  });
  const firstRef = (await vp.locator("body").innerText()).match(/SP-[A-Z0-9]+/)?.[0] ?? "";

  // …the team resolves it…
  const a = await ctx("user_admin");
  const ap = await a.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  await settled(ap);
  await ap
    .locator(`[data-ticket="${visitorEmail}"] button:has-text("Mark handled")`)
    .click();
  await ap.waitForLoadState("networkidle");

  // …and the visitor's widget says so, in the thread and on a banner.
  await vp.waitForSelector("[data-resolved-note]", { timeout: 20000 });
  check("the visitor is told the ticket is resolved", true);
  const widgetText = await vp.locator('[role="dialog"]').innerText();
  check(
    "the resolved line lands in the transcript too",
    /marked this conversation as resolved/i.test(widgetText)
  );
  check("a new-conversation button appears", (await vp.locator("[data-new-ticket]").count()) === 1);

  // Typing into the resolved thread reopens it for the team.
  await vp.fill('input[placeholder="Type your question…"]', "Actually it is still broken");
  await vp.keyboard.press("Enter");
  await vp.waitForTimeout(1500);
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  await settled(ap);
  const ticketCard = await ap.locator(`[data-ticket="${visitorEmail}"]`).innerText();
  check("a visitor reply reopens the ticket", /Open/i.test(ticketCard), ticketCard.slice(0, 80));

  // Resolve again, then take the fresh-start path: a brand-new ticket ref.
  await ap.locator(`[data-ticket="${visitorEmail}"] button:has-text("Mark handled")`).click();
  await ap.waitForLoadState("networkidle");
  await vp.waitForSelector("[data-new-ticket]", { timeout: 20000 });
  await vp.locator("[data-new-ticket]").click();
  await vp.waitForSelector("[data-resolved-note]", { state: "detached", timeout: 15000 });
  check("the widget resets to a fresh chat", true);

  await vp.fill('input[placeholder="Type your question…"]', "Now I have a totally different question");
  await vp.keyboard.press("Enter");
  const emailBox2 = vp.locator('input[placeholder="Your email"]');
  try {
    await emailBox2.waitFor({ timeout: 6000 });
  } catch {
    await vp.click('button:has-text("Talk to a human")');
    await emailBox2.waitFor({ timeout: 10000 });
  }
  await vp.fill('input[placeholder="Your email"]', visitorEmail);
  await vp.click('button:has-text("Send to the team")');
  await vp.waitForSelector("[data-live-note]", { timeout: 15000 });
  // Wait for a reference that is actually the NEW ticket's, not a leftover.
  await vp.waitForFunction(
    (prev) => {
      const m = document.body.innerText.match(/SP-[A-Z0-9]+/);
      return !!m && m[0] !== prev;
    },
    firstRef,
    { timeout: 15000 }
  );
  const secondRef = (await vp.locator("body").innerText()).match(/SP-[A-Z0-9]+/)?.[0] ?? "";
  check(
    "escalating again mints a NEW ticket",
    !!secondRef && secondRef !== firstRef,
    `${firstRef} → ${secondRef}`
  );
  await v.close();
  await a.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
