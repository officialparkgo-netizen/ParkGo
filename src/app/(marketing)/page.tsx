import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Camera,
  CarTaxiFront,
  Languages,
  MapPin,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SearchWidget } from "@/components/marketing/search-widget";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { getAirports } from "@/lib/data/store";
import { getI18n } from "@/lib/i18n";

export default async function HomePage() {
  const { t } = await getI18n();
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code }));

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <Badge tone="go" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> UK &amp; Ireland · launching soon
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-600">{t("hero.subtitle")}</p>

            <div className="mt-7">
              <SearchWidget airports={airports} />
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
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

          <TravelDayPreview />
        </Container>
      </section>

      {/* ----------------------------------------------------------- Airports */}
      <div className="border-y border-navy-100 bg-white">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5">
          <span className="text-sm font-semibold text-navy-400">Parking near</span>
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
          <Eyebrow>One booking, one price</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Four things travellers juggle separately — bundled into one checkout
          </h2>
          <p className="mt-4 text-navy-600">
            Parking, a licensed terminal transfer, EV charging and live security.
            Combined at a single transparent price, with explainable AI suggestions.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPin, tone: "brand", title: t("value.bundle.title"), body: t("value.bundle.body") },
            { icon: ShieldCheck, tone: "go", title: t("value.trust.title"), body: t("value.trust.body") },
            { icon: Radio, tone: "accent", title: t("value.realtime.title"), body: t("value.realtime.body") },
            { icon: Zap, tone: "navy", title: t("value.ev.title"), body: t("value.ev.body") },
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

      {/* ----------------------------------------------------- How it works */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Booked in minutes, sorted for the whole trip
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", title: "Search & compare", body: "Pick your airport and dates. See verified spaces with price, distance, EV, CCTV and ratings.", icon: MapPin },
            { n: "2", title: "Build your bundle", body: "Add a licensed transfer and EV charging. One transparent price, one secure checkout.", icon: CarTaxiFront },
            { n: "3", title: "Park, track, fly", body: "Get a QR access code, track your driver live, watch your car on camera and confirm a verified handover.", icon: QrCode },
          ].map((s) => (
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

      {/* ------------------------------------------------ Travel-day showcase */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Live on travel day</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Peace of mind you can actually watch
            </h2>
            <p className="mt-4 text-navy-600">
              ParkGo&apos;s differentiators come alive the day you fly. No more
              wondering where your car is or whether your driver turned up.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Radio, title: "Live location sharing", body: "Customer, host and licensed driver on one live map." },
                { icon: Camera, title: "Live camera of your car", body: "Watch your parked vehicle in-app with a LIVE badge and timestamp." },
                { icon: BadgeCheck, title: "Verified handover", body: "Both parties confirm a one-time code — timestamped and logged." },
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
          <TravelDayPreview large />
        </div>
      </Section>

      {/* ----------------------------------------------------- Audiences */}
      <Section className="bg-navy-50/50">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { href: "/travellers", title: "For travellers", body: "Book parking + transfer + EV in one go. Track everything live.", cta: "Start a booking", tone: "brand" as const },
            { href: "/hosts", title: "For hosts", body: "List a driveway or yard, get verified, and earn from empty space.", cta: "List your space", tone: "go" as const },
            { href: "/transfer-partners", title: "For transfer partners", body: "Receive bundled jobs, manage drivers, and confirm handovers in-app.", cta: "Become a partner", tone: "accent" as const },
          ].map((a) => (
            <Card key={a.href} className="flex flex-col p-7">
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

      {/* --------------------------------------------------------- Stats */}
      <Section>
        <div className="grid gap-8 rounded-2xl bg-navy-800 p-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "8", v: "Launch airports" },
            { k: "1 price", v: "Parking + transfer + EV" },
            { k: "100%", v: "ID-verified hosts" },
            { k: "4", v: "Languages at launch" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-4xl font-extrabold text-white">{s.k}</div>
              <div className="mt-1 text-sm text-navy-200">{s.v}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Languages className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("waitlist.title")}
            </h2>
            <p className="mt-3 text-brand-100">{t("waitlist.body")}</p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm dark />
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

/** Schematic travel-day preview: live mini-map + camera badge + driver chip. */
function TravelDayPreview({ large = false }: { large?: boolean }) {
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
              stroke="#36B24A"
              strokeWidth="3"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <circle cx="40" cy="180" r="7" fill="#fff" />
            <circle cx="230" cy="60" r="9" fill="#E8842B" stroke="#fff" strokeWidth="3" />
          </svg>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-go-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-go-500" />
            </span>
            LIVE
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-white/95 p-2.5 shadow">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <CarTaxiFront className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-navy-900">Marek · SwiftLink Cars</div>
              <div className="text-navy-500">Arriving in ~12 min · Silver Prius</div>
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
              Bay 1 · 14:32
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-go-200 bg-go-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-go-700">
              <BadgeCheck className="h-4 w-4" /> Handover
            </div>
            <div className="mt-1 font-mono text-lg font-bold tracking-widest text-navy-900">
              4K9PQ2
            </div>
            <div className="text-[10px] text-navy-500">Confirm with your driver</div>
          </div>
        </div>
      </div>
    </div>
  );
}
