import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CarTaxiFront,
  Clock,
  HelpCircle,
  MapPin,
  Plane,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { Stars } from "@/components/common/stars";
import { pageMetadata, SITE } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";
import { getAirport, getAirports, searchSpaces } from "@/lib/data/store";
import { formatMoneyShort } from "@/lib/utils";
import type { SearchResult } from "@/types";

export async function generateStaticParams() {
  return getAirports().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const airport = getAirport(slug);
  if (!airport) {
    return pageMetadata({
      title: "Airport parking",
      description: "Find verified airport parking with a licensed transfer and EV charging in one booking.",
      path: `/airports/${slug}`,
    });
  }
  const results = searchSpaces({ airportSlug: slug });
  const currency = airport.country === "IE" ? "EUR" : "GBP";
  const min = minPrice(results);
  const priceHint = min != null ? ` from ${formatMoneyShort(min, currency)}/day` : "";
  return pageMetadata({
    title: `${airport.name} Airport Parking — Park, Transfer & EV | ParkGo`,
    description: `Book verified ${airport.name} (${airport.code}) airport parking${priceHint} with a licensed terminal transfer, EV charging and live security — one booking, one transparent price. ${SITE.tagline}`,
    path: `/airports/${slug}`,
  });
}

function minPrice(results: SearchResult[]): number | null {
  if (results.length === 0) return null;
  return Math.min(...results.map((r) => r.space.pricePerDay));
}

