import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Eye,
  FileLock2,
  Fingerprint,
  KeyRound,
  Lock,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { HeroVisual } from "@/components/marketing/hero-scenes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "Trust & safety",
  description:
    "How ParkGo keeps everyone safe: two-sided verification, ID-checked hosts, licensed and insured drivers, CCTV and live camera, verified handovers, two-sided trust scoring, and GDPR/ICO-aligned data protection.",
  path: "/trust-safety",
});

export default async function TrustSafetyPage() {
  const { t } = await getI18n();

  const pillars = [
    {
      icon: UserCheck,
      tone: "go" as const,
      title: t("trust.pillar.verification.title"),
      body: t("trust.pillar.verification.body"),
    },
    {
      icon: Fingerprint,
      tone: "brand" as const,
      title: t("trust.pillar.idHosts.title"),
      body: t("trust.pillar.idHosts.body"),
    },
    {
      icon: BadgeCheck,
      tone: "accent" as const,
      title: t("trust.pillar.operator.title"),
      body: t("trust.pillar.operator.body"),
    },
    {
      icon: Camera,
      tone: "navy" as const,
      title: t("trust.pillar.cctv.title"),
      body: t("trust.pillar.cctv.body"),
    },
    {
      icon: ShieldCheck,
      tone: "go" as const,
      title: t("trust.pillar.handovers.title"),
      body: t("trust.pillar.handovers.body"),
    },
    {
      icon: Star,
      tone: "brand" as const,
      title: t("trust.pillar.scoring.title"),
      body: t("trust.pillar.scoring.body"),
    },
  ];

  const dataPractices = [
    { icon: Lock, title: t("trust.data.minimal.title"), body: t("trust.data.minimal.body") },
    { icon: ScrollText, title: t("trust.data.lawful.title"), body: t("trust.data.lawful.body") },
    { icon: FileLock2, title: t("trust.data.retention.title"), body: t("trust.data.retention.body") },
    { icon: UserCheck, title: t("trust.data.requests.title"), body: t("trust.data.requests.body") },
    { icon: KeyRound, title: t("trust.data.kyc.title"), body: t("trust.data.kyc.body") },
    { icon: Eye, title: t("trust.data.audit.title"), body: t("trust.data.audit.body") },
    { icon: Users, title: t("trust.data.rls.title"), body: t("trust.data.rls.body") },
    { icon: ShieldAlert, title: t("trust.data.breach.title"), body: t("trust.data.breach.body") },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="go" className="mb-5">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("trust.hero.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("trust.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("trust.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="#data" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("trust.hero.ctaData")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/faq" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("trust.hero.ctaFaq")}
            </Link>
          </div>
          </div>
          <div className="hidden lg:block relative h-full w-full min-h-[400px]">
            <Image
              src="/images/trust-safety.png"
              alt="ParkGo Trust & Safety"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Safety pillars */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("trust.pillars.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("trust.pillars.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("trust.pillars.body")}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((f) => (
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
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-navy-500">
          {t("footer.insurance")}
        </p>
      </Section>

      {/* ------------------------------------------ Verified handover detail */}
      <Section className="bg-navy-50/50">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("trust.handover.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("trust.handover.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("trust.handover.body")}
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { t: t("trust.handover.codes.title"), b: t("trust.handover.codes.body") },
                { t: t("trust.handover.logged.title"), b: t("trust.handover.logged.body") },
                { t: t("trust.handover.context.title"), b: t("trust.handover.context.body") },
              ].map((row) => (
                <li key={row.t} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go-50 text-go-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">{row.t}</h3>
                    <p className="text-sm text-navy-600">{row.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-7">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-go-600" />
              <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                {t("trust.handover.confirmed")}
              </span>
            </div>
            <div className="mt-5 rounded-2xl border border-go-200 bg-go-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-go-700">
                {t("trust.handover.oneTimeCode")}
              </p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-navy-900">
                4K9PQ2
              </p>
              <p className="mt-2 text-xs text-navy-500">{t("trust.handover.byBoth")}</p>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {[t("trust.handover.step1"), t("trust.handover.step2"), t("trust.handover.step3")].map((s) => (
                <li key={s} className="flex items-center gap-2 text-navy-700">
                  <CheckCircle2 className="h-4 w-4 text-go-500" /> {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------- Data & privacy (GDPR) */}
      <Section id="data">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("trust.data.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("trust.data.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("trust.data.body")}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dataPractices.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------- Security posture */}
      <Section className="bg-navy-50/50">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("trust.security.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("trust.security.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("trust.security.body")}
            </p>
          </div>
          <ul className="space-y-3">
            {[
              { icon: KeyRound, t: t("trust.security.encryption.title"), b: t("trust.security.encryption.body") },
              { icon: Users, t: t("trust.security.rls.title"), b: t("trust.security.rls.body") },
              { icon: Eye, t: t("trust.security.audit.title"), b: t("trust.security.audit.body") },
              { icon: ShieldAlert, t: t("trust.security.breach.title"), b: t("trust.security.breach.body") },
            ].map((row) => (
              <li key={row.t}>
                <Card className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                    <row.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">{row.t}</h3>
                    <p className="text-sm text-navy-600">{row.b}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("trust.cta.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("trust.cta.body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className={buttonVariants({ variant: "white", size: "lg" })}>
                {t("trust.cta.contact")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("trust.cta.faq")}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              {t("trust.cta.note")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
