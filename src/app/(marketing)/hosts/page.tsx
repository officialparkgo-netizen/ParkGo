import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Camera,
  CheckCircle2,
  FileCheck2,
  Home,
  IdCard,
  Landmark,
  MapPin,
  PiggyBank,
  Ruler,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { pageMetadata } from "@/lib/seo";
import { COMMISSION } from "@/lib/pricing";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "For hosts",
  description:
    "Turn an empty driveway, yard or parking space near an airport into income. Get verified, list in minutes and keep the large majority of every booking — with secure payouts and built-in trust.",
  path: "/hosts",
});

// Host keeps everything minus commission. parkingBps 1800 -> keeps ~82%.
const hostKeepPct = Math.round((10_000 - COMMISSION.parkingBps) / 100);

export default async function HostsPage() {
  const { t } = await getI18n();

  const onboarding = [
    { icon: IdCard, title: t("hosts.onboarding.identity.title"), body: t("hosts.onboarding.identity.body") },
    { icon: MapPin, title: t("hosts.onboarding.address.title"), body: t("hosts.onboarding.address.body") },
    { icon: Ruler, title: t("hosts.onboarding.details.title"), body: t("hosts.onboarding.details.body") },
    { icon: ScrollText, title: t("hosts.onboarding.declaration.title"), body: t("hosts.onboarding.declaration.body") },
    { icon: Landmark, title: t("hosts.onboarding.bank.title"), body: t("hosts.onboarding.bank.body") },
    { icon: FileCheck2, title: t("hosts.onboarding.review.title"), body: t("hosts.onboarding.review.body") },
    { icon: CheckCircle2, title: t("hosts.onboarding.golive.title"), body: t("hosts.onboarding.golive.body") },
  ];

  const trust = [
    { icon: BadgeCheck, title: t("hosts.trust.travellers.title"), body: t("hosts.trust.travellers.body") },
    { icon: Camera, title: t("hosts.trust.cctv.title"), body: t("hosts.trust.cctv.body") },
    { icon: ShieldCheck, title: t("hosts.trust.handover.title"), body: t("hosts.trust.handover.body") },
    { icon: ScrollText, title: t("hosts.trust.terms.title"), body: t("hosts.trust.terms.body") },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <Badge tone="go" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> {t("hosts.badge")}
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
              {t("hosts.hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-600">
              {t("hosts.hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
                {t("hosts.hero.cta.list")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#onboarding" className={buttonVariants({ variant: "outline", size: "lg" })}>
                {t("hosts.hero.cta.onboarding")}
              </Link>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-go-500" /> {t("hosts.hero.keep").replace("{pct}", String(hostKeepPct))}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-go-500" /> {t("hosts.hero.travellers")}
              </span>
            </p>
          </div>

          {/* Host scene + earnings card */}
          <div className="mx-auto w-full max-w-md">
            <div className="hidden sm:block relative w-full aspect-square min-h-[300px]">
              <Image
                src="/images/hosts.png"
                alt="ParkGo Host"
                fill
                className="object-cover rounded-2xl shadow-2xl"
                priority
              />
            </div>
            <Card className="relative z-10 p-7 sm:mx-4 sm:-mt-14 sm:shadow-card-lg">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-go-600" />
                <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                  {t("hosts.earnings.label")}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-5xl font-extrabold text-navy-900">~{hostKeepPct}%</div>
                  <div className="mt-1 text-sm text-navy-500">{t("hosts.earnings.ofBooking")}</div>
                </div>
                <Badge tone="go">{t("hosts.earnings.indicative")}</Badge>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-navy-600">{t("hosts.earnings.travellerPays")}</span>
                  <span className="font-semibold text-navy-900">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-600">{t("hosts.earnings.commission")}</span>
                  <span className="font-semibold text-navy-900">
                    ~{100 - hostKeepPct}%
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-navy-100 pt-3">
                  <span className="font-bold text-navy-700">{t("hosts.earnings.youReceive")}</span>
                  <span className="text-lg font-extrabold text-go-700">~{hostKeepPct}%</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-navy-500">
                {t("hosts.earnings.note")}
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------- Earnings angle */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("hosts.why.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("hosts.why.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("hosts.why.body")}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Banknote, tone: "go", title: t("hosts.why.economics.title"), body: t("hosts.why.economics.body").replace("{pct}", String(hostKeepPct)) },
            { icon: Home, tone: "brand", title: t("hosts.why.usewhat.title"), body: t("hosts.why.usewhat.body") },
            { icon: Zap, tone: "accent", title: t("hosts.why.ev.title"), body: t("hosts.why.ev.body") },
            { icon: ShieldCheck, tone: "navy", title: t("hosts.why.risk.title"), body: t("hosts.why.risk.body") },
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

      {/* -------------------------------------------------------- Onboarding */}
      <Section className="bg-navy-50/50" id="onboarding">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("hosts.onboarding.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("hosts.onboarding.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("hosts.onboarding.body")}
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {onboarding.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-go-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-navy-900">{s.title}</h3>
                <p
                  className="mt-1.5 text-sm text-navy-600"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ----------------------------------------------- Trust, payouts, etc */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("hosts.trust.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("hosts.trust.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("hosts.trust.body")}
            </p>
            <ul className="mt-6 space-y-4">
              {trust.map((f) => (
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
            <Link href="/trust-safety" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
              <ShieldCheck className="h-4 w-4" /> {t("hosts.trust.cta")}
            </Link>
          </div>

          {/* Payouts card */}
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">{t("hosts.payouts.title")}</h3>
            </div>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                { t: t("hosts.payouts.percompleted.title"), b: t("hosts.payouts.percompleted.body") },
                { t: t("hosts.payouts.tobank.title"), b: t("hosts.payouts.tobank.body") },
                { t: t("hosts.payouts.statements.title"), b: t("hosts.payouts.statements.body") },
                { t: t("hosts.payouts.setprice.title"), b: t("hosts.payouts.setprice.body") },
              ].map((row) => (
                <li key={row.t} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <div>
                    <p className="font-bold text-navy-900">{row.t}</p>
                    <p className="text-navy-600">{row.b}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/pricing" className={buttonVariants({ variant: "primary", className: "mt-6 w-full" })}>
              {t("hosts.payouts.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Building2 className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("hosts.waitlist.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("hosts.waitlist.body")}
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm role="host" dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              {t("hosts.waitlist.nospam")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
