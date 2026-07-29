import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { listPublicPosts } from "@/lib/data/blog";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "Blog — smarter airport parking & travel",
  description:
    "Guides and insight from ParkGo on airport parking, licensed transfers, EV charging and how we keep hosts, drivers and travellers safe.",
  path: "/blog",
});

const DATE_LOCALE: Record<string, string> = {
  en: "en-GB",
  ur: "ur-PK",
  hi: "hi-IN",
  de: "de-DE",
  zh: "zh-CN",
};

export default async function BlogIndexPage() {
  const { t, locale } = await getI18n();
  const dateLocale = DATE_LOCALE[locale] ?? "en-GB";
  // Admin-written articles and the built-in launch posts, one list, newest
  // first. Built-ins resolve their title through the translator; articles are
  // the client's own words and render as written.
  const posts = await listPublicPosts();
  const title = (p: (typeof posts)[number]) => (p.i18nKey ? t(`${p.i18nKey}.title`) : p.title);
  const excerpt = (p: (typeof posts)[number]) =>
    p.i18nKey ? t(`${p.i18nKey}.excerpt`) : p.excerpt;
  const [featured, ...rest] = posts;

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
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Featured */}
      {featured && (
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
      </Section>
    </>
  );
}
