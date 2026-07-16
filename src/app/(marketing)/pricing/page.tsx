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
import { HeroVisual } from "@/components/marketing/hero-scenes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { COMMISSION, SERVICE_FEE } from "@/lib/pricing";
import { formatMoneyShort } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";

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

export default async function PricingPage() {
  const { t } = await getI18n();

  const exampleLines = [
    { icon: MapPin, label: t("pricing.receipt.parking"), note: t("pricing.receipt.parkingNote"), amount: exampleParking },
    { icon: CarTaxiFront, label: t("pricing.receipt.transfer"), note: t("pricing.receipt.transferNote"), amount: exampleTransfer },
    { icon: Zap, label: t("pricing.receipt.ev"), note: t("pricing.receipt.evNote"), amount: exampleEv },
    { icon: Receipt, label: t("pricing.receipt.fee"), note: t("pricing.receipt.feeNote"), amount: SERVICE_FEE },
  ];

  const economics = [
    {
      icon: MapPin,
      tone: "go" as const,
      who: t("pricing.econ.hosts.who"),
      commission: `~${parkingPct}%`,
      line: t("pricing.econ.hosts.line"),
      keep: t("pricing.econ.hosts.keep").replace("{pct}", String(hostKeepPct)),
      body: t("pricing.econ.hosts.body"),
    },
    {
      icon: CarTaxiFront,
      tone: "accent" as const,
      who: t("pricing.econ.transfer.who"),
      commission: t("pricing.econ.transfer.commission"),
      line: t("pricing.econ.transfer.line"),
      keep: t("pricing.econ.transfer.keep"),
      body: t("pricing.econ.transfer.body"),
    },
    {
      icon: Receipt,
      tone: "brand" as const,
      who: t("pricing.econ.fee.who"),
      commission: serviceFee,
      line: t("pricing.econ.fee.line"),
      keep: t("pricing.econ.fee.keep"),
      body: t("pricing.econ.fee.body"),
    },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="go" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {t("pricing.hero.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("pricing.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("pricing.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("pricing.hero.ctaStart")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#economics" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("pricing.hero.ctaHow")}
            </Link>
          </div>
          </div>
          <HeroVisual kind="pricing" />
        </Container>
      </section>

      {/* ---------------------------------------- The single-bundle price */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("pricing.bundle.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("pricing.bundle.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("pricing.bundle.body")}
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                t("pricing.bundle.point1"),
                t("pricing.bundle.point2"),
                t("pricing.bundle.point3"),
                t("pricing.bundle.point4").replace("{fee}", serviceFee),
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
                {t("pricing.receipt.label")}
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
              <span className="text-sm font-bold text-go-700">{t("pricing.receipt.total")}</span>
              <span className="text-2xl font-extrabold text-navy-900">
                {formatMoneyShort(exampleTotal)}
              </span>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-navy-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("pricing.receipt.disclaimer")}
            </p>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------- Economics */}
      <Section className="bg-navy-50/50" id="economics">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("pricing.economics.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("pricing.economics.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("pricing.economics.body")}
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
            <MapPin className="h-4 w-4" /> {t("pricing.econ.ctaHost")}
          </Link>
          <Link href="/how-it-works" className={buttonVariants({ variant: "outline" })}>
            <CarTaxiFront className="h-4 w-4" /> {t("pricing.econ.ctaTransfer")}
          </Link>
        </div>

        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-1.5 text-center text-xs text-navy-500">
          <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("pricing.econ.note").replace("{pct}", String(parkingPct))}
        </p>
      </Section>

      {/* --------------------------------------- Corporate + referral */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("pricing.more.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("pricing.more.title")}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">{t("pricing.corporate.title")}</h3>
            </div>
            <p className="mt-3 text-navy-600">
              {t("pricing.corporate.body")}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                t("pricing.corporate.point1"),
                t("pricing.corporate.point2"),
                t("pricing.corporate.point3"),
                t("pricing.corporate.point4"),
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span className="text-navy-700">{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact" className={buttonVariants({ variant: "navy", className: "mt-6 w-full" })}>
              {t("pricing.corporate.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">{t("pricing.referral.title")}</h3>
            </div>
            <p className="mt-3 text-navy-600">
              {t("pricing.referral.body")}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                t("pricing.referral.point1"),
                t("pricing.referral.point2"),
                t("pricing.referral.point3"),
                t("pricing.referral.point4"),
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span className="text-navy-700">{p}</span>
                </li>
              ))}
            </ul>
            <Link href="/travellers" className={buttonVariants({ variant: "accent", className: "mt-6 w-full" })}>
              {t("pricing.referral.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------------- What you get */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("pricing.included.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("pricing.included.title")}
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, tone: "go", title: t("pricing.included.verified.title"), body: t("pricing.included.verified.body") },
            { icon: Wallet, tone: "brand", title: t("pricing.included.secure.title"), body: t("pricing.included.secure.body") },
            { icon: Banknote, tone: "accent", title: t("pricing.included.noFees.title"), body: t("pricing.included.noFees.body") },
            { icon: MapPin, tone: "navy", title: t("pricing.included.live.title"), body: t("pricing.included.live.body") },
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
              {t("pricing.cta.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("pricing.cta.body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "white", size: "lg" })}>
                {t("pricing.cta.start")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("pricing.cta.how")}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
