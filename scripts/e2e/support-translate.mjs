import { chromium } from "playwright";

/**
 * Support translation, end to end: a visitor writes in Urdu, an agent reads
 * English, and the original is still there to check.
 *
 *   npm run build && PARKGO_DEMO_TRANSLATE=1 npm start &
 *   BASE=http://localhost:3000 npm run e2e:translate
 *
 * Needs `PARKGO_DEMO_TRANSLATE=1`, which stands in for a translation provider
 * in mock mode. What is tested is the plumbing and the rendering — that a
 * translation reaches the agent, that the original survives beside it, and that
 * the visitor's own widget is not cluttered with it. The quality of a real
 * translation is DeepL's problem, not this suite's.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const RUN = String(Date.now()).slice(-6);
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

const URDU = "میری گاڑی گیٹ کے پیچھے پھنس گئی ہے، مجھے مدد چاہیے";
const GERMAN = "Ich kann meine Buchung nicht stornieren, bitte helfen Sie mir";
const DEMO = "no translation provider configured";

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
async function ctx() {
  const c = await browser.newContext();
  await c.addCookies([{ name: "parkgo_cookie_consent", value: "all", url: BASE }]);
  return c;
}
async function adminCtx() {
  const c = await browser.newContext();
  await c.addCookies([
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_session", value: "user_admin", url: BASE },
  ]);
  return c;
}
async function mainText(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => (document.querySelector("main")?.innerText.length ?? 0) > 40, {
    timeout: 15000,
  });
  return page.locator("body").innerText();
}

/**
 * Open the widget, say something, and escalate it to a human.
 *
 * A message the bot recognises lands on "did that help?" rather than straight
 * on the escalation form, so the human button is clicked when the email field
 * does not appear on its own. Both routes reach the same ticket.
 */
async function raiseTicket(page, message, email) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.click('button[aria-label="Open support chat"]');
  await page.waitForSelector('[role="dialog"]');
  await page.fill('input[placeholder="Type your question…"]', message);
  await page.keyboard.press("Enter");

  const emailBox = page.locator('input[placeholder="Your email"]');
  try {
    await emailBox.waitFor({ timeout: 6000 });
  } catch {
    await page.click('button:has-text("Talk to a human")');
    await emailBox.waitFor({ timeout: 10000 });
  }
  await page.fill('input[placeholder="Your email"]', email);
  await page.click('button:has-text("Send to the team")');
  await page.waitForSelector("[data-live-note]", { timeout: 15000 });
}

// ------------------------------------------------- a visitor writes Urdu ----
const visitor = await ctx();
{
  const p = await visitor.newPage();
  await raiseTicket(p, URDU, `urdu.${RUN}@example.com`);
  check("a non-Latin message escalates to a ticket", true);
}

// --------------------------------------- the agent sees English + original --
{
  const c = await adminCtx();
  const p = await c.newPage();
  await p.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  const body = await mainText(p);

  check("the support console loads", /Support/i.test(body));
  check("the Urdu ticket reached the queue", body.includes(URDU) || body.includes(DEMO));
  check("the agent is shown an English rendering", body.includes(DEMO));
  // The whole point: the original must still be readable beside it, because
  // machine translation drops negations.
  check("the original text survives next to it", body.includes(URDU));
  check("the ticket says it has been translated", /Translated/i.test(body));
  check("the language badge still shows", /اردو/.test(body));
  await c.close();
}

// ------------------------------- the visitor is not shown their own English -
{
  const p = await visitor.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p.click('button[aria-label="Open support chat"]');
  await p.waitForSelector('[role="dialog"]');
  await p.waitForTimeout(2500);
  const body = await p.locator('[role="dialog"]').innerText();
  check("the visitor still sees what they wrote", body.includes(URDU));
  check("and is not shown a worse copy of it", !body.includes(DEMO));
  await visitor.close();
}

// ------------------------------------------------- a Latin-script language --
{
  const c = await ctx();
  const p = await c.newPage();
  await raiseTicket(p, GERMAN, `german.${RUN}@example.com`);
  check("a German message escalates too", true);
  await c.close();

  const ac = await adminCtx();
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  const body = await mainText(ap);
  check("the German ticket is translated as well", body.includes(GERMAN) && body.includes(DEMO));
  check("its language badge reads Deutsch", /Deutsch/.test(body));
  await ac.close();
}

// -------------------------------- an English ticket is left entirely alone --
{
  const c = await ctx();
  const p = await c.newPage();
  await raiseTicket(p, "I cannot cancel my booking, please help", `english.${RUN}@example.com`);
  await c.close();

  const ac = await adminCtx();
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  const body = await mainText(ap);
  const line = body.split("\n").find((l) => l.includes("I cannot cancel my booking")) ?? "";
  check("an English ticket arrives untouched", !!line && !line.includes(DEMO), line.slice(0, 60));
  await ac.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
