import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Languages,
  List,
  UserRound,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, SITE } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getAllPosts, getPost } from "@/content/blog";
import {
  getArticleBySlug,
  getStats,
  listTranslations,
  relatedPosts,
} from "@/lib/data/blog";
import { verifyPreviewToken } from "@/lib/blog-notify";
import { extractHeadings, readMinutes, renderMarkdown, slugify } from "@/lib/markdown";
import {
  HelpfulButton,
  ReadingProgress,
  ShareRow,
  SubscribeForm,
  ViewPing,
} from "@/components/blog/reader";
import { getI18n } from "@/lib/i18n";

const DATE_LOCALE: Record<string, string> = {
  en: "en-GB",
  ur: "ur-PK",
  hi: "hi-IN",
  de: "de-DE",
  zh: "zh-CN",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ur: "اردو",
  hi: "हिन्दी",
  de: "Deutsch",
  zh: "中文",
};

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Admin-written articles first; the built-ins keep their slugs for good, so
  // the two can never collide (the editor refuses built-in slugs).
  const article = await getArticleBySlug(slug);
  if (article) {
    const meta = pageMetadata({
      title: article.title,
      description: article.excerpt,
      path: `/blog/${slug}`,
      image: article.coverUrl,
    });
    // hreflang for the language family, so search engines serve the reader
    // the version written in their language rather than a translation of it.
    const translations = await listTranslations(article).catch(() => []);
    if (translations.length > 0) {
      const languages: Record<string, string> = {
        [article.lang]: new URL(`/blog/${slug}`, SITE.url).toString(),
      };
      for (const tr of translations) {
        languages[tr.lang] = new URL(`/blog/${tr.slug}`, SITE.url).toString();
      }
      meta.alternates = { ...meta.alternates, languages };
    }
    return meta;
  }
  const post = getPost(slug);
  if (!post) {
    // Unpublished (or nonexistent) — previews included. Never indexable.
    return pageMetadata({ title: "Article", path: `/blog/${slug}`, noindex: true });
  }
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  // Drafts 404 here on purpose: the data layer only returns published
  // articles to this page, so an unpublished URL is indistinguishable from a
  // nonexistent one. The single exception is a signed preview link — the
  // token is bound to the slug and checked in constant time, and it stops
  // mattering the moment the post is published.
  let article = await getArticleBySlug(slug);
  let previewing = false;
  if (!article && sp.preview && verifyPreviewToken(slug, sp.preview)) {
    article = await getArticleBySlug(slug, { drafts: true });
    previewing = !!article;
  }
  const builtinPost = article ? null : getPost(slug);
  if (!article && !builtinPost) notFound();

  const { t, locale } = await getI18n();
  const dateLocale = DATE_LOCALE[locale] ?? "en-GB";

  const post = article
    ? {
        title: article.title,
        excerpt: article.excerpt,
        author: article.author,
        date: article.publishedAt ?? article.createdAt,
        readMins: readMinutes(article.body),
        tags: article.tags,
      }
    : {
        title: builtinPost!.title,
        excerpt: builtinPost!.excerpt,
        author: builtinPost!.author,
        date: builtinPost!.date,
        readMins: builtinPost!.readMins,
        tags: builtinPost!.tags,
      };
  const heading = article ? article.title : t("blog.post." + slug + ".title");
  const standfirst = article ? article.excerpt : t("blog.post." + slug + ".excerpt");
  const builtinBody = article ? "" : t("blog.post." + slug + ".body");
  const body = article ? [] : builtinBody.split("\n\n");

  // "On this page" — from the same source each render path uses, so the
  // anchor ids always match the headings on screen.
  const headings = extractHeadings(article ? article.body : builtinBody).filter(
    (h) => h.level === 2
  );

  // Reader extras. Previews skip them all: no counting, no related, no
  // sharing a URL that will 404 for everyone else.
  const [stats, related, translations] = previewing
    ? [null, [], []]
    : await Promise.all([
        getStats(slug).catch(() => null),
        relatedPosts(slug, post.tags).catch(() => []),
        article ? listTranslations(article).catch(() => []) : Promise.resolve([]),
      ]);

  const url = new URL(`/blog/${slug}`, SITE.url).toString();
  const isTeamAuthor = /team/i.test(post.author);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: article?.updatedAt ?? post.date,
    author: {
      "@type": isTeamAuthor ? "Organization" : "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    keywords: post.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  // The in-article CTA card — rendered at the end of every post, and wherever
  // the author drops a paragraph containing exactly `[cta]`.
  const ctaCard = (
    <div className="not-prose mx-auto my-10 max-w-2xl rounded-2xl bg-navy-800 p-8 text-center">
      <Eyebrow className="text-go-100">{t("blog.cta.eyebrow")}</Eyebrow>
      <h2 className="text-2xl font-bold tracking-tight text-white">{t("blog.cta.title")}</h2>
      <p className="mt-2 text-navy-200">{t("blog.cta.body")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/travellers" className={buttonVariants({ variant: "primary" })}>
          {t("blog.cta.start")} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/blog" className={buttonVariants({ variant: "white" })}>
          {t("blog.cta.more")}
        </Link>
      </div>
    </div>
  );

  // `[cta]` on a line of its own splits the article around the card.
  const segments = article ? article.body.split(/^\s*\[cta\]\s*$/m) : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <ReadingProgress />
      {!previewing && <ViewPing slug={slug} />}

      {previewing && (
        <div className="bg-accent-500 px-4 py-2.5 text-center text-sm font-bold text-white" data-preview-banner>
          {t("blog.previewBanner")}
        </div>
      )}

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-16">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> {t("blog.backToBlog")}
            </Link>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}>
                  <Badge tone="brand">{tag}</Badge>
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-navy-900 sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-4 text-lg text-navy-600">{standfirst}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy-100 pt-5 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" /> {t("blog.by")} {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {formatDate(post.date, dateLocale)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.readMins} {t("blog.minRead")}
              </span>
            </div>

            {/* Other languages this article exists in. */}
            {translations.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-navy-600" data-translations>
                <Languages className="h-4 w-4 text-navy-400" aria-hidden />
                <span className="font-semibold">{t("blog.alsoIn")}:</span>
                {translations.map((tr) => (
                  <Link
                    key={tr.id}
                    href={`/blog/${tr.slug}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {LANG_NAMES[tr.lang] ?? tr.lang}
                  </Link>
                ))}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Article */}
      <Container className="py-12 sm:py-16">
        {article?.coverUrl && (
          <div className="relative mx-auto mb-10 aspect-[2/1] max-w-3xl overflow-hidden rounded-2xl">
            <Image
              src={article.coverUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* On this page */}
        {headings.length >= 2 && (
          <nav
            className="mx-auto mb-8 max-w-2xl rounded-2xl border border-navy-100 bg-navy-50/50 p-5"
            aria-label={t("blog.toc")}
            data-toc
          >
            <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              <List className="h-4 w-4 text-navy-500" /> {t("blog.toc")}
            </p>
            <ul className="mt-2 space-y-1">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-sm font-medium text-navy-600 hover:text-brand-700"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {article ? (
          segments.map((segment, i) => (
            <div key={i}>
              {i > 0 && ctaCard}
              <article
                className="prose-blog mx-auto max-w-2xl"
                // Safe: renderMarkdown escapes before transforming (src/lib/markdown.ts).
                dangerouslySetInnerHTML={{ __html: renderMarkdown(segment) }}
              />
            </div>
          ))
        ) : (
          <article className="mx-auto max-w-2xl space-y-4 text-navy-700 leading-relaxed">
            {body.map((para, i) =>
              para.startsWith("## ") ? (
                <h2
                  key={i}
                  id={slugify(para.slice(3))}
                  className="!mt-10 scroll-mt-24 text-2xl font-bold tracking-tight text-navy-900"
                >
                  {para.slice(3)}
                </h2>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </article>
        )}

        {/* Author, reactions, share — the post's footer row. */}
        <div className="mx-auto mt-10 max-w-2xl space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-5" data-author>
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-extrabold text-white"
              aria-hidden
            >
              {post.author.replace(/^the\s+/i, "").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-navy-900">{post.author}</p>
              <p className="text-sm text-navy-500">{t("blog.authorTeam")}</p>
            </div>
          </div>

          {!previewing && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-5">
              <HelpfulButton
                slug={slug}
                initial={stats?.helpful ?? 0}
                labels={{
                  ask: t("blog.helpfulAsk"),
                  button: t("blog.helpfulBtn"),
                  thanks: t("blog.helpfulThanks"),
                }}
              />
              <ShareRow
                url={url}
                title={post.title}
                labels={{
                  share: t("blog.share"),
                  copy: t("blog.shareCopy"),
                  copied: t("blog.shareCopied"),
                }}
              />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mx-auto mt-12 max-w-2xl">{ctaCard}</div>

        {/* ------------------------------------------------------ Read next */}
        {related.length > 0 && (
          <div className="mx-auto mt-14 max-w-4xl" data-related>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-navy-900">
              {t("blog.related")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block h-full">
                  <Card className="flex h-full flex-col p-5">
                    <p className="text-xs text-navy-500">
                      {formatDate(p.date, dateLocale)} · {p.readMins} {t("blog.min")}
                    </p>
                    <h3 className="mt-1.5 flex-1 font-bold leading-snug text-navy-900 group-hover:text-brand-700">
                      {p.i18nKey ? t(`${p.i18nKey}.title`) : p.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      {t("blog.readMore")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ Newsletter */}
        {!previewing && (
          <div className="mx-auto mt-12 max-w-2xl">
            <SubscribeForm
              labels={{
                title: t("blog.sub.title"),
                sub: t("blog.sub.sub"),
                placeholder: t("blog.sub.placeholder"),
                button: t("blog.sub.button"),
                ok: t("blog.sub.ok"),
                error: t("blog.sub.error"),
              }}
            />
          </div>
        )}
      </Container>
    </>
  );
}
