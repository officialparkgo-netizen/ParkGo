import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, SITE } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getAllPosts, getPost } from "@/content/blog";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
  const post = getPost(slug);
  if (!post) notFound();

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
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Badge key={t} tone="brand">
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-navy-900 sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-navy-600">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy-100 pt-5 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" /> {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.readMins} min read
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Article */}
      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-2xl space-y-4 text-navy-700 leading-relaxed">
          {post.body.map((para, i) =>
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

        {/* CTA */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-navy-800 p-8 text-center">
          <Eyebrow className="text-go-300">Park Smart. Travel Easy.</Eyebrow>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            One booking for parking, transfer &amp; EV
          </h2>
          <p className="mt-2 text-navy-200">
            See verified spaces near your airport at one transparent price.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/travellers" className={buttonVariants({ variant: "primary" })}>
              Start a booking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/blog" className={buttonVariants({ variant: "white" })}>
              More articles
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
