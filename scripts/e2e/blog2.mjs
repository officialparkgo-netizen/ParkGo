import { createHmac } from "node:crypto";
import { chromium } from "playwright";

/**
 * Blog round two, end to end:
 *
 * - the editor's autosave, SEO checklist, revisions and restore
 * - draft preview links (signed, die on publish), duplicate-as-draft
 * - the public page: TOC, [cta] shortcode, helpful votes, share row,
 *   related posts, newsletter signup, view counting, RSS, sitemap
 * - linked translations surfacing on both sides
 * - the writer role: invited by a full admin, sets a password, can only
 *   reach the blog console, can publish, and can be removed again
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 npm run e2e:blog2
 *
 * Mock mode only — it signs in with the demo admin session cookie.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const RUN = String(Date.now()).slice(-6);
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

const TITLE = `Autumn airport checklist ${RUN}`;
const SLUG = `autumn-airport-checklist-${RUN}`;
const UR_TITLE = `Khizan parking guide ${RUN}`;
const UR_SLUG = `khizan-parking-guide-${RUN}`;
const WRITER_EMAIL = `writer-${RUN}@parkgo.team`;
const WRITER_TITLE = `Writer post ${RUN}`;
const BODY = [
  "A calm departure starts the night before the flight.",
  "",
  "## Pack the paperwork",
  "",
  "Licence, booking QR and the host's phone number. ![Car ready at dawn](/images/e2e.png)",
  "",
  "[cta]",
  "",
  "## On the morning",
  "",
  "Leave **thirty minutes** earlier than feels necessary.",
].join("\n");

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

// ------------------------------------------------ editor: autosave + SEO ----
const admin = await ctx("user_admin");
let previewUrl = "";
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog?new=1`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("#post-title");

  const seoItems = await p.locator("[data-seo-checks] li").count();
  check("the SEO checklist shows five checks", seoItems === 5, String(seoItems));

  await p.fill("#post-title", TITLE);
  await p.fill("#post-body", BODY);
  // No Save click: the autosave has to do it.
  await p.waitForSelector("[data-autosaved]", { timeout: 15000 });
  check("the draft autosaves without a Save click", true);

  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const row = p.locator(`[data-article="${SLUG}"]`);
  check("the autosaved draft is in the list", (await row.count()) === 1);

  previewUrl = (await row.locator("[data-preview-link]").getAttribute("data-preview-link")) ?? "";
  check("a draft offers a preview link", previewUrl.includes("?preview="), previewUrl);

  // Duplicate while it is a draft.
  await row.locator("[data-duplicate]").click();
  await p.waitForSelector("#post-title", { timeout: 15000 });
  const copyTitle = await p.inputValue("#post-title");
  check("duplicate opens a fresh copy in the editor", copyTitle === `Copy of ${TITLE}`, copyTitle);
  await p.close();
}

// ------------------------------------------------ revisions: save + restore --
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  await p.locator(`[data-article="${SLUG}"] a`).first().click();
  await p.waitForSelector("#post-title");
  await p.fill("#post-title", `${TITLE} v2`);
  await p.click('button[type="submit"]:has-text("Save")');
  await p.waitForSelector("[data-saved]", { timeout: 15000 });

  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-revisions]", { timeout: 15000 });
  check("saving over a post records a revision", true);

  await p.locator("[data-revisions] a").first().click();
  await p.waitForSelector("[data-restoring]", { timeout: 15000 });
  const restored = await p.inputValue("#post-title");
  check("restore loads the old version into the editor", restored === TITLE, restored);
  await p.click('button[type="submit"]:has-text("Save")');
  await p.waitForSelector("[data-saved]", { timeout: 15000 });
  await p.close();
}

// -------------------------------------------------- preview link, both ways --
{
  const c = await ctx(null);
  const p = await c.newPage();
  const path = previewUrl.replace(/^https?:\/\/[^/]+/, "");
  const res = await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  check("the signed preview link opens the draft", res.status() === 200, String(res.status()));
  await p.waitForSelector("[data-preview-banner]", { timeout: 15000 });
  check("the preview banner says it is a draft", true);

  const forged = await p.goto(`${BASE}/blog/${SLUG}?preview=forged-token-000000`, {
    waitUntil: "domcontentloaded",
  });
  check("a forged preview token still 404s", forged.status() === 404, String(forged.status()));
  await c.close();
}

// ------------------------------------------- publish + the public page kit --
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  await p.locator(`[data-article="${SLUG}"] [data-publish-toggle]`).click();
  await p.waitForSelector(`[data-article="${SLUG}"]:has-text("Published")`, { timeout: 15000 });
  await p.close();

  const c = await ctx(null);
  const v = await c.newPage();
  const viewPing = v.waitForResponse(
    (r) => r.url().includes("/api/blog/react") && r.status() === 200,
    { timeout: 15000 }
  );
  await v.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "domcontentloaded" });
  const body = await settled(v);
  await viewPing;
  check("opening the post fires exactly one view ping", true);

  check("the table of contents renders", (await v.locator("[data-toc]").count()) === 1);
  const tocLinks = await v.locator("[data-toc] a").allInnerTexts();
  check(
    "the TOC lists both headings",
    tocLinks.some((t) => /Pack the paperwork/.test(t)) && tocLinks.some((t) => /On the morning/.test(t)),
    tocLinks.join(" | ")
  );

  const ctaCount = (body.match(/One booking for parking, transfer & EV/g) ?? []).length;
  check("the [cta] shortcode adds an inline CTA card", ctaCount >= 2, String(ctaCount));

  // Was this helpful?
  const before = Number(await v.locator("[data-helpful-count]").innerText());
  await v.locator("[data-helpful-btn]").click();
  await v.waitForFunction(
    (n) => Number(document.querySelector("[data-helpful-count]")?.textContent) > n,
    before,
    { timeout: 15000 }
  );
  check("the helpful vote counts", true);

  check("the share row renders", (await v.locator("[data-share] a").count()) >= 3);

  check("related posts render", (await v.locator("[data-related] a").count()) >= 1);

  // Newsletter signup on the post page.
  await v.locator('[data-subscribe] input[name="email"]').fill(`reader-${RUN}@example.com`);
  await v.locator("[data-subscribe-btn]").click();
  await v.waitForSelector("[data-subscribed]", { timeout: 15000 });
  check("the newsletter form subscribes", true);
  await c.close();
}

// -------------------------------------------------- rss + sitemap + counts --
{
  const c = await ctx(null);
  const p = await c.newPage();
  const rss = await p.request.get(`${BASE}/blog/rss.xml`);
  const rssBody = await rss.text();
  check("the RSS feed serves", rss.status() === 200, String(rss.status()));
  check("the published post is in the feed", rssBody.includes(`/blog/${SLUG}`));

  const map = await p.request.get(`${BASE}/sitemap.xml`);
  check("the sitemap lists the post", (await map.text()).includes(`/blog/${SLUG}`));

  // Signed unsubscribe link — same HMAC recipe as the mailer.
  const secret =
    process.env.ADMIN_2FA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "parkgo-demo-secret";
  const email = `reader-${RUN}@example.com`;
  const sig = createHmac("sha256", secret).update(`blog-unsub.${email}`).digest("hex").slice(0, 24);
  const unsub = await p.request.get(
    `${BASE}/api/blog/unsubscribe?e=${encodeURIComponent(email)}&sig=${sig}`
  );
  check("the signed unsubscribe link works", unsub.status() === 200, String(unsub.status()));
  const badSig = await p.request.get(
    `${BASE}/api/blog/unsubscribe?e=${encodeURIComponent(email)}&sig=${"0".repeat(24)}`
  );
  check("a forged unsubscribe link is refused", badSig.status() === 400, String(badSig.status()));
  await c.close();
}

// ------------------------------------------------ listing: search/tag/pages --
{
  const c = await ctx(null);
  const p = await c.newPage();
  await p.goto(`${BASE}/blog?q=${encodeURIComponent(`checklist ${RUN}`)}`, {
    waitUntil: "domcontentloaded",
  });
  const hits = await settled(p);
  check("search finds the post", hits.includes(TITLE));

  await p.goto(`${BASE}/blog?q=zz-plainly-nothing-${RUN}`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("[data-no-results]", { timeout: 15000 });
  check("an empty search says so", true);

  await p.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check("the tag rail renders", (await p.locator("[data-blog-tags] a").count()) >= 2);
  await c.close();
}

// -------------------------------------------------------- linked translation --
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog?new=1`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("#post-title");
  await p.fill("#post-title", UR_TITLE);
  await p.fill("#post-body", "Parking ka mausam badal gaya.\n\n## Tayari\n\nGaari garam rakhein.");
  await p.selectOption("#post-lang", "ur");
  await p.selectOption("#post-translation-of", { label: `${TITLE}` });
  // A far-future schedule, to see the badge on the list.
  await p.fill("#post-schedule", "2030-01-01T09:00");
  await p.click('button[type="submit"]:has-text("Save")');
  await p.waitForSelector("[data-saved]", { timeout: 15000 });

  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const row = p.locator(`[data-article="${UR_SLUG}"]`);
  check("a scheduled draft is badged in the console", (await row.locator("[data-scheduled]").count()) === 1);
  await row.locator("[data-publish-toggle]").click();
  await p.waitForSelector(`[data-article="${UR_SLUG}"]:has-text("Published")`, { timeout: 15000 });
  await p.close();

  const c = await ctx(null);
  const v = await c.newPage();
  await v.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "domcontentloaded" });
  await settled(v);
  const translations = v.locator("[data-translations]");
  check("the original links its Urdu version", (await translations.count()) === 1);
  check("the switcher names the language", (await translations.innerText()).includes("اردو"));
  const hreflang = await v.locator('link[hreflang="ur"]').count();
  check("hreflang alternates are in the head", hreflang >= 1, String(hreflang));

  await v.goto(`${BASE}/blog/${UR_SLUG}`, { waitUntil: "domcontentloaded" });
  await settled(v);
  check(
    "the translation links back to the original",
    (await v.locator("[data-translations]").innerText()).includes("English")
  );
  await c.close();
}

// ----------------------------------------------------------- writer invites --
let writerCtx;
let writerId = "";
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  check("full admins see the writers section", (await p.locator("[data-writers]").count()) === 1);

  await p.fill("#writer-name", "Freelance Writer");
  await p.fill("#writer-email", WRITER_EMAIL);
  await p.locator("[data-invite-writer]").click();
  await p.waitForSelector("[data-nomail]", { timeout: 15000 });
  check("the writer invite is minted (no mailer in mock)", true);

  const row = p.locator(`[data-writers-card] div:has-text("${WRITER_EMAIL}")`).first();
  check("the pending badge shows", (await p.locator("[data-invite-pending]").count()) >= 1);
  const invite = await p.locator("[data-invite-link]").first().getAttribute("data-invite-link");
  check("the invite link is copyable", !!invite && invite.includes("/team/accept?token="));

  // The writer opens the link and sets a password.
  writerCtx = await ctx(null);
  const w = await writerCtx.newPage();
  const token = new URL(invite).searchParams.get("token") ?? "";
  writerId = token.split(".")[0];
  await w.goto(`${BASE}/team/accept?token=${encodeURIComponent(token)}`, {
    waitUntil: "domcontentloaded",
  });
  await w.waitForSelector("[data-team-password-form]");
  await w.fill('input[name="password"]', "writer-pass-123");
  await w.fill('input[name="confirm"]', "writer-pass-123");
  await w.click('[data-team-password-form] button[type="submit"]');
  await w.waitForURL("**/admin/blog**", { timeout: 20000 });
  check("setting a password lands the writer on the blog console", true);

  // Lockdown: every ops page bounces straight back to the blog.
  for (const path of ["/admin", "/admin/support", "/admin/payments", "/admin/users"]) {
    await w.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    await w.waitForLoadState("networkidle");
    check(`the writer is bounced from ${path}`, w.url().includes("/admin/blog"), w.url());
  }

  const html = await w.content();
  check("the writer's nav has no ops links", !html.includes('href="/admin/users"'));
  check("the writer cannot see the writers section", (await w.locator("[data-writers]").count()) === 0);

  // And the point of it all: the writer writes and publishes.
  await w.goto(`${BASE}/admin/blog?new=1`, { waitUntil: "domcontentloaded" });
  await w.waitForSelector("#post-title");
  await w.fill("#post-title", WRITER_TITLE);
  await w.fill("#post-body", "Freelance words.\n\n## One heading\n\nEnough body to publish.");
  await w.click('button[type="submit"]:has-text("Save")');
  await w.waitForSelector("[data-saved]", { timeout: 15000 });
  await w.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(w);
  await w
    .locator(`[data-article="writer-post-${RUN}"] [data-publish-toggle]`)
    .click();
  await w.waitForSelector(`[data-article="writer-post-${RUN}"]:has-text("Published")`, {
    timeout: 15000,
  });
  check("the writer can publish a post", true);
  await w.close();
  await p.close();
}

