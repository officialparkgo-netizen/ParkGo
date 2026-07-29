import { NextResponse } from "next/server";
import { bumpStat, getArticleBySlug, getStats } from "@/lib/data/blog";
import { getAllPosts } from "@/content/blog";

export const dynamic = "force-dynamic";

const BUILTIN = new Set(getAllPosts().map((p) => p.slug));

/**
 * Reader reactions, no account needed: a view ping when the page actually
 * renders (so Link prefetches never count), and a "was this helpful?" tap.
 * The client remembers in local/sessionStorage that it already fired; the
 * server only refuses slugs that do not exist, so junk cannot mint rows. A
 * determined double-voter gains a number on a blog post, which is not worth
 * an account wall.
 */
export async function POST(request: Request) {
  let slug = "";
  let kind = "helpful";
  try {
    const body = (await request.json()) as { slug?: string; kind?: string };
    slug = String(body.slug ?? "");
    kind = body.kind === "view" ? "view" : "helpful";
  } catch {
    /* fall through to the 400 */
  }
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const exists = BUILTIN.has(slug) || !!(await getArticleBySlug(slug));
  if (!exists) return NextResponse.json({ ok: false }, { status: 404 });

  await bumpStat(slug, kind === "view" ? "views" : "helpful");
  if (kind === "view") return NextResponse.json({ ok: true });
  const stats = await getStats(slug);
  return NextResponse.json({ ok: true, helpful: stats.helpful });
}
