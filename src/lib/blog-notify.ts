import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { BlogArticle } from "@/types";
import { listActiveSubscribers } from "@/lib/data/blog";
import { emailButton, emailShell, isEmailConfigured, sendEmail } from "@/lib/email";
import { SITE } from "@/lib/seo";

/**
 * What happens *around* a publish: subscribers get an email, search engines
 * get a ping. Both are best-effort — a newsletter outage must never make the
 * publish button fail, so nothing here throws.
 */

const BASE = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

// -----------------------------------------------------------------------------
// Newsletter
// -----------------------------------------------------------------------------

function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

/**
 * Unsubscribe links are signed so the address in the URL cannot be swapped —
 * an unsigned link would let anyone unsubscribe anyone else by guessing their
 * email.
 */
export function unsubscribeSig(email: string): string {
  return createHmac("sha256", secret())
    .update(`blog-unsub.${email.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
}

export function verifyUnsubscribeSig(email: string, sig: string): boolean {
  const expected = unsubscribeSig(email);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${BASE}/api/blog/unsubscribe?e=${e}&sig=${unsubscribeSig(email)}`;
}

async function emailSubscribers(article: BlogArticle): Promise<number> {
  if (!isEmailConfigured()) return 0;
  const subscribers = await listActiveSubscribers();
  if (subscribers.length === 0) return 0;

  const postUrl = `${BASE}/blog/${article.slug}`;
  let sent = 0;
  for (const email of subscribers) {
    try {
      const ok = await sendEmail(
        email,
        `New on the ParkGo blog: ${article.title}`,
        emailShell(
          `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">${escapeHtml(
            article.title
          )}</h2>
           <p style="margin:0">${escapeHtml(article.excerpt)}</p>
           ${emailButton(postUrl, "Read the article")}
           <p style="margin:0;font-size:12px;color:#878D96">You asked to hear about new ParkGo articles.
           <a href="${unsubscribeUrl(email)}" style="color:#878D96">Unsubscribe</a></p>`
        )
      );
      if (ok) sent += 1;
    } catch {
      // One bad address must not stop the batch.
    }
  }
  return sent;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// -----------------------------------------------------------------------------
// Draft preview links
// -----------------------------------------------------------------------------

/**
 * A signed URL that shows a draft to someone without an admin login — the
 * client sending "have a look before I publish" to a colleague. The token is
 * bound to the slug; it stops working the moment the post is published (the
 * page only consults it for drafts), so old preview links never linger as a
 * second way in.
 */
export function makePreviewToken(slug: string): string {
  return createHmac("sha256", secret()).update(`blog-preview.${slug}`).digest("hex").slice(0, 24);
}

export function verifyPreviewToken(slug: string, token: string): boolean {
  const expected = makePreviewToken(slug);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// -----------------------------------------------------------------------------
// IndexNow
// -----------------------------------------------------------------------------

/**
 * Tell search engines the URL exists, the moment it does. Gated on
 * `INDEXNOW_KEY`; the middleware serves the required `/{key}.txt` proof file
 * from the same variable. Google retired its sitemap ping — IndexNow (Bing,
 * Yandex, and partners) is what still accepts a push.
 */
export function isIndexNowConfigured(): boolean {
  return !!process.env.INDEXNOW_KEY;
}

export async function pingIndexNow(paths: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || paths.length === 0) return false;
  try {
    const host = new URL(BASE).host;
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${BASE}/${key}.txt`,
        urlList: paths.map((p) => `${BASE}${p}`),
      }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------

/** Everything that should happen when an article goes live. */
export async function announceNewPost(article: BlogArticle): Promise<void> {
  try {
    await emailSubscribers(article);
  } catch {
    // best-effort
  }
  try {
    await pingIndexNow([`/blog/${article.slug}`, "/blog"]);
  } catch {
    // best-effort
  }
}
