import { chromium } from "playwright";

/**
 * The blog platform, end to end: an admin writes a post in markdown, previews
 * it, publishes it, and it appears on the public blog — while drafts stay
 * invisible and hostile markdown comes out inert.
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 npm run e2e:blog
 *
 * Mock mode only — it signs in with the demo admin session cookie.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;
const RUN = String(Date.now()).slice(-6);
const ok = [];
const bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);

const TITLE = `Winter parking guide ${RUN}`;
const SLUG = `winter-parking-guide-${RUN}`;
const BODY = [
  "Leaving the car for a winter trip takes ten minutes of preparation.",
  "",
  "## Before you drive",
  "",
  "Check the **tyre pressure** and screenwash. See [our pricing](/pricing).",
  "",
  "- Keys with the host",
  "- De-icer in the boot",
  "",
  '<script>alert("xss")</script> and [bad](javascript:alert(1))',
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

// ----------------------------------------------------- write, preview, save
const admin = await ctx("user_admin");
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  const body = await settled(p);
  check("the blog console loads", /Blog/i.test(body));
  check("the built-in launch posts are listed", /Built-in/i.test(body));

  await p.click("[data-new-post]");
  await p.waitForSelector("#post-title");
  await p.fill("#post-title", TITLE);
  check(
    "the slug follows the title",
    (await p.inputValue("#post-slug")) === SLUG,
    await p.inputValue("#post-slug")
  );
  await p.fill("#post-tags", "Winter, Travel tips");
  await p.fill("#post-body", BODY);

  // The live preview uses the same renderer as the public page.
  await p.click("[data-preview-tab]");
  await p.waitForSelector("[data-body-preview]");
  const previewHtml = await p.locator("[data-body-preview]").innerHTML();
  check("the preview renders the heading", previewHtml.includes("<h2>Before you drive</h2>"));
  check("the preview renders bold", previewHtml.includes("<strong>tyre pressure</strong>"));
  check("hostile HTML is inert in the preview", !previewHtml.includes("<script>"));

  await p.click('button[type="submit"]:has-text("Save")');
  await p.waitForSelector("[data-saved]", { timeout: 15000 });
  check("the draft saves", true);
  await p.close();
}

// --------------------------------------------- drafts are invisible outside
{
  const c = await ctx(null);
  const p = await c.newPage();
  await p.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded" });
  const listing = await settled(p);
  check("the draft is not on the public listing", !listing.includes(TITLE));

  const res = await p.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "domcontentloaded" });
  check("the draft URL 404s for the public", res.status() === 404, String(res.status()));
  await c.close();
}

// ------------------------------------------------------------------ publish
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  const row = p.locator(`[data-article="${SLUG}"]`);
  check("the draft appears in the console list", (await row.count()) === 1);
  check("marked as a draft", /Draft/i.test(await row.innerText()));
  await row.locator("[data-publish-toggle]").click();
  // The action redirects back to the list; wait for the re-rendered row to
  // actually say so rather than reading whatever was mid-transition.
  await p.waitForSelector(`[data-article="${SLUG}"]:has-text("Published")`, { timeout: 15000 });
  check("publishing flips the badge", true);
  await p.close();
}

// ------------------------------------------------- the public page, for real
{
  const c = await ctx(null);
  const p = await c.newPage();
  await p.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded" });
  const listing = await settled(p);
  check("the published post is on the listing", listing.includes(TITLE));

  await p.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "domcontentloaded" });
  const article = await settled(p);
  check("the post page opens", article.includes(TITLE));
  check("markdown headings render", article.includes("Before you drive"));
  check("lists render", article.includes("De-icer in the boot"));

  const html = await p.content();
  check("bold renders as a tag", html.includes("<strong>tyre pressure</strong>"));
  check("the internal link renders", html.includes('href="/pricing"'));
  check("hostile HTML is inert on the page", !html.includes('<script>alert("xss")</script>'));
  check("javascript: links stay plain text", !html.includes('href="javascript:'));

  // The head a crawler reads.
  const canonical = await p.locator('link[rel="canonical"]').getAttribute("href");
  check("the post has a canonical", canonical?.includes(`/blog/${SLUG}`), String(canonical));
  const desc = await p.locator('meta[name="description"]').getAttribute("content");
  check("the post has a description", !!desc && desc.length > 20, (desc ?? "").slice(0, 40));
  const og = await p.locator('meta[property="og:image"]').first().getAttribute("content");
  check("the post has a share image", !!og, String(og).slice(0, 50));
  await c.close();
}

// ------------------------------------------------------ built-ins untouched
{
  const c = await ctx(null);
  const p = await c.newPage();
  await p.goto(`${BASE}/blog/real-cost-of-airport-parking`, { waitUntil: "domcontentloaded" });
  const body = await settled(p);
  check("built-in posts still render", /real cost of airport parking/i.test(body));
  await c.close();
}

// ------------------------------------------------------- unpublish + delete
{
  const p = await admin.newPage();
  await p.goto(`${BASE}/admin/blog`, { waitUntil: "domcontentloaded" });
  await settled(p);
  await p.locator(`[data-article="${SLUG}"] [data-publish-toggle]`).click();
  await p.waitForLoadState("networkidle");

  const c = await ctx(null);
  const vp = await c.newPage();
  const res = await vp.goto(`${BASE}/blog/${SLUG}`, { waitUntil: "domcontentloaded" });
  check("unpublishing hides the page again", res.status() === 404, String(res.status()));
  await c.close();
  await p.close();
}

await admin.close();
await browser.close();
console.log([...ok, ...bad].join("\n"));
console.log(
  bad.length ? `\n${bad.length} FAILED of ${ok.length + bad.length}` : `\nAll ${ok.length} checks passed.`
);
process.exit(bad.length ? 1 : 0);
