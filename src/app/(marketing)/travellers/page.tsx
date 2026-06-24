import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CarTaxiFront,
  CreditCard,
  Gift,
  HelpCircle,
  Languages,
  MapPin,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "For travellers",
  description:
    "Book verified airport parking, a licensed transfer and EV charging in one go. Track your driver and your car live, pay one transparent price, and travel with total peace of mind.",
  path: "/travellers",
});

const benefits = [
  {
    icon: CreditCard,
    tone: "brand" as const,
    title: "One price, one booking",
    body: "Parking, a licensed transfer and EV charging in a single transparent checkout. No juggling apps, no hidden extras.",
  },
  {
    icon: ShieldCheck,
    tone: "go" as const,
    title: "Verified & secure",
    body: "Every host is ID-checked and every driver is licensed and insured. CCTV and verified handovers throughout.",
  },
  {
    icon: Radio,
    tone: "accent" as const,
    title: "Live tracking & camera",
    body: "Follow your driver on a live map and watch your parked car on an in-app camera with a LIVE badge.",
  },
  {
    icon: Zap,
    tone: "navy" as const,
    title: "EV charging",
    body: "Add a top-up while you travel at hosts that offer a charger. Land back to a car that&apos;s ready to go.",
  },
  {
    icon: Languages,
    tone: "brand" as const,
    title: "Multilingual",
    body: "Use ParkGo in your language — four launch languages across the UK & Ireland, with more to follow.",
  },
  {
    icon: Users,
    tone: "go" as const,
    title: "Corporate accounts",
    body: "Travelling for work? Centralised bookings, monthly invoicing and priority support for teams.",
  },
  {
    icon: Gift,
    tone: "accent" as const,
    title: "Referral programme",
    body: "Share ParkGo with friends and family and you both get rewarded when they take their first trip.",
  },
  {
    icon: Wallet,
    tone: "navy" as const,
    title: "Often cheaper",
    body: "Verified driveways near the terminal frequently undercut official long-stay car parks — without the shuttle wait.",
  },
];

const journey = [
  { n: "1", icon: MapPin, title: "Search & compare", body: "Pick your airport and dates. See verified spaces with price, distance, EV and ratings." },
  { n: "2", icon: CarTaxiFront, title: "Build your bundle", body: "Add a licensed transfer and EV charging. One price, one secure checkout." },
  { n: "3", icon: QrCode, title: "Park, track, fly", body: "Get your QR, track your driver live, watch your car and confirm a verified handover." },
];

const faqs = [
  { q: "Is my car safe while I&apos;m away?", a: "Hosts are ID-verified, spaces can include CCTV, and you can watch a live in-app camera. Drop-off and collection both use a verified, logged handover." },
  { q: "What if my flight is delayed?", a: "Your booking and return transfer are tied to your trip, so a delay is handled gracefully — you won&apos;t lose your space or your ride home." },
  { q: "Can I pay in one go?", a: "Yes. Parking, transfer and EV charging are combined into a single transparent price with a small, clearly shown service fee." },
];

export default function TravellersPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="brand" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> For travellers
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            Park, transfer and charge — sorted in a single booking
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            ParkGo turns the most stressful part of flying into the easiest. One transparent price,
            verified people and live tracking from your driveway search to landing back home.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start a booking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See how it works
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-navy-500">
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
        </Container>
      </section>

      {/* ---------------------------------------------------------- Benefits */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Why travellers choose ParkGo</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Everything the trip needs, none of the hassle
          </h2>
          <p className="mt-4 text-navy-600">
            We bundled the things you used to book separately — and added the trust and visibility that
            airport parking has always been missing.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((f) => (
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
              <p
                className="mt-1.5 text-sm text-navy-600"
                dangerouslySetInnerHTML={{ __html: f.body }}
              />
            </Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ How it works */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Booked in minutes, sorted for the whole trip
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {journey.map((s) => (
            <li key={s.n} className="relative rounded-2xl bg-white p-6 shadow-card">
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
            See the full journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* -------------------------------------------------------- FAQ teaser */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Questions travellers ask first
            </h2>
            <p className="mt-4 text-navy-600">
              A few quick answers before you book. There&apos;s plenty more in our full FAQ.
            </p>
            <Link href="/faq" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
              <HelpCircle className="h-4 w-4" /> Read the full FAQ
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <Card key={f.q} className="p-6">
                <h3
                  className="font-bold text-navy-900"
                  dangerouslySetInnerHTML={{ __html: f.q }}
                />
                <p
                  className="mt-1.5 text-sm text-navy-600"
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <MapPin className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be first to book at your airport
            </h2>
            <p className="mt-3 text-brand-100">
              We&apos;re launching across the UK &amp; Ireland. Join the waitlist and we&apos;ll let you know
              the moment ParkGo goes live where you fly from.
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm role="traveller" dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              No spam — just a heads-up when we go live at your airport.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
