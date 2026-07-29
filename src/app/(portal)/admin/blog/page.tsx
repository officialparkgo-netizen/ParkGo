import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  Globe2,
  Languages,
  Lock,
  Newspaper,
  Rss,
  ThumbsUp,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNavFor } from "@/components/portal/navs";
import { BlogEditor, type EditorLabels } from "@/components/admin/blog-editor";
import { requireContentAdmin } from "@/lib/auth";
import {
  deleteArticleAction,
  duplicateArticleAction,
  inviteWriterAction,
  removeWriterAction,
  setArticleStatusAction,
} from "@/lib/blog-actions";
import { resendTeamInviteAction } from "@/lib/admin-suite-actions";
import { getArticleById, getRevision, getStatsMap, listArticlesAdmin, listRevisions } from "@/lib/data/blog";
import { makePreviewToken } from "@/lib/blog-notify";
import { CopyLinkButton } from "@/components/common/copy-link-button";
import { inviteLinkFor } from "@/lib/team-invite-mail";
import { listAdminUsers } from "@/lib/data/users";
import { getAllPosts } from "@/content/blog";
import { readMinutes } from "@/lib/markdown";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  path: "/admin/blog",
  noindex: true,
});

/**
 * The blog console: write, edit, schedule, publish, unpublish, delete — and,
 * for full admins, invite the writers who do it. Guarded by
 * `requireContentAdmin`: full admins and invited writers get in, support
 * agents stay on the ticket desk.
 */