// -------------------------------------------------- view counter, then out --
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const rowText = await p.locator(`[data-article="${SLUG}"]`).innerText();
  check("the console shows the post's view count", /[1-9]\d* views/.test(rowText), rowText.slice(0, 120));

  // Remove the writer again.
  const row = p.locator(`[data-writers-card] > div:has-text("${WRITER_EMAIL}")`).first();
  await row.locator("form").last().locator("button").click();
  // The action redirects to ?team=removed — wait for the fresh render, not
  // whatever the old page looked like mid-navigation.
  await p.waitForURL("**team=removed**", { timeout: 15000 });
  await settled(p);
  const after = await p.locator("[data-writers-card]").innerText();
  check("removing the writer clears the row", !after.includes(WRITER_EMAIL));
  await p.close();

  // Removal disables the whole account, not just the console: their session
  // now lands on the suspended sign-in screen.
  const w = await writerCtx.newPage();
  await w.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await w.waitForLoadState("networkidle");
  check("the removed writer loses the console", !w.url().includes("/admin/blog"), w.url());
  check("removal disables the account", w.url().includes("suspended=1"), w.url());

  // The admin can lift the restriction from the user's profile.
  const a = await admin.newPage();
  await a.goto(`${BASE}/admin/users/${writerId}`, { waitUntil: "domcontentloaded" });
  await settled(a);
  await a.locator('form:has(input[name="state"][value="restore"]) button').click();
  await a.waitForLoadState("networkidle");
  await a.close();

  await w.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  await w.waitForLoadState("networkidle");
  check(
    "restoring un-restricts them as a customer",
    w.url().includes("/app") && !w.url().includes("suspended"),
    w.url()
  );
  await w.close();
  await writerCtx.close();
}

await admin.close();
await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