export default async function AirportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t } = await getI18n();
  const { slug } = await params;
  const airport = getAirport(slug);
  if (!airport) notFound();

  const results = searchSpaces({ airportSlug: slug });
  const currency = airport.country === "IE" ? "EUR" : "GBP";
  const min = minPrice(results);
  const evCount = results.filter((r) => r.space.evCharger).length;
  const camCount = results.filter((r) => r.space.liveCamera).length;
  const countryLabel = airport.country === "IE" ? t("airport.countryIE") : t("airport.countryUK");
  // English FAQs for JSON-LD (SEO). Kept in English on purpose.
  const faqs = buildFaqs(airport.name, airport.code, min, currency, evCount);
  // Localized FAQs for the visible section.
  const faqsLocalized = buildFaqsLocalized(t, airport.name, airport.code, min, currency, evCount);

  // --- Structured data (Breadcrumb + Place with aggregateOffer) -------------
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Airport parking",
        item: new URL("/airports", SITE.url).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${airport.name} parking`,
        item: new URL(`/airports/${slug}`, SITE.url).toString(),
      },
    ],
  };

  const placeLd = {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: airport.name,
    iataCode: airport.code,
    address: {
      "@type": "PostalAddress",
      addressLocality: airport.city,
      addressCountry: airport.country === "IE" ? "IE" : "GB",
    },
    geo: { "@type": "GeoCoordinates", latitude: airport.lat, longitude: airport.lng },
    ...(min != null
      ? {
          makesOffer: {
            "@type": "AggregateOffer",
            name: `${airport.name} airport parking`,
            priceCurrency: currency,
            lowPrice: (min / 100).toFixed(2),
            offerCount: results.length,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, placeLd, faqLd]) }}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-navy-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-brand-700">
                  {t("airport.home")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-navy-600">
                {airport.name} {t("airport.parkingSuffix")}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge tone="brand" className="mb-5">
                <Plane className="h-3.5 w-3.5" /> {airport.code} · {airport.city}, {countryLabel}
              </Badge>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
                {airport.name} {t("airport.heroTitleSuffix")}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-navy-600">
                {t("airport.heroSubtitleA")}
                {airport.name}
                {t("airport.heroSubtitleB")}
              </p>

              {min != null && (
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-navy-500">
                    {t("airport.parkingFrom")}
                  </span>
                  <span className="text-3xl font-extrabold text-go-600">
                    {formatMoneyShort(min, currency)}
                  </span>
                  <span className="text-sm font-semibold text-navy-500">{t("common.perDay")}</span>
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/app/search?airport=${slug}`}
                  className={buttonVariants({ variant: "primary", size: "lg" })}
                >
                  {t("airport.findParkingAt")} {airport.code} <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#spaces" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {t("airport.seeAvailableSpaces")}
                </a>
              </div>

              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-go-500" /> {t("airport.verifiedHosts")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-go-500" /> {t("airport.licensedDrivers")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-go-500" /> {t("airport.liveCameraCctv")}
                </span>
              </p>
            </div>

            {/* At-a-glance facts card */}
            <Card className="p-6 sm:p-8">
              <Eyebrow>{t("airport.atAGlance")}</Eyebrow>
              <h2 className="text-xl font-bold text-navy-900">
                {t("airport.parkingNear")} {airport.name} ({airport.code})
              </h2>
              <dl className="mt-6 grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-sm text-navy-500">{t("airport.factSpaces")}</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{results.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">{t("airport.factFrom")}</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">
                    {min != null
                      ? `${formatMoneyShort(min, currency)}/${t("common.day")}`
                      : t("airport.comingSoon")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">{t("airport.factEv")}</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{evCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">{t("airport.factCamera")}</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{camCount}</dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-navy-100 pt-5">
                <dt className="text-sm font-semibold text-navy-500">
                  {t("airport.terminalsServed")}
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {airport.terminals.map((t) => (
                    <Badge key={t} tone="navy">
                      {t}
                    </Badge>
                  ))}
                </dd>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------- Available spaces */}
      <Section id="spaces">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("airport.availableNow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("airport.spacesHeadingA")} {airport.name}
          </h2>
          <p className="mt-4 text-navy-600">{t("airport.spacesBody")}</p>
        </div>

        {results.length === 0 ? (
          <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
            <Plane className="mx-auto h-8 w-8 text-brand-500" />
            <h3 className="mt-4 text-lg font-bold text-navy-900">
              {t("airport.emptyTitleA")} {airport.name}
            </h3>
            <p className="mt-2 text-navy-600">
              {t("airport.emptyBodyA")} {airport.code} {t("airport.emptyBodyB")}
            </p>
            <Link href="/#waitlist" className={buttonVariants({ variant: "navy", className: "mt-5" })}>
              {t("waitlist.join")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ space }) => (
              <Card key={space.id} className="flex flex-col overflow-hidden">
                <div className="relative">
                  <Photo
                    token={space.photos[0]}
                    rounded="rounded-none"
                    className="h-44 w-full"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {space.evCharger && (
                      <Badge tone="navy" className="bg-white/95">
                        <Zap className="h-3 w-3" /> {t("app.ev")} {space.evCharger.kw}kW
                      </Badge>
                    )}
                    {space.liveCamera && (
                      <Badge tone="go" className="bg-white/95">
                        <Radio className="h-3 w-3" /> {t("app.card.liveCam")}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold leading-snug text-navy-900">{space.title}</h3>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-navy-500">
                    <MapPin className="h-3.5 w-3.5" /> {space.approxArea}
                  </p>

                  <div className="mt-3">
                    <Stars rating={space.rating} count={space.reviewCount} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-500" /> {space.distanceMiles} mi
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-brand-500" /> {space.driveMinutes}{" "}
                      {t("app.card.minToTerminal")}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {space.cctv && (
                      <Badge tone="neutral">
                        <Camera className="h-3 w-3" /> {t("search.cctv")}
                      </Badge>
                    )}
                    {space.evCharger && (
                      <Badge tone="brand">
                        <Zap className="h-3 w-3" /> {space.evCharger.connector}
                      </Badge>
                    )}
                    <Badge tone="neutral" className="capitalize">
                      {t("app.card.fits")} {space.maxVehicleSize}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-navy-100 pt-4">
                    <div>
                      <span className="text-2xl font-extrabold text-navy-900">
                        {formatMoneyShort(space.pricePerDay, currency)}
                      </span>
                      <span className="text-sm font-semibold text-navy-500"> {t("common.perDay")}</span>
                    </div>
                    <Link
                      href={`/app/space/${space.id}`}
                      className={buttonVariants({ variant: "primary", size: "sm" })}
                    >
                      {t("common.viewBook")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------ Why ParkGo here */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("airport.whyEyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("airport.whyHeadingA")} {airport.name} {t("airport.whyHeadingB")}
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              tone: "brand" as const,
              title: t("airport.why1.title"),
              body: `${t("airport.why1.bodyA")} ${airport.code} ${t("airport.why1.bodyB")}`,
            },
            {
              icon: ShieldCheck,
              tone: "go" as const,
              title: t("airport.why2.title"),
              body: t("airport.why2.body"),
            },
            {
              icon: Radio,
              tone: "accent" as const,
              title: t("airport.why3.title"),
              body: t("airport.why3.body"),
            },
            {
              icon: CarTaxiFront,
              tone: "navy" as const,
              title: t("airport.why4.title"),
              body: `${t("airport.why4.bodyA")} ${airport.name}${t("airport.why4.bodyB")}`,
            },
          ].map((f) => (
            <Card key={f.title} className="p-6">
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  f.tone === "brand"
                    ? "bg-brand-50 text-brand-700"
                    : f.tone === "go"
                      ? "bg-go-50 text-go-600"
                      : f.tone === "accent"
                        ? "bg-accent-50 text-accent-500"
                        : "bg-navy-50 text-navy-700"
                }`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- FAQ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Eyebrow>{t("airport.faqEyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {airport.name} {t("airport.faqHeadingA")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("airport.faqIntroA")} {airport.code}.
            </p>
          </div>
          <dl className="space-y-4">
            {faqsLocalized.map((f) => (
              <Card key={f.q} className="p-6">
                <dt className="flex items-start gap-3 font-bold text-navy-900">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-8 text-navy-600">{f.a}</dd>
              </Card>
            ))}
          </dl>
        </div>
      </Section>

      {/* ----------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("airport.ctaHeadingA")} {airport.name}
              {t("airport.ctaHeadingB")}
            </h2>
            <p className="mt-3 text-brand-100">{t("airport.ctaBody")}</p>
            <Link
              href={`/app/search?airport=${slug}`}
              className={buttonVariants({ variant: "white", size: "lg", className: "mt-7" })}
            >
              {t("airport.findParkingAt")} {airport.code} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

// Localized FAQs for the visible section. Dynamic tokens (airport name / IATA
// code / count / price) are glued to the following fragment, which carries its
// own leading space or punctuation per locale — the translator has no
// interpolation, so composition happens here.
function buildFaqsLocalized(
  t: (key: string) => string,
  name: string,
  code: string,
  min: number | null,
  currency: "GBP" | "EUR",
  evCount: number
): { q: string; a: string }[] {
  const fromPriceText =
    min != null
      ? `${t("airport.faq1.fromPrice")} ${formatMoneyShort(min, currency)} ${t("airport.faq1.perDay")}`
      : t("airport.faq1.competitive");
  const spaceWord =
    evCount === 1 ? t("airport.faq4ev.aSpace") : t("airport.faq4ev.aSpaces");
  return [
    {
      q: `${t("airport.faq1.qA")} ${name}${t("airport.faq1.qB")}`,
      a: `${t("airport.faq1.aA")} ${name} ${fromPriceText}${t("airport.faq1.aB")}`,
    },
    {
      q: `${t("airport.faq2.qA")} ${code}${t("airport.faq2.qB")}`,
      a: `${t("airport.faq2.aA")} ${name}${t("airport.faq2.aB")}`,
    },
    {
      q: t("airport.faq3.q"),
      a: `${t("airport.faq3.aA")} ${name}${t("airport.faq3.aB")}`,
    },
    evCount > 0
      ? {
          q: `${t("airport.faq4ev.qA")} ${name}${t("airport.faq4ev.qB")}`,
          a: `${t("airport.faq4ev.aA")} ${evCount} ${spaceWord} ${t("airport.faq4ev.aNear")} ${name}${t("airport.faq4ev.aB")}`,
        }
      : {
          q: `${t("airport.faq4t.qA")} ${name}${t("airport.faq4t.qB")}`,
          a: `${t("airport.faq4t.aA")} ${name}${t("airport.faq4t.aB")}`,
        },
  ];
}

function buildFaqs(
  name: string,
  code: string,
  min: number | null,
  currency: "GBP" | "EUR",
  evCount: number
): { q: string; a: string }[] {
  const fromPrice = min != null ? `${formatMoneyShort(min, currency)} per day` : "competitive daily rates";
  return [
    {
      q: `How much does parking at ${name} cost?`,
      a: `Verified private parking near ${name} starts from ${fromPrice} on ParkGo. Because parking, your licensed terminal transfer and any EV charging are bundled into one booking, the total you see at checkout is the total you pay — with no separate shuttle fees.`,
    },
    {
      q: `How do I get from the parking space to the ${code} terminal?`,
      a: `Add a licensed terminal transfer to your booking and a verified, insured driver collects you for the short trip to your ${name} terminal. You can track them live on a map, and the handover is confirmed with a one-time code.`,
    },
    {
      q: `Is my car secure while I am away?`,
      a: `Spaces near ${name} are hosted by ID-verified hosts, and many offer CCTV or a live camera you can check from your phone — so you can keep an eye on your car from the departure lounge or even overseas.`,
    },
    {
      q:
        evCount > 0
          ? `Can I charge my electric car at ${name}?`
          : `Which terminals does ParkGo cover at ${name}?`,
      a:
        evCount > 0
          ? `Yes — ${evCount} ${evCount === 1 ? "space" : "spaces"} near ${name} offer EV charging, priced transparently per kWh and included in your single bundled total. Filter for EV charging when you search and come home to a charged car.`
          : `ParkGo lists verified spaces serving every terminal at ${name}. Each listing shows the real drive time to the terminals, so you can pick the space best placed for your departure.`,
    },
  ];
}