export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; rev?: string; team?: string }>;
}) {
  const user = await requireContentAdmin();
  const { t } = await getI18n();
  const sp = await searchParams;
  // Absent scope = full admin. Writers write; they do not mint other writers.
  const isFullAdmin = !user.adminScope;

  const editing = sp.edit ? await getArticleById(sp.edit) : null;
  const writing = !!sp.new || !!editing;
  const articles = await listArticlesAdmin();
  const builtin = getAllPosts();

  // A restore request: load the old version into the editor; saving makes it
  // current (and snapshots what it replaced, so a restore is also undoable).
  const revisions = editing ? await listRevisions(editing.id) : [];
  const revisionRaw = editing && sp.rev ? await getRevision(sp.rev) : null;
  const revision = revisionRaw && revisionRaw.postId === editing?.id ? revisionRaw : null;

  // Views and "helpful" for every slug on this screen, one query.
  const stats = await getStatsMap([
    ...articles.map((a) => a.slug),
    ...builtin.map((p) => p.slug),
  ]);

  // The writer team (full admins only).
  const writers = isFullAdmin
    ? (await listAdminUsers().catch(() => [])).filter((m) => m.adminScope === "content")
    : [];

  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

  const editorLabels: EditorLabels = {
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
    autosaved: t("admin.blog.f.autosaved"),
    schedule: t("admin.blog.f.schedule"),
    scheduleHint: t("admin.blog.f.scheduleHint"),
    language: t("admin.blog.f.language"),
    translationOf: t("admin.blog.f.translationOf"),
    translationNone: t("admin.blog.f.translationNone"),
    insertImage: t("admin.blog.f.insertImage"),
    insertImageNoStorage: t("admin.blog.f.insertImageNoStorage"),
    seoTitle: t("admin.blog.f.seoTitle"),
    seoChecks: [
      t("admin.blog.f.seoCheck1"),
      t("admin.blog.f.seoCheck2"),
      t("admin.blog.f.seoCheck3"),
      t("admin.blog.f.seoCheck4"),
      t("admin.blog.f.seoCheck5"),
    ],
    revisions: t("admin.blog.f.revisions"),
    revisionsHint: t("admin.blog.f.revisionsHint"),
    restore: t("admin.blog.f.restore"),
    restoring: t("admin.blog.f.restoring"),
  };

  return (
    <PortalShell user={user} nav={adminNavFor(user)} title="admin.blog.title">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isFullAdmin ? (
            <Link href="/admin" className="text-sm font-semibold text-brand-700">
              ← {t("common.backToDash")}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-navy-500">{t("admin.blog.writerHome")}</span>
          )}
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

        {/* Writer-invite outcomes, same banner language as the support team. */}
        {sp.team === "invited" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.team.invited")}
          </div>
        )}
        {sp.team === "resent" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.team.resent")}
          </div>
        )}
        {sp.team === "invited-nomail" && (
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-700" data-nomail>
            {t("admin.team.noMail")}
          </div>
        )}
        {sp.team === "removed" && (
          <div className="rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            {t("admin.team.removed")}
          </div>
        )}
        {sp.team === "peer" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("admin.team.peerBlocked")}
          </div>
        )}
        {sp.team === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("admin.team.error")}
          </div>
        )}

        {writing ? (
          <>
            <p className="text-sm text-navy-500">{t("admin.blog.editorSub")}</p>
            <BlogEditor
              article={editing}
              revision={revision}
              revisions={revisions}
              otherArticles={articles.map((a) => ({ id: a.id, title: a.title, lang: a.lang }))}
              labels={editorLabels}
            />
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
                  {articles.map((a) => {
                    const s = stats.get(a.slug);
                    const scheduled = a.status === "draft" && !!a.scheduledAt;
                    return (
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
                              {scheduled && (
                                <Badge tone="accent" data-scheduled>
                                  <CalendarClock className="mr-1 h-3 w-3" />
                                  {t("admin.blog.scheduled")} {formatDateTime(a.scheduledAt!)}
                                </Badge>
                              )}
                              {a.lang !== "en" && (
                                <Badge tone="navy">
                                  <Languages className="mr-1 h-3 w-3" />
                                  {a.lang.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-navy-500">
                              /blog/{a.slug} · {formatDate(a.publishedAt ?? a.createdAt)} ·{" "}
                              {readMinutes(a.body)} {t("blog.min")} ·{" "}
                              <Eye className="inline h-3 w-3" aria-hidden />{" "}
                              {s?.views ?? 0} {t("admin.blog.views")} ·{" "}
                              <ThumbsUp className="inline h-3 w-3" aria-hidden /> {s?.helpful ?? 0}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                            {a.status === "published" ? (
                              <a
                                href={`/blog/${a.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                                aria-label={t("admin.blog.view")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              // A signed link a colleague can open without a
                              // login; it dies the moment the post goes live.
                              <span
                                data-preview-link={`${base}/blog/${a.slug}?preview=${makePreviewToken(a.slug)}`}
                              >
                                <CopyLinkButton
                                  value={`${base}/blog/${a.slug}?preview=${makePreviewToken(a.slug)}`}
                                  label={t("admin.blog.previewLink")}
                                  copiedLabel={t("host.settings.icalCopied")}
                                />
                              </span>
                            )}
                            <form action={duplicateArticleAction}>
                              <input type="hidden" name="id" value={a.id} />
                              <button
                                type="submit"
                                aria-label={t("admin.blog.duplicate")}
                                title={t("admin.blog.duplicate")}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                                data-duplicate
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </form>
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
                    );
                  })}
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
                {builtin.map((p) => {
                  const s = stats.get(p.slug);
                  return (
                    <Card key={p.slug} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-800">{p.title}</p>
                        <p className="text-xs text-navy-400">
                          /blog/{p.slug} · <Eye className="inline h-3 w-3" aria-hidden />{" "}
                          {s?.views ?? 0} · <ThumbsUp className="inline h-3 w-3" aria-hidden />{" "}
                          {s?.helpful ?? 0}
                        </p>
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
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-navy-400">
                <Rss className="h-3.5 w-3.5" aria-hidden />
                {t("admin.blog.rssHint")}{" "}
                <a href="/blog/rss.xml" className="font-semibold text-brand-700" target="_blank" rel="noopener noreferrer">
                  /blog/rss.xml
                </a>
              </p>
            </section>

            {/* ---------------------------------------------- the writers --- */}
            {isFullAdmin && (
              <section id="writers" data-writers>
                <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
                  <UserPlus className="h-5 w-5 text-navy-500" /> {t("admin.blog.writers.title")}
                  <Badge tone="neutral">{writers.length}</Badge>
                </h2>
                <p className="mb-3 text-sm text-navy-500">{t("admin.blog.writers.sub")}</p>
                <Card className="divide-y divide-navy-100" data-writers-card>
                  {writers.length === 0 && (
                    <p className="p-4 text-sm text-navy-500">{t("admin.blog.writers.none")}</p>
                  )}
                  {writers.map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-navy-900">{m.name}</span>
                          <Badge tone="brand">{t("admin.blog.writers.badge")}</Badge>
                          {m.inviteNonce && (
                            <Badge tone="accent" data-invite-pending>
                              {t("admin.team.pending")}
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-navy-400">{m.email}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {m.inviteNonce && (
                          <>
                            <span data-invite-link={inviteLinkFor(m.id, m.inviteNonce)}>
                              <CopyLinkButton
                                value={inviteLinkFor(m.id, m.inviteNonce)}
                                label={t("admin.team.copyInvite")}
                                copiedLabel={t("host.settings.icalCopied")}
                              />
                            </span>
                            <form action={resendTeamInviteAction}>
                              <input type="hidden" name="userId" value={m.id} />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                              >
                                {t("admin.team.resend")}
                              </button>
                            </form>
                          </>
                        )}
                        <form action={removeWriterAction}>
                          <input type="hidden" name="userId" value={m.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-navy-500 hover:text-red-600"
                          >
                            {t("admin.team.remove")}
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  <form action={inviteWriterAction} className="flex flex-wrap items-end gap-2 p-4">
                    <div className="min-w-36 flex-1">
                      <label
                        htmlFor="writer-name"
                        className="mb-1 block text-xs font-semibold text-navy-500"
                      >
                        {t("host.settings.cohostName")}
                      </label>
                      <input
                        id="writer-name"
                        name="name"
                        className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                    <div className="min-w-52 flex-[1.5]">
                      <label
                        htmlFor="writer-email"
                        className="mb-1 block text-xs font-semibold text-navy-500"
                      >
                        {t("host.settings.cohostEmail")}
                      </label>
                      <input
                        id="writer-email"
                        name="email"
                        type="email"
                        required
                        placeholder="writer@parkgo.team"
                        className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                    <button type="submit" className={buttonVariants({ size: "sm" })} data-invite-writer>
                      <UserPlus className="h-4 w-4" /> {t("admin.blog.writers.invite")}
                    </button>
                  </form>
                </Card>
              </section>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}
