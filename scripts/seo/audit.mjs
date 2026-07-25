import { chromium } from "playwright";
// BASE=http://localhost:3000 node scripts/seo/audit.mjs
const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = ["/","/travellers","/hosts","/how-it-works","/pricing","/faq","/trust-safety","/about","/contact","/blog","/airports/heathrow","/privacy","/terms"];
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
/**
 * Next hydrates and may replace the router state right after networkidle, which
 * destroys the execution context mid-evaluate. Retry once on that specific
 * failure rather than letting a race decide whether the audit passes.
 */
async function readPage(p, fn) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await p.evaluate(fn);
    } catch (err) {
      if (!/Execution context was destroyed|Target closed/.test(String(err))) throw err;
      await p.waitForLoadState("domcontentloaded").catch(() => {});
      await p.waitForTimeout(300);
    }
  }
  return p.evaluate(fn);
}

/**
 * Fail loudly when BASE is not serving. Without this a dead server reads as a
 * clean run — every page yields no text, so nothing can fall below AA and the
 * audit "passes" while having checked nothing at all.
 */
async function assertReachable(base) {
  const res = await fetch(base, { redirect: "manual" }).catch((e) => {
    throw new Error(`${base} is not reachable (${e.message}). Start a build first: npm run build && npm start`);
  });
  if (res.status >= 500) throw new Error(`${base} returned ${res.status} — is the build healthy?`);
}
await assertReachable(BASE);

const rows = [];
for (const path of PAGES) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addCookies([{ name: "parkgo_cookie_consent", value: "all", url: BASE }]);
  const p = await c.newPage();
  let js = 0, total = 0;
  p.on("response", async (r) => {
    try { const bd = await r.body(); total += bd.length;
      if (/javascript/.test(r.headers()["content-type"] ?? "")) js += bd.length; } catch {}
  });
  await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }).catch(()=>null);
  await p.waitForSelector("main, body", { timeout: 10000 }).catch(() => {});
  const m = await readPage(p, () => {
    const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content
      ?? document.querySelector(`meta[property="${n}"]`)?.content ?? null;
    return {
      title: document.title, titleLen: document.title.length,
      desc: meta("description"), descLen: (meta("description") ?? "").length,
      canonical: document.querySelector("link[rel=canonical]")?.href ?? null,
      ogTitle: !!meta("og:title"), ogImage: meta("og:image"), ogType: meta("og:type"),
      twCard: meta("twitter:card"),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => { try { const j = JSON.parse(s.textContent); return Array.isArray(j)? j.map(x=>x["@type"]).join("+") : j["@type"]; } catch { return "INVALID"; } }),
      lang: document.documentElement.lang,
      imgNoAlt: [...document.querySelectorAll("img")].filter(i => !i.hasAttribute("alt")).length,
      h1: document.querySelectorAll("h1").length,
    };
  });
  rows.push({ path, js, total, ...m });
  await c.close();
}
await b.close();
console.log("path                 title  desc  canon og:img jsonld                 lang h1 noalt   js    total");
for (const r of rows) {
  console.log(
    `${r.path.padEnd(20)} ${String(r.titleLen).padStart(3)}   ${String(r.descLen).padStart(3)}   ${r.canonical?"y":"N"}     ${r.ogImage?"y":"N"}   ${(r.jsonLd.join(",")||"-").padEnd(22)} ${(r.lang||"-").padEnd(4)} ${r.h1}  ${r.imgNoAlt}    ${(r.js/1024).toFixed(0).padStart(4)}K ${(r.total/1024).toFixed(0).padStart(5)}K`);
}
const probs = [];
for (const r of rows) {
  if (!r.desc) probs.push(`${r.path}: no meta description`);
  if (r.descLen && (r.descLen < 70 || r.descLen > 160)) probs.push(`${r.path}: description ${r.descLen} chars (want 70-160)`);
  if (r.titleLen > 60) probs.push(`${r.path}: title ${r.titleLen} chars (want <=60)`);
  if (!r.canonical) probs.push(`${r.path}: no canonical`);
  if (!r.ogImage) probs.push(`${r.path}: no og:image`);
  if (r.h1 !== 1) probs.push(`${r.path}: ${r.h1} h1`);
  if (r.imgNoAlt) probs.push(`${r.path}: ${r.imgNoAlt} img without alt`);
  if (r.jsonLd.includes("INVALID")) probs.push(`${r.path}: invalid JSON-LD`);
}
console.log("\n== PROBLEMS ==");
for (const p of probs) console.log("  " + p);
if (!probs.length) console.log("  none");
process.exit(probs.length ? 1 : 0);
