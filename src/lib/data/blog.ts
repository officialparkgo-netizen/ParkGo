import type { BlogArticle, BlogRevision, BlogStats, Locale } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { autoExcerpt, readMinutes, slugify, type ArticleCard } from "@/lib/markdown";
import { getAllPosts } from "@/content/blog";

/**
 * The blog's data layer. Two kinds of post live behind one listing:
 *
 * - **Built-in** posts ship as code (src/content/blog.ts), carry translations
 *   in all five locales, and are edited by editing the code. They are the
 *   launch content and they never disappear.
 * - **Articles** are written in the admin console, stored in `blog_posts`
 *   (migration 0027), single-language, publishable and unpublishable at will.
 *
 * A slug resolves to exactly one of the two, and an article may never take a
 * built-in post's slug — a client overwriting the launch content by accident
 * would look like data loss, and to them it would be.
 */

const g = globalThis as unknown as {
  __parkgoBlog?: BlogArticle[];
  __parkgoBlogStats?: Map<string, BlogStats>;
  __parkgoBlogRevisions?: BlogRevision[];
  __parkgoBlogSubs?: { email: string; createdAt: string; unsubscribedAt?: string }[];
};
const mockArticles = (g.__parkgoBlog ??= []);
const mockStats = (g.__parkgoBlogStats ??= new Map());
const mockRevisions = (g.__parkgoBlogRevisions ??= []);
const mockSubs = (g.__parkgoBlogSubs ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(r: any): BlogArticle {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    body: r.body ?? "",
    coverUrl: r.cover_url ?? undefined,
    author: r.author ?? "The ParkGo Team",
    tags: Array.isArray(r.tags) ? r.tags : [],
    status: r.status === "published" ? "published" : "draft",
    publishedAt: r.published_at ?? undefined,
    scheduledAt: r.scheduled_at ?? undefined,
    lang: (r.lang as Locale) ?? "en",
    translationOf: r.translation_of ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const BUILTIN_SLUGS = new Set(getAllPosts().map((p) => p.slug));

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  coverUrl?: string;
  author?: string;
  tags?: string[];
  scheduledAt?: string;
  lang?: Locale;
  translationOf?: string;
}

function normalise(input: ArticleInput) {
  const title = input.title.trim().slice(0, 140);
  const body = input.body.slice(0, 60_000);
  return {
    title,
    slug: slugify(input.slug?.trim() || title),
    excerpt: input.excerpt?.trim().slice(0, 300) || autoExcerpt(body),
    body,
    coverUrl: input.coverUrl || undefined,
    author: input.author?.trim().slice(0, 80) || "The ParkGo Team",
    tags: (input.tags ?? []).slice(0, 6),
    // A schedule in the past is meaningless — publish is one click away.
    scheduledAt:
      input.scheduledAt && new Date(input.scheduledAt).getTime() > Date.now()
        ? new Date(input.scheduledAt).toISOString()
        : undefined,
    lang: (input.lang ?? "en") as Locale,
    translationOf: input.translationOf || undefined,
  };
}

export type SaveResult =
  | { ok: true; article: BlogArticle }
  | { ok: false; reason: "empty" | "slug-taken" | "slug-builtin" | "failed" };

export async function createArticle(input: ArticleInput): Promise<SaveResult> {
  const fields = normalise(input);
  if (!fields.title || !fields.slug) return { ok: false, reason: "empty" };
  if (BUILTIN_SLUGS.has(fields.slug)) return { ok: false, reason: "slug-builtin" };
  if (await getArticleBySlug(fields.slug, { drafts: true })) {
    return { ok: false, reason: "slug-taken" };
  }

  const now = new Date().toISOString();
  if (!IS_LIVE) {
    const article: BlogArticle = {
      id: `art_${mockArticles.length + 1}_${Date.now() % 100000}`,
      ...fields,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    mockArticles.unshift(article);
    return { ok: true, article };
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("blog_posts")
      .insert({
        slug: fields.slug,
        title: fields.title,
        excerpt: fields.excerpt,
        body: fields.body,
        cover_url: fields.coverUrl ?? null,
        author: fields.author,
        tags: fields.tags,
        scheduled_at: fields.scheduledAt ?? null,
        lang: fields.lang,
        translation_of: fields.translationOf ?? null,
      })
      .select("*")
      .single();
    if (error || !data) return { ok: false, reason: "failed" };
    return { ok: true, article: fromRow(data) };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function updateArticle(id: string, input: ArticleInput): Promise<SaveResult> {
  const fields = normalise(input);
  if (!fields.title || !fields.slug) return { ok: false, reason: "empty" };
  if (BUILTIN_SLUGS.has(fields.slug)) return { ok: false, reason: "slug-builtin" };
  const clash = await getArticleBySlug(fields.slug, { drafts: true });
  if (clash && clash.id !== id) return { ok: false, reason: "slug-taken" };

  if (!IS_LIVE) {
    const article = mockArticles.find((a) => a.id === id);
    if (!article) return { ok: false, reason: "failed" };
    snapshotRevisionMock(article);
    Object.assign(article, fields, { updatedAt: new Date().toISOString() });
    return { ok: true, article };
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await snapshotRevisionLive(id);
    const { data, error } = await supabaseAdmin()
      .from("blog_posts")
      .update({
        slug: fields.slug,
        title: fields.title,
        excerpt: fields.excerpt,
        body: fields.body,
        cover_url: fields.coverUrl ?? null,
        author: fields.author,
        tags: fields.tags,
        scheduled_at: fields.scheduledAt ?? null,
        lang: fields.lang,
        translation_of: fields.translationOf ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error || !data) return { ok: false, reason: "failed" };
    return { ok: true, article: fromRow(data) };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * Publish or unpublish. `publishedAt` is set on the *first* publish and then
 * kept — unpublishing to fix a typo and republishing must not bump an article
 * back to the top of the listing as though it were new.
 */
export async function setArticleStatus(
  id: string,
  status: BlogArticle["status"]
): Promise<BlogArticle | null> {
  if (!IS_LIVE) {
    const article = mockArticles.find((a) => a.id === id);
    if (!article) return null;
    article.status = status;
    if (status === "published" && !article.publishedAt) {
      article.publishedAt = new Date().toISOString();
    }
    article.updatedAt = new Date().toISOString();
    return article;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data: current } = await admin
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!current) return null;
    const { data } = await admin
      .from("blog_posts")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === "published" && !current.published_at
          ? { published_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!IS_LIVE) {
    const i = mockArticles.findIndex((a) => a.id === id);
    if (i < 0) return false;
    mockArticles.splice(i, 1);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin().from("blog_posts").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function getArticleById(id: string): Promise<BlogArticle | null> {
  if (!IS_LIVE) return mockArticles.find((a) => a.id === id) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

/** By slug. Drafts only come back when the caller says so (the admin console). */
export async function getArticleBySlug(
  slug: string,
  opts: { drafts?: boolean } = {}
): Promise<BlogArticle | null> {
  if (!IS_LIVE) {
    const hit = mockArticles.find((a) => a.slug === slug) ?? null;
    return hit && (opts.drafts || hit.status === "published") ? hit : null;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    let q = supabaseAdmin().from("blog_posts").select("*").eq("slug", slug);
    if (!opts.drafts) q = q.eq("status", "published");
    const { data } = await q.maybeSingle();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

/** Everything, drafts included, newest first — the admin console's list. */
export async function listArticlesAdmin(): Promise<BlogArticle[]> {
  if (!IS_LIVE) return [...mockArticles];
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

/**
 * The public listing: published articles and the built-in posts as one list,
 * newest first. Built-in titles come back as i18n keys (`i18nKey`), because
 * only the page has the translator.
 */
export async function listPublicPosts(): Promise<(ArticleCard & { i18nKey?: string })[]> {
  let published: BlogArticle[] = [];
  if (!IS_LIVE) {
    published = mockArticles.filter((a) => a.status === "published");
  } else {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      const { data } = await supabaseAdmin()
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(100);
      published = (data ?? []).map(fromRow);
    } catch {
      published = [];
    }
  }

  const custom: (ArticleCard & { i18nKey?: string })[] = published.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    tags: a.tags,
    coverUrl: a.coverUrl,
    date: a.publishedAt ?? a.createdAt,
    readMins: readMinutes(a.body),
    custom: true,
  }));
  const builtin: (ArticleCard & { i18nKey?: string })[] = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    tags: p.tags,
    coverUrl: undefined,
    date: p.date,
    readMins: p.readMins,
    custom: false,
    i18nKey: `blog.post.${p.slug}`,
  }));

  return [...custom, ...builtin].sort((a, b) => b.date.localeCompare(a.date));
}

// -----------------------------------------------------------------------------
// Revisions
// -----------------------------------------------------------------------------

/** How many previous versions each post keeps. An undo, not an archive. */
export const MAX_REVISIONS = 10;

function snapshotRevisionMock(article: BlogArticle): void {
  mockRevisions.unshift({
    id: `rev_${mockRevisions.length + 1}_${Date.now() % 100000}`,
    postId: article.id,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    createdAt: new Date().toISOString(),
  });
  const mine = mockRevisions.filter((r) => r.postId === article.id);
  for (const extra of mine.slice(MAX_REVISIONS)) {
    mockRevisions.splice(mockRevisions.indexOf(extra), 1);
  }
}

async function snapshotRevisionLive(postId: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data: current } = await admin
      .from("blog_posts")
      .select("title, excerpt, body")
      .eq("id", postId)
      .maybeSingle();
    if (!current) return;
    await admin.from("blog_revisions").insert({
      post_id: postId,
      title: current.title,
      excerpt: current.excerpt ?? "",
      body: current.body ?? "",
    });
    // Trim beyond the cap. Two queries, but saves are rare and admin-only.
    const { data: all } = await admin
      .from("blog_revisions")
      .select("id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });
    const extra = (all ?? []).slice(MAX_REVISIONS).map((r) => r.id);
    if (extra.length) await admin.from("blog_revisions").delete().in("id", extra);
  } catch {
    // A missed snapshot must never block the save itself.
  }
}

export async function listRevisions(postId: string): Promise<BlogRevision[]> {
  if (!IS_LIVE) {
    return mockRevisions
      .filter((r) => r.postId === postId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_revisions")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(MAX_REVISIONS);
    return (data ?? []).map((r) => ({
      id: r.id,
      postId: r.post_id,
      title: r.title,
      excerpt: r.excerpt ?? "",
      body: r.body ?? "",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getRevision(id: string): Promise<BlogRevision | null> {
  if (!IS_LIVE) return mockRevisions.find((r) => r.id === id) ?? null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_revisions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      postId: data.post_id,
      title: data.title,
      excerpt: data.excerpt ?? "",
      body: data.body ?? "",
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Stats — views and "helpful", keyed by slug so built-ins count too
// -----------------------------------------------------------------------------

export async function bumpStat(slug: string, field: "views" | "helpful"): Promise<void> {
  if (!IS_LIVE) {
    const row = mockStats.get(slug) ?? { slug, views: 0, helpful: 0 };
    row[field] += 1;
    mockStats.set(slug, row);
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin.from("blog_stats").select("*").eq("slug", slug).maybeSingle();
    if (data) {
      await admin
        .from("blog_stats")
        .update({ [field]: (data[field] ?? 0) + 1 })
        .eq("slug", slug);
    } else {
      await admin.from("blog_stats").insert({ slug, [field]: 1 });
    }
  } catch {
    // A lost count is a lost count; the page must never notice.
  }
}

export async function getStats(slug: string): Promise<BlogStats> {
  if (!IS_LIVE) return mockStats.get(slug) ?? { slug, views: 0, helpful: 0 };
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_stats")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data
      ? { slug, views: data.views ?? 0, helpful: data.helpful ?? 0 }
      : { slug, views: 0, helpful: 0 };
  } catch {
    return { slug, views: 0, helpful: 0 };
  }
}

export async function getStatsMap(slugs: string[]): Promise<Map<string, BlogStats>> {
  const map = new Map<string, BlogStats>();
  if (slugs.length === 0) return map;
  if (!IS_LIVE) {
    for (const slug of slugs) {
      const row = mockStats.get(slug);
      if (row) map.set(slug, row);
    }
    return map;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin().from("blog_stats").select("*").in("slug", slugs);
    for (const r of data ?? []) {
      map.set(r.slug, { slug: r.slug, views: r.views ?? 0, helpful: r.helpful ?? 0 });
    }
    return map;
  } catch {
    return map;
  }
}

// -----------------------------------------------------------------------------
// Newsletter subscribers
// -----------------------------------------------------------------------------

export async function subscribeToBlog(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;

  if (!IS_LIVE) {
    const existing = mockSubs.find((s) => s.email === email);
    if (existing) {
      // Re-subscribing after an unsubscribe is a real intent — honour it.
      existing.unsubscribedAt = undefined;
      return true;
    }
    mockSubs.push({ email, createdAt: new Date().toISOString() });
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("blog_subscribers")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (data) {
      await admin.from("blog_subscribers").update({ unsubscribed_at: null }).eq("email", email);
    } else {
      await admin.from("blog_subscribers").insert({ email });
    }
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromBlog(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  if (!IS_LIVE) {
    const existing = mockSubs.find((s) => s.email === email);
    if (existing) existing.unsubscribedAt = new Date().toISOString();
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin()
      .from("blog_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email);
  } catch {
    // An unsubscribe that fails silently would keep emailing someone who said
    // stop — the route retries by being idempotent and cheap to click again.
  }
}

export async function listActiveSubscribers(): Promise<string[]> {
  if (!IS_LIVE) return mockSubs.filter((s) => !s.unsubscribedAt).map((s) => s.email);
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_subscribers")
      .select("email")
      .is("unsubscribed_at", null)
      .limit(5000);
    return (data ?? []).map((r) => r.email);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Scheduling, duplication, translations, related posts
// -----------------------------------------------------------------------------

/**
 * Publish every draft whose scheduled moment has passed. Called from the daily
 * cron and — because that is too coarse for a same-day schedule — from the
 * public listing read, where it costs one cheap check per request.
 */
export async function publishDuePosts(): Promise<number> {
  const now = new Date().toISOString();
  if (!IS_LIVE) {
    let n = 0;
    for (const a of mockArticles) {
      if (a.status === "draft" && a.scheduledAt && a.scheduledAt <= now) {
        a.status = "published";
        a.publishedAt = a.publishedAt ?? a.scheduledAt;
        a.scheduledAt = undefined;
        n += 1;
      }
    }
    return n;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_posts")
      .update({ status: "published", published_at: now, scheduled_at: null })
      .eq("status", "draft")
      .lte("scheduled_at", now)
      .select("id");
    return data?.length ?? 0;
  } catch {
    return 0;
  }
}

/** Clone as a fresh draft — the fastest way to reuse a post as a template. */
export async function duplicateArticle(id: string): Promise<BlogArticle | null> {
  const source = await getArticleById(id);
  if (!source) return null;
  // Probe for a free slug rather than failing on the first copy of a copy.
  for (let n = 0; n < 20; n += 1) {
    const suffix = n === 0 ? "copy" : `copy-${n + 1}`;
    const result = await createArticle({
      title: `Copy of ${source.title}`.slice(0, 140),
      slug: `${source.slug}-${suffix}`,
      excerpt: source.excerpt,
      body: source.body,
      coverUrl: source.coverUrl,
      author: source.author,
      tags: source.tags,
      lang: source.lang,
    });
    if (result.ok) return result.article;
    if (result.reason !== "slug-taken") return null;
  }
  return null;
}

/**
 * The language family of an article: the original plus every translation,
 * whichever member was asked about.
 */
export async function listTranslations(article: BlogArticle): Promise<BlogArticle[]> {
  const rootId = article.translationOf ?? article.id;
  if (!IS_LIVE) {
    return mockArticles.filter(
      (a) =>
        a.status === "published" &&
        a.id !== article.id &&
        (a.id === rootId || a.translationOf === rootId)
    );
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .or(`id.eq.${rootId},translation_of.eq.${rootId}`)
      .limit(10);
    return (data ?? []).map(fromRow).filter((a) => a.id !== article.id);
  } catch {
    return [];
  }
}

/**
 * "Read next": the posts sharing the most tags, newest first as a tiebreak.
 * Computed over the merged list so built-ins and articles recommend each other.
 */
export async function relatedPosts(
  slug: string,
  tags: string[],
  limit = 3
): Promise<(ArticleCard & { i18nKey?: string })[]> {
  const all = await listPublicPosts();
  const mine = new Set(tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      p,
      score: p.tags.filter((t) => mine.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .filter((x, i) => x.score > 0 || i < limit)
    .slice(0, limit)
    .map((x) => x.p);
}
