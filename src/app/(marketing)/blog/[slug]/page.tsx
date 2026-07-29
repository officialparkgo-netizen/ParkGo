import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, SITE } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getAllPosts, getPost } from "@/content/blog";
import { getArticleBySlug } from "@/lib/data/blog";
import { readMinutes, renderMarkdown } from "@/lib/markdown";
import { getI18n } from "@/lib/i18n";

const DATE_LOCALE: Record<string, string> = {
  en: "en-GB",
  ur: "ur-PK",
  hi: "hi-IN",
  de: "de-DE",
  zh: "zh-CN",
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
    return pageMetadata({
      title: article.title,
      description: article.excerpt,
      path: `/blog/${slug}`,
      image: article.coverUrl,
    });
  }
  const post = getPost(slug);
  if (!post) {
    return pageMetadata({ title: "Article", path: `/blog/${slug}` });
  }
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Drafts 404 here on purpose: the data layer only returns published
  // articles to this page, so an unpublished URL is indistinguishable from a
  // nonexistent one — a draft leaking through a guessed link would be worse.
  const article = await getArticleBySlug(slug);
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
  const body = article ? [] : t("blog.post." + slug + ".body").split("\n\n");

  const url = new URL(`/blog/${slug}`, SITE.url).toString();
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    keywords: post.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

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
                <Badge key={tag} tone="brand">
                  {tag}
                </Badge>
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
        {article ? (
          <article
            className="prose-blog mx-auto max-w-2xl"
            // Safe: renderMarkdown escapes before transforming (src/lib/markdown.ts).
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
          />
        ) : (
          <article className="mx-auto max-w-2xl space-y-4 text-navy-700 leading-relaxed">
            {body.map((para, i) =>
              para.startsWith("## ") ? (
                <h2
                  key={i}
                  className="!mt-10 text-2xl font-bold tracking-tight text-navy-900"
                >
                  {para.slice(3)}
                </h2>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </article>
        )}

        {/* CTA */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-navy-800 p-8 text-center">
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
      </Container>
    </>
  );
}
