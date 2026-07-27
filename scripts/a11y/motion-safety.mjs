import { chromium } from "playwright";
/**
 * Motion safety.
 *
 * Every reveal on this site works by animating from opacity 0, which means a
 * broken range, an unreachable timeline or a stalled animation does not degrade
 * — it deletes the content. This walks each marketing page, scrolls it end to
 * end, and asserts that nothing is left invisible; then does it again under
 * prefers-reduced-motion, where nothing should need scrolling at all.
 *
 * It samples twice with a gap: a scroll-driven animation settles a frame or two
 * after the scroll stops, and a single sample will happily report a mid-flight
 * opacity as a bug.
 */

// BASE=http://localhost:3000 node scripts/a11y/motion-safety.mjs
const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = ["/", "/travellers", "/hosts", "/how-it-works", "/pricing", "/faq",
  "/trust-safety", "/about", "/contact", "/blog", "/airports/heathrow"];
const ok = [], bad = [];
const check = (n, c, x = "") => (c ? ok : bad).push(`${c ? "✓" : "✗"} ${n}${x ? ` — ${x}` : ""}`);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

// how much of the page is still invisible after a full scroll?
const hidden = async (motion) => {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: motion });
  await c.addCookies([{ name: "parkgo_cookie_consent", value: "all", url: BASE }]);
  const out = {};
  for (const path of PAGES) {
    const p = await c.newPage();
    await p.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => null);
    await p.evaluate(async () => {
      const step = Math.round(innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 500));
    }).catch(() => {});
    // Sample twice. A scroll-driven animation settles a frame or two after the
    // scroll stops, so a single sample can catch a mid-flight opacity and
    // report a bug that is not there. Only something hidden in BOTH samples is
    // actually stuck.
    out[path] = await p.evaluate(async () => {
      const hiddenNow = () => {
        const els = [...document.querySelectorAll("main *, section *")].filter(e => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (e.textContent || "").trim().length > 2;
        });
        return { els, hidden: new Set(els.filter(e => Number(getComputedStyle(e).opacity) < 0.5)) };
      };
      const first = hiddenNow();
      await new Promise(r => setTimeout(r, 400));
      const second = hiddenNow();
      const stuck = [...second.hidden].filter(e => first.hidden.has(e));
      return { total: second.els.length, invisible: stuck.length,
               sample: stuck.slice(0, 2).map(e => (e.textContent || "").trim().slice(0, 40)) };
    });
    await p.close();
  }
  await c.close();
  return out;
};

console.log("== normal motion ==");
const normal = await hidden("no-preference");
for (const [k, v] of Object.entries(normal)) {
  check(`${k}: nothing left invisible after scrolling`, v.invisible === 0,
        v.invisible ? `${v.invisible}/${v.total} ${JSON.stringify(v.sample)}` : `${v.total} elements visible`);
}

console.log("== reduced motion ==");
const reduced = await hidden("reduce");
for (const [k, v] of Object.entries(reduced)) {
  check(`${k}: fully visible under prefers-reduced-motion`, v.invisible === 0,
        v.invisible ? `${v.invisible}/${v.total} ${JSON.stringify(v.sample)}` : `${v.total} elements`);
}

// reduced motion must also show everything WITHOUT scrolling at all
{
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await c.addCookies([{ name: "parkgo_cookie_consent", value: "all", url: BASE }]);
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const v = await p.evaluate(() =>
    [...document.querySelectorAll(".reveal-scroll, .reveal-stagger > *, .enter, .hero-enter > *")]
      .filter(e => Number(getComputedStyle(e).opacity) < 0.5).length);
  check("reduced motion needs no scrolling to reveal anything", v === 0, `${v} still hidden`);
  await c.close();
}

await b.close();
console.log([...ok, ...bad].join("\n"));
console.log(bad.length ? `\n${bad.length} FAILED` : `\nAll ${ok.length} checks passed.`);
process.exit(bad.length ? 1 : 0);
