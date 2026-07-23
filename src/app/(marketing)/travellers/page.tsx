import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
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
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "For travellers",
  description:
    "Book verified airport parking, a licensed transfer and EV charging in one go. Track your driver and your car live, pay one transparent price, and travel with total peace of mind.",
  path: "/travellers",
});

export default async function TravellersPage() {
  const { t } = await getI18n();

  const benefits = [
    { icon: CreditCard, tone: "brand" as const, title: t("travellers.benefit.oneprice.title"), body: t("travellers.benefit.oneprice.body") },
    { icon: ShieldCheck, tone: "go" as const, title: t("travellers.benefit.verified.title"), body: t("travellers.benefit.verified.body") },
    { icon: Radio, tone: "accent" as const, title: t("travellers.benefit.tracking.title"), body: t("travellers.benefit.tracking.body") },
    { icon: Zap, tone: "navy" as const, title: t("travellers.benefit.ev.title"), body: t("travellers.benefit.ev.body") },
    { icon: Languages, tone: "brand" as const, title: t("travellers.benefit.multilingual.title"), body: t("travellers.benefit.multilingual.body") },
    { icon: Users, tone: "go" as const, title: t("travellers.benefit.corporate.title"), body: t("travellers.benefit.corporate.body") },
    { icon: Gift, tone: "accent" as const, title: t("travellers.benefit.referral.title"), body: t("travellers.benefit.referral.body") },
    { icon: Wallet, tone: "navy" as const, title: t("travellers.benefit.cheaper.title"), body: t("travellers.benefit.cheaper.body") },
  ];

  const journey = [
    { n: "1", icon: MapPin, title: t("travellers.how.step1.title"), body: t("travellers.how.step1.body") },
    { n: "2", icon: CarTaxiFront, title: t("travellers.how.step2.title"), body: t("travellers.how.step2.body") },
    { n: "3", icon: QrCode, title: t("travellers.how.step3.title"), body: t("travellers.how.step3.body") },
  ];

  const faqs = [
    { q: t("travellers.faq.q1"), a: t("travellers.faq.a1") },
    { q: t("travellers.faq.q2"), a: t("travellers.faq.a2") },
    { q: t("travellers.faq.q3"), a: t("travellers.faq.a3") },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="brand" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {t("travellers.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("travellers.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("travellers.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("travellers.hero.cta.book")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("travellers.hero.cta.how")}
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 lg:justify-start gap-y-1 text-sm text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-go-500" /> {t("travellers.trust.hosts")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-go-500" /> {t("travellers.trust.drivers")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-go-500" /> {t("travellers.trust.camera")}
            </span>
          </p>
          </div>
          <div className="relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]">
            <Image
              src="/images/travellers.png"
              alt="ParkGo Travellers"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Benefits */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("travellers.benefits.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("travellers.benefits.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("travellers.benefits.body")}
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

      {/* -------------------------------------------------------- Compare */}
      <Section className="pt-0">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("trav.compare.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("trav.compare.heading")}
          </h2>
          <p className="mt-4 text-navy-600">{t("trav.compare.sub")}</p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-navy-100 bg-white text-sm shadow-card">
            <thead>
              <tr className="bg-navy-900 text-white">
                <th className="p-4 text-start font-semibold">{t("trav.compare.col.feature")}</th>
                <th className="p-4 text-start font-semibold text-navy-200">
                  {t("trav.compare.col.official")}
                </th>
                <th className="p-4 text-start font-bold text-brand-400">ParkGo</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["price", false],
                  ["camera", false],
                  ["cancel", false],
                  ["transfer", false],
                  ["ev", false],
                  ["support", false],
                ] as const
              ).map(([row]) => (
                <tr key={row}>
                  <td className="border-t border-navy-100 p-4 font-semibold text-navy-900">
                    {t(`trav.compare.${row}`)}
                  </td>
                  <td className="border-t border-navy-100 p-4 text-navy-500">
                    {t(`trav.compare.${row}.official`)}
                  </td>
                  <td className="border-t border-navy-100 bg-brand-50/40 p-4">
                    <span className="flex items-start gap-1.5 font-semibold text-navy-900">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-go-600" aria-hidden />
                      {t(`trav.compare.${row}.parkgo`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-navy-400">
          {t("trav.compare.note")}
        </p>
      </Section>

      {/* ------------------------------------------------------ How it works */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("travellers.how.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("travellers.how.title")}
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
            {t("travellers.how.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* -------------------------------------------------------- FAQ teaser */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <Eyebrow>{t("travellers.faq.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("travellers.faq.title")}
            </h2>
            <p
              className="mt-4 text-navy-600"
              dangerouslySetInnerHTML={{ __html: t("travellers.faq.body") }}
            />
            <Link href="/faq" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
              <HelpCircle className="h-4 w-4" /> {t("travellers.faq.cta")}
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
              {t("travellers.waitlist.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("travellers.waitlist.body")}
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm role="traveller" dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              {t("waitlist.nospam")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
