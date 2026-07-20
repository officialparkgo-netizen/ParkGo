import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarCheck,
  Camera,
  CarTaxiFront,
  ChevronDown,
  LifeBuoy,
  Lock,
  MapPin,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
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
import { getI18n } from "@/lib/i18n";

export default async function HomePage() {
  const { t } = await getI18n();
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code, kind: a.kind }));

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-accent-300/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[3fr_2fr] lg:py-20">
          <div className="animate-fade-in">
            <Badge tone="go" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.hero.badge")}
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-600">{t("hero.subtitle")}</p>

            <div className="mt-7">
              <SearchWidget airports={airports} />
            </div>

            <a
              href="#waitlist"
              className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t("home.hero.waitlistLink")}{" "}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </a>

            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-navy-100 pt-5 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-go-500" /> {t("home.hero.trust.hosts")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-go-500" /> {t("home.hero.trust.drivers")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-go-500" /> {t("home.hero.trust.camera")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-go-500" /> {t("home.hero.trust.cancel")}
              </span>
            </p>
          </div>

          <div className="relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]">
            <Image
              src="/images/hero.png"
              alt="ParkGo Airport Parking"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Airports */}
      <div className="border-y border-navy-100 bg-white">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5">
          <span className="text-sm font-semibold text-navy-400">{t("home.airports.near")}</span>
          {airports.map((a) => (
            <Link
              key={a.slug}
              href={`/airports/${a.slug}`}
              className="text-sm font-semibold text-navy-700 hover:text-brand-600"
            >
              {a.name}
            </Link>
          ))}
        </Container>
      </div>

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

        <FeatureCarousel
          label={t("home.bundle.heading")}
          items={[
            {
              icon: <MapPin className="h-5 w-5" />,
              iconClass: "bg-brand-50 text-brand-600",
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
              iconClass: "bg-accent-50 text-accent-500",
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
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
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
                <s.icon className="h-5 w-5 text-brand-500" />
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
          <TravelDayPreview t={t} large />
        </div>
      </Section>

      {/* ----------------------------------------------------- Audiences */}
      <Section className="bg-navy-50/50">
        <div className="grid gap-6 md:grid-cols-3">
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
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: CalendarCheck, cls: "bg-go-50 text-go-600", title: t("home.guarantee.cancel.title"), body: t("home.guarantee.cancel.body") },
            { icon: Lock, cls: "bg-brand-50 text-brand-600", title: t("home.guarantee.secure.title"), body: t("home.guarantee.secure.body") },
            { icon: LifeBuoy, cls: "bg-accent-50 text-accent-500", title: t("home.guarantee.support.title"), body: t("home.guarantee.support.body") },
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
      <Section className="pt-0">
        <div className="grid gap-8 rounded-2xl bg-navy-800 p-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "8", v: t("home.stats.airports") },
            { k: t("home.stats.onePrice"), v: t("home.stats.onePriceLabel") },
            { k: "100%", v: t("home.stats.verified") },
            { k: "5", v: t("home.stats.languages") },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-4xl font-extrabold text-white">{s.k}</div>
              <div className="mt-1 text-sm text-navy-200">{s.v}</div>
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
              <ShieldCheck className="h-4 w-4 text-go-300" aria-hidden />{" "}
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
        {/* mini map */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-navy-700">
          <div className="absolute inset-0 bg-grid opacity-30" />
          {/* route */}
          <svg viewBox="0 0 320 220" className="absolute inset-0 h-full w-full">
            <path
              d="M40 180 C 120 160, 140 80, 230 60"
              fill="none"
              stroke="#F26A1B"
              strokeWidth="3"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <circle cx="40" cy="180" r="7" fill="#fff" />
            <circle cx="230" cy="60" r="9" fill="#15171A" stroke="#fff" strokeWidth="3" />
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
            <span className="absolute right-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
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
