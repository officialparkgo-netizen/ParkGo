import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Camera,
  CarTaxiFront,
  CheckCircle2,
  CreditCard,
  MapPin,
  QrCode,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "From search to verified handover — see how ParkGo bundles airport parking, a licensed transfer, EV charging and live security into one booking, one price and one app.",
  path: "/how-it-works",
});

export default async function HowItWorksPage() {
  const { t } = await getI18n();

  const steps = [
    {
      n: "1",
      icon: Search,
      tone: "brand" as const,
      title: t("how.step1.title"),
      body: t("how.step1.body"),
      points: [t("how.step1.point1"), t("how.step1.point2"), t("how.step1.point3")],
    },
    {
      n: "2",
      icon: CarTaxiFront,
      tone: "go" as const,
      title: t("how.step2.title"),
      body: t("how.step2.body"),
      points: [t("how.step2.point1"), t("how.step2.point2"), t("how.step2.point3")],
    },
    {
      n: "3",
      icon: QrCode,
      tone: "accent" as const,
      title: t("how.step3.title"),
      body: t("how.step3.body"),
      points: [t("how.step3.point1"), t("how.step3.point2"), t("how.step3.point3")],
    },
    {
      n: "4",
      icon: Radio,
      tone: "brand" as const,
      title: t("how.step4.title"),
      body: t("how.step4.body"),
      points: [t("how.step4.point1"), t("how.step4.point2"), t("how.step4.point3")],
    },
    {
      n: "5",
      icon: RotateCcw,
      tone: "go" as const,
      title: t("how.step5.title"),
      body: t("how.step5.body"),
      points: [t("how.step5.point1"), t("how.step5.point2"), t("how.step5.point3")],
    },
  ];

  const liveFeatures = [
    { icon: Radio, title: t("how.live.feat1.title"), body: t("how.live.feat1.body") },
    { icon: Camera, title: t("how.live.feat2.title"), body: t("how.live.feat2.body") },
    { icon: BadgeCheck, title: t("how.live.feat3.title"), body: t("how.live.feat3.body") },
  ];

  const hostSteps = [
    { title: t("how.hosts.step1.title"), body: t("how.hosts.step1.body") },
    { title: t("how.hosts.step2.title"), body: t("how.hosts.step2.body") },
    { title: t("how.hosts.step3.title"), body: t("how.hosts.step3.body") },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="go" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {t("how.hero.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("how.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            {t("how.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("how.hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("how.hero.pricing")}
            </Link>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------- The traveller journey */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("how.journey.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("how.journey.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("how.journey.body")}
          </p>
        </div>

        <ol className="mt-14 space-y-6">
          {steps.map((s) => (
            <li key={s.n}>
              <Card className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-go-500 text-lg font-bold text-white">
                    {s.n}
                  </span>
                  <div
                    className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:inline-flex ${
                      s.tone === "brand"
                        ? "bg-brand-50 text-brand-600"
                        : s.tone === "go"
                          ? "bg-go-50 text-go-600"
                          : "bg-accent-50 text-accent-500"
                    }`}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900">{s.title}</h3>
                  <p className="mt-2 max-w-2xl text-navy-600">{s.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700">
                        <CheckCircle2 className="h-4 w-4 text-go-500" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------ Live on travel day */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("how.live.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("how.live.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("how.live.body")}
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {liveFeatures.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------- What you get in one checkout */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("how.bundle.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("how.bundle.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("how.bundle.body")}
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: MapPin, tone: "brand", title: t("how.bundle.item1.title"), body: t("how.bundle.item1.body") },
                { icon: CarTaxiFront, tone: "go", title: t("how.bundle.item2.title"), body: t("how.bundle.item2.body") },
                { icon: Zap, tone: "accent", title: t("how.bundle.item3.title"), body: t("how.bundle.item3.body") },
                { icon: ShieldCheck, tone: "navy", title: t("how.bundle.item4.title"), body: t("how.bundle.item4.body") },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
                  <div>
                    <h3 className="font-bold text-navy-900">{f.title}</h3>
                    <p className="text-sm text-navy-600">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-7">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                {t("how.example.label")}
              </span>
            </div>
            <dl className="mt-5 divide-y divide-navy-100 text-sm">
              {[
                { k: t("how.example.parking"), v: t("how.example.parkingV") },
                { k: t("how.example.transfer"), v: t("how.example.transferV") },
                { k: t("how.example.ev"), v: t("how.example.evV") },
                { k: t("how.example.fee"), v: "£2.99" },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-3">
                  <dt className="font-medium text-navy-700">{row.k}</dt>
                  <dd className="text-navy-500">{row.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm font-bold text-navy-700">{t("how.example.onePrice")}</span>
              <span className="text-2xl font-extrabold text-navy-900">~£49</span>
            </div>
            <p className="mt-3 text-xs text-navy-500">
              {t("how.example.note")}
            </p>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "outline", className: "mt-5 w-full" })}
            >
              {t("how.example.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* ----------------------------------------------- For hosts & transfers */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("how.other.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("how.other.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("how.other.body")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">{t("how.hosts.title")}</h3>
            </div>
            <ol className="mt-5 space-y-4">
              {hostSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-go-100 text-xs font-bold text-go-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-navy-900">{s.title}</p>
                    <p className="text-sm text-navy-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/hosts"
              className={buttonVariants({ variant: "primary", className: "mt-6 w-full" })}
            >
              {t("how.hosts.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                <CarTaxiFront className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">{t("how.transfer.title")}</h3>
            </div>
            <p className="mt-5 text-navy-600">
              {t("how.transfer.body1")}
            </p>
            <p className="mt-4 text-navy-600">
              {t("how.transfer.body2")}
            </p>
            <Link
              href="/trust-safety"
              className={buttonVariants({ variant: "outline", className: "mt-6 w-full" })}
            >
              {t("how.transfer.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Banknote className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("how.cta.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("how.cta.body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "white", size: "lg" })}>
                {t("how.cta.start")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/travellers"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("how.cta.travellers")}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              {t("how.cta.airports")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
