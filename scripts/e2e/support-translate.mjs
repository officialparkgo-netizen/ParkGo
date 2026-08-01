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
 * translation is the provider's problem, not this suite's.
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
const REPLY = "We have cancelled your booking and refunded the full amount.";
const REPLY_NOTE = "Replies are translated";

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
  await p.close();
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

// ---------------------- the reply goes back in the visitor's language -------
{
  // Reopen the Urdu visitor's widget alongside the agent, so the reply can be
  // watched arriving rather than assumed.
  const ac = await adminCtx();
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  await mainText(ap);

  const consoleBody = await ap.locator("body").innerText();
  check("the agent is told their reply will be translated", consoleBody.includes(REPLY_NOTE));

  // The Urdu ticket is the newest open one, so its thread is the first.
  const thread = ap.locator("[data-admin-thread]").first();
  const box = thread.locator('input[name="message"]');
  await box.waitFor({ timeout: 15000 });
  await box.fill(REPLY);
  await thread.locator('form:has(input[name="message"]) button[type=submit]').first().click();
  await ap.waitForTimeout(3000);

  const agentBody = await thread.innerText();
  check("the agent still reads their own reply in English", agentBody.includes(REPLY));
  check("and can see it was sent translated", agentBody.includes(DEMO));
  await ac.close();

  // The point of the whole direction: it has to arrive.
  const vp = await visitor.newPage();
  await vp.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await vp.click('button[aria-label="Open support chat"]');
  await vp.waitForSelector('[role="dialog"]');
  await vp.waitForFunction(
    (needle) => document.querySelector('[role="dialog"]')?.textContent?.includes(needle) ?? false,
    REPLY,
    { timeout: 20000 }
  );
  const visitorBody = await vp.locator('[role="dialog"]').innerText();
  check("the reply reaches the visitor", visitorBody.includes(REPLY));
  // Translated for them, with the English the team wrote kept underneath —
  // a refund promise is not something to hand over in one language only.
  check("rendered for their language", visitorBody.includes(DEMO));
  await visitor.close();
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

// ------------- any language from any account: the text decides, not the
// ------------- saved setting. An English-set account writing Arabic still
// ------------- gets carried across — thread and support ticket alike.
const ARABIC_MSG = "سيارتي الكهربائية لا تشحن في الموقف";
{
  const tc = await browser.newContext();
  await tc.addCookies([
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_session", value: "user_traveller", url: BASE },
  ]);

  // The booking thread: account says English, the message says Arabic.
  const tp = await tc.newPage();
  await tp.goto(`${BASE}/app/booking/bk_active`, { waitUntil: "domcontentloaded" });
  const thread = tp.locator("[data-booking-thread]");
  await thread.waitFor({ timeout: 15000 });
  await thread.locator('input[name="text"]').fill(ARABIC_MSG);
  await thread.locator('button[type="submit"]').click();
  await tp.waitForFunction(
    (needle) =>
      document.querySelector("[data-booking-thread]")?.textContent?.includes(needle) ?? false,
    ARABIC_MSG,
    { timeout: 15000 }
  );
  const guestView = await thread.innerText();
  check(
    "an English-set guest can still write Arabic in the thread",
    guestView.includes(ARABIC_MSG) && guestView.includes(DEMO)
  );

  // A Latin-script language with no script to give it away: "hola" between
  // two English-set accounts still gets probed and carried across.
  await thread.locator('input[name="text"]').fill("hola amigo");
  await thread.locator('button[type="submit"]').click();
  await tp.waitForFunction(
    () =>
      document
        .querySelector("[data-booking-thread]")
        ?.textContent?.includes("configured] hola amigo") ?? false,
    undefined,
    { timeout: 15000 }
  );
  check("Spanish from an English account is probed and rendered too", true);

  const hc2 = await browser.newContext();
  await hc2.addCookies([
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_session", value: "user_host", url: BASE },
  ]);
  const hp2 = await hc2.newPage();
  await hp2.goto(`${BASE}/host/bookings/bk_active`, { waitUntil: "domcontentloaded" });
  const hostThread2 = hp2.locator("[data-booking-thread]");
  await hostThread2.waitFor({ timeout: 15000 });
  const hostView2 = await hostThread2.innerText();
  check(
    "the host still gets a rendering — the account setting didn't matter",
    hostView2.includes(DEMO) && hostView2.includes(ARABIC_MSG)
  );
  await hc2.close();

  // The support widget, signed in: no email step, same detection.
  const sp = await tc.newPage();
  await sp.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await sp.click('button[aria-label="Open support chat"]');
  await sp.waitForSelector('[role="dialog"]');
  await sp.fill('input[placeholder="Type your question…"]', ARABIC_MSG);
  await sp.keyboard.press("Enter");
  try {
    await sp.waitForSelector("[data-live-note]", { timeout: 9000 });
  } catch {
    await sp.click('button:has-text("Talk to a human")');
    await sp.waitForSelector("[data-live-note]", { timeout: 15000 });
  }
  check("a signed-in Arabic chat escalates without an email step", true);
  await tc.close();

  const ac = await adminCtx();
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/support`, { waitUntil: "domcontentloaded" });
  const body = await mainText(ap);
  const line = body.split("\n").find((l) => l.includes(ARABIC_MSG)) ?? "";
  check(
    "the agent gets English for it despite the English account setting",
    line.includes(DEMO),
    line.slice(0, 60)
  );
  check("and the ticket is badged العربية for the reply direction", body.includes("العربية"));
  await ac.close();
}

// ----------------- the guest ↔ host booking thread gets the same treatment --
const GUEST_MSG = "میں کل صبح چھ بجے پہنچوں گا، گیٹ کوڈ بتا دیں";
const HOST_REPLY = "The gate code is 4321, see you tomorrow morning.";
{
  // The guest chooses اردو in the switcher — that choice is what tells the
  // thread which language each side reads.
  const tc = await browser.newContext();
  await tc.addCookies([
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_session", value: "user_traveller", url: BASE },
  ]);
  const tp = await tc.newPage();
  await tp.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  await tp.locator('button[aria-label^="Language:"]').first().click();
  await tp.locator('[role="option"]:has-text("اردو")').first().click();
  await tp.waitForFunction(() => document.documentElement.lang === "ur", { timeout: 15000 });
  check("the guest switches the site to Urdu", true);

  // Their message goes out in Urdu…
  await tp.goto(`${BASE}/app/booking/bk_active`, { waitUntil: "domcontentloaded" });
  const thread = tp.locator("[data-booking-thread]");
  await thread.waitFor({ timeout: 15000 });
  await thread.locator('input[name="text"]').fill(GUEST_MSG);
  await thread.locator('button[type="submit"]').click();
  await tp.waitForFunction(
    (needle) =>
      document.querySelector("[data-booking-thread]")?.textContent?.includes(needle) ?? false,
    GUEST_MSG,
    { timeout: 15000 }
  );
  const guestView = await thread.innerText();
  check("the guest sends in their own language", guestView.includes(GUEST_MSG));
  check(
    "and can see what the host will be shown",
    guestView.includes(DEMO),
    guestView.includes(DEMO) ? "" : guestView.slice(-120)
  );

  // …and the host reads it in theirs, original kept underneath.
  const hc = await browser.newContext();
  await hc.addCookies([
    { name: "parkgo_cookie_consent", value: "all", url: BASE },
    { name: "parkgo_session", value: "user_host", url: BASE },
  ]);
  const hp = await hc.newPage();
  await hp.goto(`${BASE}/host/bookings/bk_active`, { waitUntil: "domcontentloaded" });
  const hostThread = hp.locator("[data-booking-thread]");
  await hostThread.waitFor({ timeout: 15000 });
  const hostView = await hostThread.innerText();
  check("the host is shown a rendering they can read", hostView.includes(DEMO));
  check("the guest's original survives beside it", hostView.includes(GUEST_MSG));

  // The reply crosses back the other way.
  await hostThread.locator('input[name="text"]').fill(HOST_REPLY);
  await hostThread.locator('button[type="submit"]').click();
  await hp.waitForFunction(
    (needle) =>
      document.querySelector("[data-booking-thread]")?.textContent?.includes(needle) ?? false,
    HOST_REPLY,
    { timeout: 15000 }
  );
  check("the host replies in English", true);

  // The guest's page polls every few seconds — the reply arrives translated,
  // with the host's English underneath.
  await tp.waitForFunction(
    (needle) =>
      document.querySelector("[data-booking-thread]")?.textContent?.includes(needle) ?? false,
    HOST_REPLY,
    { timeout: 20000 }
  );
  const guestAfter = await thread.innerText();
  const translatedLines = await thread.locator("[data-msg-translated]").count();
  check("the reply reaches the guest with a rendering for them", translatedLines >= 2);
  check("the host's exact words are still there", guestAfter.includes(HOST_REPLY));
  await tc.close();
  await hc.close();
}

// --------------------- the settings test card covers every language we ship --
{
  const ac = await adminCtx();
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
  await mainText(ap);
  await ap.locator("[data-translate-check-run]").click();
  await ap.waitForSelector("[data-translate-check-ok]", { timeout: 20000 });
  const rows = await ap
    .locator("[data-translate-check-row]")
    .evaluateAll((els) => els.map((e) => e.dataset.translateCheckRow));
  check(
    "the run-test card answers in all five languages",
    ["ur", "hi", "de", "zh", "ar"].every((l) => rows.includes(l)),
    rows.join(",")
  );
  check(
    "and reports the booking-chat storage state",
    (await ap.locator('[data-translate-thread="ready"]').count()) === 1
  );
  await ac.close();
}

await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
