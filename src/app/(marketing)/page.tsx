import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Languages,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  CalendarCheck,
  Camera,
  CarTaxiFront,
  ChevronDown,
  LifeBuoy,
  Lock,
  MapPin,
  Plane,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Trophy,
  Warehouse,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SearchWidget } from "@/components/marketing/search-widget";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { FeatureCarousel } from "@/components/marketing/feature-carousel";
import { getAirports } from "@/lib/data/store";
import { LOCALES } from "@/lib/i18n/config";
import { StatCounter } from "@/components/marketing/stat-counter";
import { listAllSpaces } from "@/lib/data/hosts";
import { formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { COMPANY, SITE } from "@/lib/seo";

const KIND_ICONS = {
  airport: Plane,
  city: Building2,
  station: TrainFront,
  stadium: Trophy,
} as const;

export default async function HomePage() {
  const { t } = await getI18n();
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code, kind: a.kind, lat: a.lat, lng: a.lng }));

  // Popular destinations: live spaces + lowest daily price per destination.
  const allSpaces = await listAllSpaces();
  const destCards = getAirports()
    .map((a) => {
      const live = allSpaces.filter((s) => s.status === "live" && s.airportSlug === a.slug);
      return {
        slug: a.slug,
        name: a.name,
        kind: (a.kind ?? "airport") as keyof typeof KIND_ICONS,
        count: live.length,
        from: live.length ? Math.min(...live.map((s) => s.pricePerDay)) : null,
      };
    })
    .sort((x, y) => y.count - x.count)
    .slice(0, 8);

  // --- Structured data ------------------------------------------------------
  // Organization is what Google reads for the knowledge panel — the logo, the
  // legal name, how to reach support. WebSite with a SearchAction is what lets
  // a sitelinks search box appear under the result.
  const organisationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: COMPANY.legalName,
    url: SITE.url,
    logo: new URL("/icon.svg", SITE.url).toString(),
    image: new URL(SITE.ogImage, SITE.url).toString(),
    description: SITE.description,
    slogan: SITE.tagline,
    email: COMPANY.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: "128 City Road",
      addressLocality: "London",
      postalCode: "EC1V 2NX",
      addressCountry: "GB",
    },
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Ireland" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: COMPANY.supportEmail,
      availableLanguage: ["en", "ur", "hi", "de", "zh", "ar"],
    },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en-GB",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: new URL("/app/search?airport={search_term_string}", SITE.url).toString(),
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organisationLd, websiteLd]) }}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div
          className="drift pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="drift-slow pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-accent-300/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[3fr_2fr] lg:py-20">
          {/* Entrance runs top to bottom so the eye lands on the headline, then
              the search box — the two things the page is actually for. */}
          <div>
            <Badge tone="go" className="enter mb-5">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.hero.badge")}
            </Badge>
            <h1
              className="enter text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl"
              style={{ "--enter-delay": "60ms" } as React.CSSProperties}
            >
              {t("hero.title")}
            </h1>
            <p
              className="enter mt-5 max-w-xl text-lg text-navy-600"
              style={{ "--enter-delay": "130ms" } as React.CSSProperties}
            >
              {t("hero.subtitle")}
            </p>

            <div className="enter mt-7" style={{ "--enter-delay": "200ms" } as React.CSSProperties}>
              <SearchWidget airports={airports} />
            </div>

            <a
              href="#waitlist"
              className="link-underline enter group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-700"
              style={{ "--enter-delay": "280ms" } as React.CSSProperties}
            >
              {t("home.hero.waitlistLink")}{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
            </a>

            <p
              className="enter mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-navy-100 pt-5 text-sm text-navy-500"
              style={{ "--enter-delay": "350ms" } as React.CSSProperties}
            >
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-go-600" /> {t("home.hero.trust.hosts")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-go-600" /> {t("home.hero.trust.drivers")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-go-600" /> {t("home.hero.trust.camera")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-go-600" /> {t("home.hero.trust.cancel")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-go-600" /> {t("home.hero.trust.lang")}
              </span>
            </p>
          </div>

          <div
            className="enter relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]"
            style={{ "--enter-delay": "160ms" } as React.CSSProperties}
          >
            <Image
              src="/images/hero.webp"
              alt="ParkGo Airport Parking"
              fill
              sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 38vw, 100vw"
              className="object-cover rounded-2xl shadow-2xl"
              quality={90}
              priority
              unoptimized
            />
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Airports */}
      <div className="bg-gradient-to-br from-brand-700 to-navy-800">
        <Container className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
          <span className="text-sm font-semibold text-white/70">{t("home.airports.near")}</span>
          {airports.map((a) => (
            <Link
              key={a.slug}
              href={`/airports/${a.slug}`}
              // A 20px-tall row of links is a thumb-miss on a phone; the
              // padding brings each one to a comfortable target.
              className="-mx-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {a.name}
            </Link>
          ))}
        </Container>
      </div>

      {/* ---------------------------------------------- Popular destinations */}
      <Section className="bg-navy-50/50">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{t("home.dest.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("home.dest.heading")}
            </h2>
          </div>
          <p className="max-w-sm text-sm text-navy-500">{t("home.dest.sub")}</p>
        </div>
        <div className="reveal-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
          {destCards.map((d) => {
            const KindIcon = KIND_ICONS[d.kind];
            return (
              <Link
                key={d.slug}
                href={`/airports/${d.slug}`}
                className="card-hover group rounded-2xl border border-navy-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <KindIcon className="h-5 w-5" aria-hidden />
                  </span>
                  {d.count > 0 && (
                    <Badge tone="neutral">
                      {d.count} {t("home.dest.spaces")}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-3 font-bold text-navy-900 transition-colors group-hover:text-brand-700">
                  {d.name}
                </h3>
                <p className="mt-0.5 text-sm text-navy-500">
                  {d.from
                    ? `${t("home.dest.from")} ${formatMoney(d.from)}/${t("common.day")}`
                    : t("home.dest.comingSoon")}
                </p>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ------------------------------------------------------ Bundle value */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("home.bundle.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("home.bundle.heading")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("home.bundle.subcopy")}
          </p>
        </div>

        <div className="relative mx-auto mt-10 mb-10 w-full max-w-3xl h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/images/ev-charging.webp"
            alt="EV Charging at ParkGo host driveway"
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <FeatureCarousel
          label={t("home.bundle.heading")}
          items={[
            {
              icon: <MapPin className="h-5 w-5" />,
              iconClass: "bg-brand-50 text-brand-700",
              title: t("value.bundle.title"),
              body: t("value.bundle.body"),
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              iconClass: "bg-go-50 text-go-600",
              title: t("value.trust.title"),
              body: t("value.trust.body"),
            },
            {
              icon: <Radio className="h-5 w-5" />,
              iconClass: "bg-accent-50 text-accent-700",
              title: t("value.realtime.title"),
              body: t("value.realtime.body"),
            },
            {
              icon: <Zap className="h-5 w-5" />,
              iconClass: "bg-navy-50 text-navy-700",
              title: t("value.ev.title"),
              body: t("value.ev.body"),
            },
          ]}
        />
      </Section>

      {/* ----------------------------------------------------- How it works */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("home.how.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("home.how.heading")}
          </h2>
        </div>
        <ol className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", title: t("home.how.step1.title"), body: t("home.how.step1.body"), icon: MapPin },
            { n: "2", title: t("home.how.step2.title"), body: t("home.how.step2.body"), icon: CarTaxiFront },
            { n: "3", title: t("home.how.step3.title"), body: t("home.how.step3.body"), icon: QrCode },
          ].map((s) => (
            <li key={s.n} className="card-hover relative rounded-2xl bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-go-500 text-sm font-bold text-white">
                  {s.n}
                </span>
                <s.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <Link href="/how-it-works" className={buttonVariants({ variant: "outline" })}>
            {t("home.how.seeJourney")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ------------------------------------------------ Travel-day showcase */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("value.realtime.title")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("home.showcase.heading")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("home.showcase.subtitle")}
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Radio, title: t("home.showcase.location.title"), body: t("home.showcase.location.body") },
                { icon: Camera, title: t("home.showcase.camera.title"), body: t("home.showcase.camera.body") },
                { icon: BadgeCheck, title: t("home.showcase.handover.title"), body: t("home.showcase.handover.body") },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go-50 text-go-600">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">{f.title}</h3>
                    <p className="text-sm text-navy-600">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Photo and preview overlap into one object. Stacked, they read as
              two unrelated things and the card looks like it fell off. */}
          <div className="relative">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl sm:h-80 lg:h-96">
              <Image
                src="/images/showcase.webp"
                alt="Live tracking on ParkGo app"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative z-10 -mt-16 px-3 sm:-mt-20 sm:px-8">
              <TravelDayPreview t={t} large />
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------- Audiences */}
      <Section className="bg-navy-50/50">
        <div className="reveal-stagger grid gap-6 md:grid-cols-3">
          {[
            { href: "/travellers", title: t("home.audience.travellers.title"), body: t("home.audience.travellers.body"), cta: t("home.audience.travellers.cta"), tone: "brand" as const },
            { href: "/hosts", title: t("home.audience.hosts.title"), body: t("home.audience.hosts.body"), cta: t("home.audience.hosts.cta"), tone: "go" as const },
            { href: "/contact", title: t("home.audience.business.title"), body: t("home.audience.business.body"), cta: t("home.audience.business.cta"), tone: "accent" as const },
          ].map((a) => (
            <Card key={a.href} className="card-hover flex flex-col p-7">
              <h3 className="text-xl font-bold text-navy-900">{a.title}</h3>
              <p className="mt-2 flex-1 text-navy-600">{a.body}</p>
              <Link
                href={a.href}
                className={buttonVariants({
                  variant: a.tone === "go" ? "primary" : a.tone === "accent" ? "accent" : "navy",
                  className: "mt-5 w-full",
                })}
              >
                {a.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------- Guarantees */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("home.guarantee.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("home.guarantee.heading")}
          </h2>
        </div>
        <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: CalendarCheck, cls: "bg-go-50 text-go-600", title: t("home.guarantee.cancel.title"), body: t("home.guarantee.cancel.body") },
            { icon: Lock, cls: "bg-brand-50 text-brand-700", title: t("home.guarantee.secure.title"), body: t("home.guarantee.secure.body") },
            { icon: LifeBuoy, cls: "bg-accent-50 text-accent-700", title: t("home.guarantee.support.title"), body: t("home.guarantee.support.body") },
          ].map((g) => (
            <Card key={g.title} className="card-hover p-6">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${g.cls}`}>
                <g.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{g.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{g.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- Stats */}
      {/* Real numbers, counted from the same data the product runs on: the
          destination list and the locale registry. "100%" is policy, not a
          metric — a listing cannot go live before its host passes
          verification. The count-up is decoration; the server renders the
          final figures, so no-JS and reduced-motion readers see them as-is. */}
      <Section className="pt-0">
        <div className="reveal-stagger relative grid gap-8 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-10 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-navy-700/60">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -start-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
          />
          {[
            { k: String(getAirports().length), v: t("home.stats.airports") },
            { k: t("home.stats.onePrice"), v: t("home.stats.onePriceLabel") },
            { k: "100%", v: t("home.stats.verified") },
            { k: String(LOCALES.length), v: t("home.stats.languages") },
          ].map((s) => (
            <div key={s.v} className="relative lg:px-6">
              <div className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <StatCounter value={s.k} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-navy-200">{s.v}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ FAQ teaser */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("home.faq.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("home.faq.heading")}
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {([1, 2, 3] as const).map((n) => (
            <details
              key={n}
              className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
                {t(`travellers.faq.q${n}`)}
                <ChevronDown className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{t(`travellers.faq.a${n}`)}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/faq" className={buttonVariants({ variant: "outline" })}>
            {t("home.faq.all")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </Section>

      {/* ------------------------------------------------------ Closing CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 p-10 text-center sm:p-14">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("home.cta.heading")}
            </h2>
            <p className="mt-3 text-navy-200">{t("home.cta.sub")}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app/search" className={buttonVariants({ size: "lg" })}>
                <Search className="h-4 w-4" /> {t("home.cta.find")}
              </Link>
              <Link
                href="/hosts"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
                })}
              >
                <Warehouse className="h-4 w-4" /> {t("home.cta.host")}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- Waitlist */}
      <section
        id="waitlist"
        className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800"
      >
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="animate-fade-in mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              <Bell className="h-4 w-4" aria-hidden /> {t("waitlist.notify")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("waitlist.title")}
            </h2>
            <p className="mt-3 text-brand-100">{t("waitlist.body")}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
              <ShieldCheck className="h-4 w-4 text-go-200" aria-hidden />{" "}
              {t("waitlist.perk")}
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-100">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-100" aria-hidden />
              {t("waitlist.nospam")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Schematic travel-day preview: live mini-map + camera badge + driver chip. */
function TravelDayPreview({ t, large = false }: { t: (key: string) => string; large?: boolean }) {
  return (
    <div className={large ? "" : "hidden lg:block"}>
      <div className="relative mx-auto max-w-md rounded-[2rem] border border-navy-100 bg-white p-3 shadow-card-lg">
        {/* Mini map. Drawn as an actual street layout rather than a gradient —
            an orange rectangle with a dashed line through it reads as a
            placeholder, which is the opposite of the point of this section. */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-navy-950">
          <svg
            viewBox="0 0 320 220"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={t("home.preview.mapAlt")}
          >
            {/* park and water, so the ground is not a flat slab */}
            <path d="M232 150 h88 v70 h-88 z" fill="#16251C" />
            <path d="M0 0 h96 v40 H30 Q0 40 0 18 z" fill="#12202B" />
            {/* minor streets */}
            <g stroke="#22262C" strokeWidth="7" strokeLinecap="square">
              <path d="M0 58 H320 M0 118 H320 M0 178 H320" />
              <path d="M62 0 V220 M150 0 V220 M238 0 V220" />
            </g>
            {/* arterials */}
            <g stroke="#31363E" strokeWidth="13" strokeLinecap="square">
              <path d="M0 148 H320" />
              <path d="M196 0 V220" />
            </g>
            {/* the leg the driver is on */}
            <path
              d="M44 146 C 116 130, 140 66, 232 52"
              fill="none"
              stroke="#F26A1B"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.22"
            />
            <path
              className="route-flow"
              d="M44 146 C 116 130, 140 66, 232 52"
              fill="none"
              stroke="#F5843A"
              strokeWidth="4"
              strokeDasharray="14 8"
              strokeLinecap="round"
            />
            {/* pickup, then the car */}
            <circle cx="44" cy="146" r="6" fill="#0C0D0F" stroke="#fff" strokeWidth="3" />
            <circle cx="232" cy="52" r="13" fill="#F26A1B" opacity="0.28" />
            <circle cx="232" cy="52" r="7" fill="#F26A1B" stroke="#fff" strokeWidth="2.5" />
          </svg>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-go-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-go-500" />
            </span>
            {t("home.preview.live")}
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-white/95 p-2.5 shadow">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <CarTaxiFront className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-navy-900">Marek · SwiftLink Cars</div>
              <div className="text-navy-500">{t("home.preview.arriving")}</div>
            </div>
          </div>
        </div>
        {/* camera + handover row */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="relative h-24 overflow-hidden rounded-xl bg-navy-900">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <Camera className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-white/70" />
            {/* red-600, not red-500: at 10px this needs 4.5:1 and red-500
                only gets white to 3.76:1. */}
            <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              ● REC
            </span>
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/80">
              {t("home.preview.bay")}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-go-200 bg-go-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-go-700">
              <BadgeCheck className="h-4 w-4" /> {t("home.preview.handover")}
            </div>
            <div className="mt-1 font-mono text-lg font-bold tracking-widest text-navy-900">
              4K9PQ2
            </div>
            <div className="text-[10px] text-navy-500">{t("home.preview.confirmDriver")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
