import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, FilePlus2, Globe2, Lock, Newspaper, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { BlogEditor } from "@/components/admin/blog-editor";
import { requireFinanceAdmin } from "@/lib/auth";
import { deleteArticleAction, setArticleStatusAction } from "@/lib/blog-actions";
import { getArticleById, listArticlesAdmin } from "@/lib/data/blog";
import { getAllPosts } from "@/content/blog";
import { readMinutes } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  path: "/admin/blog",
  noindex: true,
});

/**
 * The blog console: write, edit, publish, unpublish, delete. Guarded like
 * broadcast — publishing to the public site is outward-facing, so support
 * agents never see it.
 */
export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const user = await requireFinanceAdmin();
  const { t } = await getI18n();
  const sp = await searchParams;

  const editing = sp.edit ? await getArticleById(sp.edit) : null;
  const writing = !!sp.new || !!editing;
  const articles = await listArticlesAdmin();
  const builtin = getAllPosts();

  const editorLabels = {
    title: t("admin.blog.f.title"),
    slug: t("admin.blog.f.slug"),
    slugHint: t("admin.blog.f.slugHint"),
    excerpt: t("admin.blog.f.excerpt"),
    excerptHint: t("admin.blog.f.excerptHint"),
    author: t("admin.blog.f.author"),
    tags: t("admin.blog.f.tags"),
    tagsHint: t("admin.blog.f.tagsHint"),
    cover: t("admin.blog.f.cover"),
    coverHint: t("admin.blog.f.coverHint"),
    body: t("admin.blog.f.body"),
    bodyHint: t("admin.blog.f.bodyHint"),
    write: t("admin.blog.f.write"),
    preview: t("admin.blog.f.preview"),
    save: t("admin.blog.f.save"),
    saved: t("admin.blog.f.saved"),
  };

  return (
    <PortalShell user={user} nav={adminNav} title="admin.blog.title">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="text-sm font-semibold text-brand-700">
            ← {t("common.backToDash")}
          </Link>
          {writing ? (
            <Link href="/admin/blog" className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("admin.blog.backToList")}
            </Link>
          ) : (
            <Link
              href="/admin/blog?new=1"
              className={buttonVariants({ size: "sm" })}
              data-new-post
            >
              <FilePlus2 className="h-4 w-4" /> {t("admin.blog.new")}
            </Link>
          )}
        </div>

        {writing ? (
          <>
            <p className="text-sm text-navy-500">{t("admin.blog.editorSub")}</p>
            <BlogEditor article={editing} labels={editorLabels} />
          </>
        ) : (
          <>
            <p className="text-sm text-navy-500">{t("admin.blog.sub")}</p>

            {/* ------------------------------------------ client articles --- */}
            <section data-blog-articles>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
                <Newspaper className="h-5 w-5 text-navy-500" /> {t("admin.blog.yours")}
                <Badge tone="neutral">{articles.length}</Badge>
              </h2>
              {articles.length === 0 ? (
                <Card className="p-8 text-center text-navy-500">{t("admin.blog.empty")}</Card>
              ) : (
                <div className="space-y-3">
                  {articles.map((a) => (
                    <Card key={a.id} className="p-4" data-article={a.slug}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/blog?edit=${a.id}`}
                              className="font-bold text-navy-900 hover:text-brand-700"
                            >
                              {a.title}
                            </Link>
                            <Badge tone={a.status === "published" ? "go" : "neutral"}>
                              {a.status === "published"
                                ? t("admin.blog.published")
                                : t("admin.blog.draft")}
                            </Badge>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-navy-500">
                            /blog/{a.slug} · {formatDate(a.publishedAt ?? a.createdAt)} ·{" "}
                            {readMinutes(a.body)} {t("blog.min")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {a.status === "published" && (
                            <a
                              href={`/blog/${a.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({ variant: "ghost", size: "sm" })}
                              aria-label={t("admin.blog.view")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <form action={setArticleStatusAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={a.status === "published" ? "draft" : "published"}
                            />
                            <button
                              type="submit"
                              className={buttonVariants({
                                variant: a.status === "published" ? "outline" : "primary",
                                size: "sm",
                              })}
                              data-publish-toggle
                            >
                              <Globe2 className="h-4 w-4" />
                              {a.status === "published"
                                ? t("admin.blog.unpublish")
                                : t("admin.blog.publish")}
                            </button>
                          </form>
                          <form action={deleteArticleAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              aria-label={t("admin.blog.delete")}
                              className="inline-flex h-9 items-center rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* ---------------------------------------------- built-ins ----- */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
                <Lock className="h-5 w-5 text-navy-500" /> {t("admin.blog.builtin")}
                <Badge tone="neutral">{builtin.length}</Badge>
              </h2>
              <p className="mb-3 text-xs text-navy-500">{t("admin.blog.builtinSub")}</p>
              <div className="space-y-2">
                {builtin.map((p) => (
                  <Card key={p.slug} className="flex items-center justify-between gap-3 p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-800">{p.title}</p>
                      <p className="text-xs text-navy-400">/blog/{p.slug}</p>
                    </div>
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                      aria-label={t("admin.blog.view")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}
