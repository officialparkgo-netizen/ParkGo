import { listPublicPosts } from "@/lib/data/blog";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * RSS for feed readers and Google Discover. Built-in posts appear with their
 * English titles — a feed has one language per item, and English is what the
 * built-ins were written in.
 */
export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, "");
  const posts = await listPublicPosts();

  const items = posts
    .slice(0, 30)
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}/blog/${p.slug}</link>
      <guid isPermaLink="true">${base}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE.name} Blog`)}</title>
    <link>${base}/blog</link>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-GB</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
