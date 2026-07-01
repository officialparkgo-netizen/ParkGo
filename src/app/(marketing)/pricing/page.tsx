import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  CarTaxiFront,
  CheckCircle2,
  CreditCard,
  Gift,
  Info,
  MapPin,
  Percent,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { COMMISSION, SERVICE_FEE } from "@/lib/pricing";
import { formatMoneyShort } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Transparent pricing from ParkGo: one bundled price for parking, a licensed transfer and EV charging, with a small flat service fee. Clear commission for hosts, plus corporate accounts and referrals.",
  path: "/pricing",
});

const serviceFee = formatMoneyShort(SERVICE_FEE);
const parkingPct = Math.round(COMMISSION.parkingBps / 100);
const hostKeepPct = 100 - parkingPct;

// Indicative example bundle lines (pence) that sum to ~£49 including the fee.
const exampleParking = 3300;
const exampleTransfer = 2400;
const exampleEv = 1000;
const exampleTotal = exampleParking + exampleTransfer + exampleEv + SERVICE_FEE;

const exampleLines = [
  { icon: MapPin, label: "Verified parking", note: "host driveway near the terminal", amount: exampleParking },
  { icon: CarTaxiFront, label: "Licensed transfer", note: "both ways, licensed driver", amount: exampleTransfer },
  { icon: Zap, label: "EV charging", note: "optional top-up", amount: exampleEv },
  { icon: Receipt, label: "Service fee", note: "flat platform fee", amount: SERVICE_FEE },
];

const economics = [
  {
    icon: MapPin,
    tone: "go" as const,
    who: "Hosts",
    commission: `~${parkingPct}%`,
    line: "on parking & EV",
    keep: `Keep ~${hostKeepPct}%`,
    body: "Commission is taken per parking booking; EV charging revenue follows the same split because the host owns the charger.",
  },
  {
    icon: CarTaxiFront,
    tone: "accent" as const,
    who: "Licensed transfer",
    commission: "Included",
    line: "in your bundle price",
    keep: "No partner onboarding",
    body: "The terminal transfer is provided by an independent, licensed and insured operator, integrated with ParkGo by API. There is no fleet to onboard — it is simply bundled into your one price.",
  },
  {
    icon: Receipt,
    tone: "brand" as const,
    who: "Service fee",
    commission: serviceFee,
    line: "flat, per booking",
    keep: "Shown at checkout",
    body: "A small flat platform fee added once per booking. It is never hidden — travellers see it before they pay.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="go" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Transparent by design
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            One clear price. No surprises at the gate.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            ParkGo bundles parking, a licensed transfer and EV charging into a single price with one
            small, clearly shown service fee. Hosts earn on fair, transparent terms.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start a booking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#economics" className={buttonVariants({ variant: "outline", size: "lg" })}>
              How the bundle adds up
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------- The single-bundle price */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>The bundle price</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Four services, one price you can read in seconds
            </h2>
            <p className="mt-4 text-navy-600">
              Instead of three checkouts and a mental sum, ParkGo shows you a single total before you
              pay. Here&apos;s how an indicative bundle breaks down.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Per-day parking from your chosen verified host",
                "A licensed terminal transfer, both ways",
                "Optional EV charging where the host offers it",
                `A flat ${serviceFee} service fee, shown before you pay`,
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span className="text-navy-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example bundle receipt */}
          <Card className="p-7">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                Indicative bundle
              </span>
            </div>
            <dl className="mt-5 divide-y divide-navy-100">
              {exampleLines.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <row.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy-900">{row.label}</span>
                      <span className="block text-xs text-navy-500">{row.note}</span>
                    </span>
                  </dt>
                  <dd className="text-sm font-semibold text-navy-900">
                    {formatMoneyShort(row.amount)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-go-50 px-4 py-3">
              <span className="text-sm font-bold text-go-700">One price at checkout</span>
              <span className="text-2xl font-extrabold text-navy-900">
                {formatMoneyShort(exampleTotal)}
              </span>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-navy-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Indicative example only. Your price depends on airport, dates and the add-ons you choose.
            </p>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------- Economics */}
      <Section className="bg-navy-50/50" id="economics">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How the bundle adds up</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Fair economics, clearly explained
          </h2>
          <p className="mt-4 text-navy-600">
            ParkGo takes a commission on parking and a small flat service fee. The licensed transfer is
            included via an integrated operator. Everyone can see exactly where the money goes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {economics.map((e) => (
            <Card key={e.who} className="flex flex-col p-7">
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  e.tone === "go"
                    ? "bg-go-50 text-go-600"
                    : e.tone === "accent"
                      ? "bg-accent-50 text-accent-500"
                      : "bg-brand-50 text-brand-600"
                }`}
              >
                <e.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{e.who}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-navy-900">{e.commission}</span>
                <span className="text-sm text-navy-500">{e.line}</span>
              </div>
              <Badge tone={e.tone} className="mt-3 w-fit">
                {e.keep}
              </Badge>
              <p className="mt-3 flex-1 text-sm text-navy-600">{e.body}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/hosts" className={buttonVariants({ variant: "primary" })}>
            <MapPin className="h-4 w-4" /> Earn as a host
          </Link>
          <Link href="/how-it-works" className={buttonVariants({ variant: "outline" })}>
            <CarTaxiFront className="h-4 w-4" /> How the transfer works
          </Link>
        </div>

        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-1.5 text-center text-xs text-navy-500">
          <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Indicative commission of ~{parkingPct}% on parking. Rates are to be confirmed at launch.
        </p>
      </Section>

      {/* --------------------------------------- Corporate + referral */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>More ways to save</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Built for teams and for sharing
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Corporate accounts</h3>
            </div>
            <p className="mt-3 text-navy-600">
              Centralise travel for your team with one account, consolidated billing and priority support.
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Monthly invoicing instead of per-trip cards",
                "Centralised bookings across your travellers",
                "Priority support for time-critical trips",
                "Clear statements for easy expensing",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span className="text-navy-700">{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact" className={buttonVariants({ variant: "navy", className: "mt-6 w-full" })}>
              Talk to us about teams <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Referral programme</h3>
            </div>
            <p className="mt-3 text-navy-600">
              Love ParkGo? Share it. When a friend takes their first trip, you both get rewarded.
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Share your personal referral link",
                "Your friend gets a welcome reward",
                "You&apos;re rewarded after their first completed trip",
                "Refer as many people as you like",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span
                    className="text-navy-700"
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                </li>
              ))}
            </ul>
            <Link href="/travellers" className={buttonVariants({ variant: "accent", className: "mt-6 w-full" })}>
              Start travelling <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------------- What you get */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Included in every booking</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            The price always includes the important parts
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, tone: "go", title: "Verified people", body: "ID-checked hosts and licensed, insured drivers — always." },
            { icon: Wallet, tone: "brand", title: "Secure payment", body: "One transparent checkout with the total shown up front." },
            { icon: Banknote, tone: "accent", title: "No hidden fees", body: "The only platform fee is the flat service fee, shown before you pay." },
            { icon: MapPin, tone: "navy", title: "Live travel day", body: "Live tracking, in-app camera and verified handovers at no extra cost." },
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

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <CreditCard className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See your price before you commit
            </h2>
            <p className="mt-3 text-brand-100">
              Start a booking to get a single transparent total for your airport and dates — no account
              required to look.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "white", size: "lg" })}>
                Start a booking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                How it works
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
