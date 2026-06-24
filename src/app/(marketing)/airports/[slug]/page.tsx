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
  const { slug } = await params;
  const airport = getAirport(slug);
  if (!airport) notFound();

  const results = searchSpaces({ airportSlug: slug });
  const currency = airport.country === "IE" ? "EUR" : "GBP";
  const min = minPrice(results);
  const evCount = results.filter((r) => r.space.evCharger).length;
  const camCount = results.filter((r) => r.space.liveCamera).length;
  const faqs = buildFaqs(airport.name, airport.code, min, currency, evCount);

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
                <Link href="/" className="hover:text-brand-600">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-navy-600">{airport.name} parking</li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge tone="brand" className="mb-5">
                <Plane className="h-3.5 w-3.5" /> {airport.code} · {airport.city},{" "}
                {airport.country === "IE" ? "Ireland" : "UK"}
              </Badge>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
                {airport.name} airport parking
              </h1>
              <p className="mt-5 max-w-xl text-lg text-navy-600">
                Verified private parking near {airport.name}, bundled with a licensed terminal
                transfer, EV charging and live security — one booking, one transparent price.
              </p>

              {min != null && (
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-navy-500">Parking from</span>
                  <span className="text-3xl font-extrabold text-go-600">
                    {formatMoneyShort(min, currency)}
                  </span>
                  <span className="text-sm font-semibold text-navy-500">/ day</span>
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/app/search?airport=${slug}`}
                  className={buttonVariants({ variant: "primary", size: "lg" })}
                >
                  Find parking at {airport.code} <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#spaces" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  See available spaces
                </a>
              </div>

              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-go-500" /> Verified hosts
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-go-500" /> Licensed drivers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-go-500" /> Live camera &amp; CCTV
                </span>
              </p>
            </div>

            {/* At-a-glance facts card */}
            <Card className="p-6 sm:p-8">
              <Eyebrow>At a glance</Eyebrow>
              <h2 className="text-xl font-bold text-navy-900">
                Parking near {airport.name} ({airport.code})
              </h2>
              <dl className="mt-6 grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-sm text-navy-500">Verified spaces</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{results.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">From</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">
                    {min != null ? `${formatMoneyShort(min, currency)}/day` : "Coming soon"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">With EV charging</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{evCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-navy-500">With live camera</dt>
                  <dd className="text-2xl font-extrabold text-navy-900">{camCount}</dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-navy-100 pt-5">
                <dt className="text-sm font-semibold text-navy-500">Terminals served</dt>
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
          <Eyebrow>Available now</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Verified parking spaces near {airport.name}
          </h2>
          <p className="mt-4 text-navy-600">
            Every space is ID-verified, with the real distance to your terminal, transparent
            pricing and ratings from travellers who have parked here.
          </p>
        </div>

        {results.length === 0 ? (
          <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
            <Plane className="mx-auto h-8 w-8 text-brand-500" />
            <h3 className="mt-4 text-lg font-bold text-navy-900">
              We are lining up spaces at {airport.name}
            </h3>
            <p className="mt-2 text-navy-600">
              Listings here are launching soon. Join the waitlist and we will let you know the
              moment {airport.code} goes live.
            </p>
            <Link href="/#waitlist" className={buttonVariants({ variant: "navy", className: "mt-5" })}>
              Join the waitlist <ArrowRight className="h-4 w-4" />
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
                        <Zap className="h-3 w-3" /> EV {space.evCharger.kw}kW
                      </Badge>
                    )}
                    {space.liveCamera && (
                      <Badge tone="go" className="bg-white/95">
                        <Radio className="h-3 w-3" /> Live camera
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
                      <Clock className="h-3.5 w-3.5 text-brand-500" /> {space.driveMinutes} min drive
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {space.cctv && (
                      <Badge tone="neutral">
                        <Camera className="h-3 w-3" /> CCTV
                      </Badge>
                    )}
                    {space.evCharger && (
                      <Badge tone="brand">
                        <Zap className="h-3 w-3" /> {space.evCharger.connector}
                      </Badge>
                    )}
                    <Badge tone="neutral" className="capitalize">
                      Fits {space.maxVehicleSize}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-navy-100 pt-4">
                    <div>
                      <span className="text-2xl font-extrabold text-navy-900">
                        {formatMoneyShort(space.pricePerDay, currency)}
                      </span>
                      <span className="text-sm font-semibold text-navy-500"> / day</span>
                    </div>
                    <Link
                      href={`/app/space/${space.id}`}
                      className={buttonVariants({ variant: "primary", size: "sm" })}
                    >
                      View &amp; book <ArrowRight className="h-3.5 w-3.5" />
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
          <Eyebrow>Why ParkGo</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Why book {airport.name} parking with ParkGo
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              tone: "brand" as const,
              title: "One booking, one price",
              body: `Parking, a licensed transfer to your ${airport.code} terminal, EV charging and security — combined at a single transparent price.`,
            },
            {
              icon: ShieldCheck,
              tone: "go" as const,
              title: "Verified & licensed",
              body: "Every host is ID-verified and every transfer driver is licensed and insured. No anonymous listings.",
            },
            {
              icon: Radio,
              tone: "accent" as const,
              title: "Watch it live",
              body: "Track your licensed driver on a live map and check your parked car on camera, right from the departure lounge.",
            },
            {
              icon: CarTaxiFront,
              tone: "navy" as const,
              title: "Minutes from the terminal",
              body: `Private spaces sit close to ${airport.name}, so your transfer is short, predictable and stress-free.`,
            },
          ].map((f) => (
            <Card key={f.title} className="p-6">
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  f.tone === "brand"
                    ? "bg-brand-50 text-brand-600"
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
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {airport.name} parking FAQs
            </h2>
            <p className="mt-4 text-navy-600">
              The questions travellers ask most about parking at {airport.code}.
            </p>
          </div>
          <dl className="space-y-4">
            {faqs.map((f) => (
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
              Ready to park at {airport.name}?
            </h2>
            <p className="mt-3 text-brand-100">
              Compare verified spaces, add a licensed transfer and EV charging, and pay one
              transparent price.
            </p>
            <Link
              href={`/app/search?airport=${slug}`}
              className={buttonVariants({ variant: "white", size: "lg", className: "mt-7" })}
            >
              Find parking at {airport.code} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
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
