import type { BlogArticle } from "@/types";

/**
 * Markdown for the blog, rendered to HTML.
 *
 * Written here rather than pulled from npm because the input is written by a
 * signed-in admin but *published to the public site*, which makes this an XSS
 * boundary — and the safety argument has to be inspectable. The whole design
 * is one rule: **escape first, then transform**. Raw text is HTML-escaped
 * before any markdown pattern runs, so the transforms only ever operate on
 * inert text, and the only tags in the output are the ones this file writes.
 *
 * Supported, deliberately small: ## and ### headings, paragraphs, **bold**,
 * *italic*, `code`, fenced code blocks, [links](https://…), ![images](https://…),
 * bullet and numbered lists, > quotes, --- rules. Link and image URLs must be
 * http(s) or site-relative — `javascript:` and friends render as plain text.
 */

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Only destinations that cannot execute anything. */
function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
}

/**
 * Inline transforms on already-escaped text. Code spans are lifted out first
 * so `**not bold**` inside backticks stays literal, then restored at the end.
 */
function inline(escaped: string): string {
  const codes: string[] = [];
  let out = escaped.replace(/`([^`\n]+)`/g, (_, code: string) => {
    codes.push(`<code>${code}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // Images before links — an image is a link pattern with a prefix.
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt: string, url: string) => {
    const safe = safeUrl(url);
    return safe ? `<img src="${safe}" alt="${alt}" loading="lazy" />` : m;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
    const safe = safeUrl(url);
    return safe ? `<a href="${safe}">${label}</a>` : m;
  });

  out = out
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)] ?? "");
}

export function renderMarkdown(md: string): string {
  // The placeholder used to protect code spans must not be forgeable.
  const lines = md.replaceAll("\u0000", "").split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];
  let fence: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(escapeHtml(paragraph.join(" ")))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) {
      html.push(
        `<${list.kind}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.kind}>`
      );
    }
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) {
      html.push(`<blockquote><p>${inline(escapeHtml(quote.join(" ")))}</p></blockquote>`);
    }
    quote = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    if (fence) {
      if (line.trim().startsWith("```")) {
        html.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`);
        fence = null;
      } else {
        fence.push(line);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushAll();
      fence = [];
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(escapeHtml(heading[2]))}</h${level}>`);
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) {
      flushAll();
      html.push("<hr />");
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      flushQuote();
      if (list?.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(inline(escapeHtml(bullet[1])));
      continue;
    }
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      flushQuote();
      if (list?.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(inline(escapeHtml(numbered[1])));
      continue;
    }
    const quoted = line.match(/^\s*>\s?(.*)$/);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]);
      continue;
    }
    if (!line.trim()) {
      flushAll();
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line.trim());
  }
  // An unclosed fence still renders as code rather than vanishing.
  if (fence) html.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`);
  flushAll();

  return html.join("\n");
}

// -----------------------------------------------------------------------------
// Small helpers the platform shares
// -----------------------------------------------------------------------------

/** "My First Post!" → "my-first-post". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Reading time from the text itself. Derived rather than stored, because a
 * stored number goes quietly stale every time the post is edited.
 */
export function readMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Plain-text opening of the body, for a card when no excerpt was written. */
export function autoExcerpt(body: string, max = 180): string {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** "Pricing, Travel tips" → ["Pricing", "Travel tips"], capped and deduped. */
export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 6);
}

export type ArticleCard = Pick<
  BlogArticle,
  "slug" | "title" | "excerpt" | "tags" | "coverUrl"
> & { date: string; readMins: number; custom: boolean };
