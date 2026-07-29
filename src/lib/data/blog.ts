import type { BlogArticle } from "@/types";
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

const g = globalThis as unknown as { __parkgoBlog?: BlogArticle[] };
const mockArticles = (g.__parkgoBlog ??= []);

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
      id: `art_${mockArticles.length + 1}`,
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
    Object.assign(article, fields, { updatedAt: new Date().toISOString() });
    return { ok: true, article };
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
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
