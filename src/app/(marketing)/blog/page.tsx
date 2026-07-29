import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Rss, Search } from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMetadata, SITE } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { listPublicPosts, publishDuePosts } from "@/lib/data/blog";
import { SubscribeForm } from "@/components/blog/reader";
import { getI18n } from "@/lib/i18n";

export const metadata = {
  ...pageMetadata({
    title: "Blog — smarter airport parking & travel",
    description:
      "Guides and insight from ParkGo on airport parking, licensed transfers, EV charging and how we keep hosts, drivers and travellers safe.",
    path: "/blog",
  }),
  alternates: {
    canonical: new URL("/blog", SITE.url).toString(),
    // Feed readers autodiscover the RSS feed from this <link> tag.
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

const DATE_LOCALE: Record<string, string> = {
  en: "en-GB",
  ur: "ur-PK",
  hi: "hi-IN",
  de: "de-DE",
  zh: "zh-CN",
};

const PER_PAGE = 12;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string; page?: string }>;
}) {
  const { t, locale } = await getI18n();
  const sp = await searchParams;
  const dateLocale = DATE_LOCALE[locale] ?? "en-GB";

  // The daily cron is too coarse for a 3pm schedule — the listing read is
  // where a due draft actually goes live. One cheap indexed check.
  await publishDuePosts().catch(() => {});

  // Admin-written articles and the built-in launch posts, one list, newest
  // first. Built-ins resolve their title through the translator; articles are
  // the client's own words and render as written.
  const posts = await listPublicPosts();
  const title = (p: (typeof posts)[number]) => (p.i18nKey ? t(`${p.i18nKey}.title`) : p.title);
  const excerpt = (p: (typeof posts)[number]) =>
    p.i18nKey ? t(`${p.i18nKey}.excerpt`) : p.excerpt;

  // ---- Tag filter + search, straight off the URL so results are shareable.
  const activeTag = (sp.tag ?? "").trim().toLowerCase();
  const q = (sp.q ?? "").trim().toLowerCase();
  const tagCounts = new Map<string, { label: string; n: number }>();
  for (const p of posts) {
    for (const tag of p.tags) {
      const key = tag.toLowerCase();
      const row = tagCounts.get(key) ?? { label: tag, n: 0 };
      row.n += 1;
      tagCounts.set(key, row);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label))
    .slice(0, 8);

  const filtered = posts.filter((p) => {
    if (activeTag && !p.tags.some((tag) => tag.toLowerCase() === activeTag)) return false;
    if (q && !`${title(p)} ${excerpt(p)} ${p.tags.join(" ")}`.toLowerCase().includes(q))
      return false;
    return true;
  });

  // ---- Pagination. The featured card only fronts the unfiltered first page.
  const showFeatured = !activeTag && !q;
  const featured = showFeatured ? filtered[0] : undefined;
  const restAll = showFeatured ? filtered.slice(1) : filtered;
  const pageCount = Math.max(1, Math.ceil(restAll.length / PER_PAGE));
  const page = Math.min(pageCount, Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1));
  const rest = restAll.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (activeTag) params.set("tag", activeTag);
    if (q) params.set("q", q);
    if (n > 1) params.set("page", String(n));
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{t("blog.hero.eyebrow")}</Eyebrow>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
              {t("blog.hero.title")}
            </h1>
            <p className="mt-5 text-lg text-navy-600">{t("blog.hero.subtitle")}</p>

            {/* Search + tags: a GET form, so the URL carries the state. */}
            <form action="/blog" method="get" className="mt-7" data-blog-search>
              {activeTag && <input type="hidden" name="tag" value={activeTag} />}
              <div className="relative mx-auto max-w-md">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                  aria-hidden
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={sp.q ?? ""}
                  placeholder={t("blog.searchPlaceholder")}
                  aria-label={t("blog.searchPlaceholder")}
                  className="h-11 w-full rounded-xl border border-navy-200 bg-white pl-10 pr-4 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </form>
            {topTags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5" data-blog-tags>
                <Link
                  href={q ? `/blog?q=${encodeURIComponent(q)}` : "/blog"}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !activeTag
                      ? "bg-navy-900 text-white"
                      : "bg-white text-navy-600 ring-1 ring-navy-200 hover:text-brand-700"
                  }`}
                >
                  {t("blog.filterAll")}
                </Link>
                {topTags.map(([key, tag]) => (
                  <Link
                    key={key}
                    href={`/blog?tag=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeTag === key
                        ? "bg-navy-900 text-white"
                        : "bg-white text-navy-600 ring-1 ring-navy-200 hover:text-brand-700"
                    }`}
                  >
                    {tag.label} <span className="opacity-60">{tag.n}</span>
                  </Link>
                ))}
                <a
                  href="/blog/rss.xml"
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 ring-1 ring-navy-200 transition hover:text-brand-700"
                  aria-label={t("blog.rss")}
                  title={t("blog.rss")}
                >
                  <Rss className="h-3 w-3" /> RSS
                </a>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Featured */}
      {featured && page === 1 && (
        <Section className="pb-0">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <Card className="grid items-stretch overflow-hidden lg:grid-cols-2">
              <div className="relative min-h-[14rem] bg-gradient-to-br from-brand-600 to-navy-700">
                {featured.coverUrl ? (
                  <Image
                    src={featured.coverUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
                )}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                  {featured.tags.slice(0, 2).map((t) => (
                    <Badge key={t} tone="go" className="bg-white/95">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-9">
                <p className="flex items-center gap-x-4 text-sm text-navy-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> {formatDate(featured.date, dateLocale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {featured.readMins} {t("blog.minRead")}
                  </span>
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy-900 group-hover:text-brand-700 sm:text-3xl">
                  {title(featured)}
                </h2>
                <p className="mt-3 text-navy-600">{excerpt(featured)}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand-700">
                  {t("blog.readArticle")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Card>
          </Link>
        </Section>
      )}

      {/* ---------------------------------------------------------- Grid */}
      <Section>
        {rest.length === 0 && !featured ? (
          <Card className="p-10 text-center text-navy-500" data-no-results>
            {t("blog.noResults")}
          </Card>
        ) : (
          <div className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-navy-700 to-brand-500">
                    {post.coverUrl ? (
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
                    )}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 1).map((t) => (
                        <Badge key={t} tone="brand" className="bg-white/95">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex items-center gap-x-3 text-xs text-navy-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.date, dateLocale)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {post.readMins} {t("blog.min")}
                      </span>
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-navy-900 group-hover:text-brand-700">
                      {title(post)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-navy-600">{excerpt(post)}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                      {t("blog.readMore")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------ Pagination */}
        {pageCount > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3" data-pagination>
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-brand-400 hover:text-brand-700"
              >
                ← {t("blog.pagePrev")}
              </Link>
            )}
            <span className="text-sm font-semibold text-navy-500">
              {page} / {pageCount}
            </span>
            {page < pageCount && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-brand-400 hover:text-brand-700"
              >
                {t("blog.pageNext")} →
              </Link>
            )}
          </nav>
        )}

        {/* ------------------------------------------------------ Newsletter */}
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
      </Section>
    </>
  );
}
