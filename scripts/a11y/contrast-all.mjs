import { chromium } from "playwright";

// Point these at a running build:  BASE=http://localhost:3000 node scripts/a11y/contrast-all.mjs
// CHROME_PATH is only needed where playwright can't find its own browser.
const BASE = process.env.BASE ?? "http://localhost:3000";
const EXEC = process.env.CHROME_PATH || undefined;

/**
 * One contrast pass over the whole product — marketing pages signed out, portal
 * pages behind each role's session cookie.
 *
 * Two floors, because WCAG has two: 4.5:1 for body text (3:1 once it is 24px,
 * or 18.66px bold), and 3:1 for the icons, which are graphical objects under
 * 1.4.11. Backgrounds are resolved by climbing ancestors *and* by pulling the
 * stops out of any gradient on the way up — a gradient band reports
 * `background-color: transparent`, so a naive climb lands on the white body
 * and scores white-on-white at 1:1.
 */
const ROUTES = [
  [null, "/"],
  [null, "/travellers"],
  [null, "/hosts"],
  [null, "/pricing"],
  [null, "/faq"],
  [null, "/trust-safety"],
  [null, "/contact"],
  [null, "/about"],
  [null, "/how-it-works"],
  [null, "/privacy"],
  [null, "/airports/heathrow"],
  [null, "/blog"],
  [null, "/login"],
  ["user_traveller", "/app"],
  ["user_traveller", "/app/search?airport=heathrow"],
  ["user_traveller", "/app/trips"],
  ["user_traveller", "/app/saved"],
  ["user_traveller", "/app/profile"],
  ["user_traveller", "/notifications"],
  ["user_traveller", "/account"],
  ["user_host", "/host"],
  ["user_host", "/host/today"],
  ["user_host", "/host/spaces"],
  ["user_host", "/host/earnings"],
  ["user_host", "/host/new"],
  ["user_admin", "/admin"],
  ["user_admin", "/admin/support"],
  ["user_admin", "/admin/users"],
  ["user_admin", "/admin/listings"],
  ["user_admin", "/admin/payments"],
  ["user_admin", "/admin/verification"],
  ["user_admin", "/admin/analytics"],
  ["user_admin", "/admin/settings"],
  ["user_admin", "/admin/broadcast"],
  ["user_admin", "/admin/today"],
];

const CHECK = () => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((x) => parseFloat(x));
    return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
  };
  const gradientStops = (image) => {
    if (!image || image === "none") return [];
    return [...image.matchAll(/rgba?\(([^)]+)\)/g)]
      .map((m) => {
        const parts = m[1].split(",").map((x) => parseFloat(x));
        return parts.length > 3 && parts[3] < 0.5 ? null : parts.slice(0, 3);
      })
      .filter(Boolean);
  };
  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      const stops = gradientStops(cs.backgroundImage);
      if (stops.length) return stops;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.5) return [c.rgb];
      node = node.parentElement;
    }
    return [[255, 255, 255]];
  };
  const ratio = (a, b) => {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const worst = (fg, el) => Math.min(...bgOf(el).map((bg) => ratio(fg, bg)));
  const shown = (el, cs) => {
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    if (Number(cs.opacity) < 0.5) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const out = [];
  let examined = 0;
  const seen = new Set();
  const push = (kind, label, cs, r, need, el) => {
    const key = `${kind}|${cs.color}|${cs.fontSize}|${label.slice(0, 20)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      kind,
      text: label.slice(0, 40),
      color: cs.color,
      bg: `rgb(${bgOf(el)[0].join(",")})`,
      size: Math.round(parseFloat(cs.fontSize) || 0),
      ratio: Math.round(r * 100) / 100,
      need,
    });
  };

  for (const el of document.querySelectorAll(
    "p,div,span,a,li,h1,h2,h3,h4,h5,h6,button,label,dt,dd,td,th",
  )) {
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent?.trim())
      .join(" ")
      .trim();
    if (!text || text.length < 3) continue;
    const cs = getComputedStyle(el);
    if (!shown(el, cs)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    examined += 1;
    const r = worst(fg.rgb, el);
    if (r < need) push("text", text, cs, r, need, el);
  }

  // Icons: lucide renders `stroke="currentColor"`, so the icon's own `color`
  // is its ink. Purely decorative marks would be exempt, but every icon here
  // is doing informational work next to a label, so hold them all to 3:1.
  for (const el of document.querySelectorAll("svg")) {
    const cs = getComputedStyle(el);
    if (!shown(el, cs)) continue;
    // Multi-colour brand artwork (the logo) paints explicit fills, not
    // currentColor — and logotypes are exempt from 1.4.3 / 1.4.11 anyway.
    if (el.closest("[aria-label='ParkGo home']") || el.getAttribute("aria-label") === "ParkGo") continue;
    // Full-bleed background textures (the dotted grid) are decoration, not
    // graphical objects — low contrast is the whole point of them.
    const box = el.getBoundingClientRect();
    const host = el.parentElement?.getBoundingClientRect();
    if (host && box.width >= host.width * 0.9 && box.height >= host.height * 0.9) continue;
    const ink = parse(cs.color);
    if (!ink || ink.a < 0.5) continue;
    examined += 1;
    const r = worst(ink.rgb, el);
    if (r < 3) {
      const label =
        el.getAttribute("aria-label") ||
        el.parentElement?.textContent?.trim().slice(0, 30) ||
        "(icon)";
      push("icon", label, cs, r, 3, el);
    }
  }
  return { out, examined };
};

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

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
let bad = 0;
let total = 0;
let checked = 0;

for (const [user, path] of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const cookies = [{ name: "parkgo_cookie_consent", value: "all", url: BASE }];
  if (user) cookies.push({ name: "parkgo_session", value: user, url: BASE });
  await ctx.addCookies(cookies);
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
  await p.waitForSelector("main, body", { timeout: 10000 }).catch(() => null);
  // Scroll the whole page before measuring. `.reveal-scroll` is a scroll-driven
  // animation that holds its content at opacity 0 until it enters view, and the
  // checker skips anything under opacity 0.5 — so measuring at scroll 0 audits
  // only the first screen and reports everything below it as clean.
  await p
    .evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 250));
    })
    .catch(() => {});

  const seen = await readPage(p, () => document.body?.innerText?.trim().length ?? 0);
  if (seen < 50) {
    console.log(`### ${path} — SKIPPED, page rendered no text (did it 404?)`);
    bad += 1;
    total += 1;
    await ctx.close();
    continue;
  }
  const { out: fails, examined } = await readPage(p, CHECK);
  total += fails.length;
  checked += examined;
  if (fails.length) {
    bad += 1;
    console.log(`\n### ${path} — ${fails.length} below AA (${examined} checked)`);
    for (const f of fails.slice(0, 10)) {
      console.log(
        `  [${f.kind}] ${String(f.ratio).padStart(5)}:1 (need ${f.need})  ${f.size}px ${f.color} on ${f.bg}  "${f.text}"`,
      );
    }
  } else {
    console.log(`### ${path} — passes AA (${examined} checked)`);
  }
  await ctx.close();
}

await browser.close();
console.log(`\nPages with issues: ${bad}/${ROUTES.length}  (${total} findings across ${checked} elements)`);
process.exit(total ? 1 : 0);
