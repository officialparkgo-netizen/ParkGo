import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, SITE } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about ParkGo — for travellers and hosts. Payments, security, languages, verification and how the bundle works.",
  path: "/faq",
});

// English source of truth for the FAQPage JSON-LD (kept in English for SEO,
// regardless of the on-screen locale). The visible Q&A is rendered via t().
const faqJsonLdSource: { q: string; a: string }[] = [
  {
    q: "What exactly is included in a ParkGo booking?",
    a: "A ParkGo booking bundles a verified private parking space, a licensed terminal transfer (both ways), optional EV charging and live security — CCTV, an in-app camera and verified handovers — into one price and one checkout.",
  },
  {
    q: "Is my car safe while I am away?",
    a: "Yes. Hosts are ID-verified, spaces can include CCTV, and you can watch your parked car on a live in-app camera with a LIVE badge and timestamp. Both drop-off and collection use a verified, logged handover with a one-time code.",
  },
  {
    q: "Are transfers run by ParkGo's own drivers?",
    a: "No. ParkGo does not run a fleet or onboard drivers. Your terminal transfer is provided by an independent, licensed and insured operator, integrated with ParkGo by API. You still get the same experience — a bundled booking, live driver location and ETA, and a verified handover — powered by the operator's API.",
  },
  {
    q: "What happens if my flight is delayed?",
    a: "Your parking and your return transfer are tied to your trip, so a delay is handled gracefully — you will not lose your space or your ride home. If plans change significantly, you can manage your booking in the app.",
  },
  {
    q: "Which airports does ParkGo cover?",
    a: "We are launching at eight airports across the UK and Ireland: Heathrow, Gatwick, Stansted, Luton, Manchester, Birmingham, Edinburgh and Dublin — with more to follow. Join the waitlist to hear when we reach yours.",
  },
  {
    q: "Who can become a host?",
    a: "Anyone with a legal right to rent out a suitable space near a launch airport — a driveway, yard or spare bay. You complete identity and address verification and a right-to-list declaration before your space can go live.",
  },
  {
    q: "How much can I earn as a host?",
    a: "You keep the large majority of every parking booking — indicatively around 80 to 85 percent, with EV charging revenue on top where you offer it. You set your own per-day price and availability. Figures are indicative and to be confirmed at launch.",
  },
  {
    q: "How and when do I get paid?",
    a: "Payouts are released after each completed booking and sent to the bank details you add during onboarding. Your bank details are encrypted and never shown to travellers, and you get clear statements for every booking.",
  },
  {
    q: "How does ParkGo pricing work?",
    a: "Parking, the licensed transfer and EV charging are combined into a single transparent price, plus a small flat service fee of £2.99 that is always shown before you pay. There are no hidden extras.",
  },
  {
    q: "How much commission does ParkGo take?",
    a: "Indicatively around 18 percent on parking, plus the flat service fee, shown clearly in host payout statements. The terminal transfer is provided by an independent licensed operator and is included in your bundle price. Figures are indicative and to be confirmed.",
  },
  {
    q: "Do you offer corporate accounts?",
    a: "Yes. Corporate accounts add centralised bookings, monthly invoicing instead of per-trip cards, priority support and clear statements for expensing. Contact us to set your team up.",
  },
  {
    q: "How does ParkGo protect my data?",
    a: "We align with UK GDPR and ICO guidance: data minimisation, a lawful basis for every use, defined retention, and easy data-subject requests. Identity and bank documents are encrypted and stored separately, with audit logging and least-privilege access controls.",
  },
  {
    q: "What does a verified handover mean?",
    a: "At drop-off and collection, both parties confirm a one-time code in the app. Each confirmation is timestamped and written to an audit log, creating a clear chain of custody for your vehicle.",
  },
  {
    q: "What languages is ParkGo available in?",
    a: "ParkGo launches in four languages across the UK and Ireland, with more planned. You can switch language at any time from the site header.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqJsonLdSource.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function FaqPage() {
  const { t } = await getI18n();

  // Visible Q&A, translated via t(). JSON-LD above stays English for SEO.
  const groups: { category: string; items: { q: string; a: string }[] }[] = [
    {
      category: t("faq.cat.travellers"),
      items: [
        { q: t("faq.t1.q"), a: t("faq.t1.a") },
        { q: t("faq.t2.q"), a: t("faq.t2.a") },
        { q: t("faq.t3.q"), a: t("faq.t3.a") },
        { q: t("faq.t4.q"), a: t("faq.t4.a") },
        { q: t("faq.t5.q"), a: t("faq.t5.a") },
      ],
    },
    {
      category: t("faq.cat.hosts"),
      items: [
        { q: t("faq.h1.q"), a: t("faq.h1.a") },
        { q: t("faq.h2.q"), a: t("faq.h2.a") },
        { q: t("faq.h3.q"), a: t("faq.h3.a") },
      ],
    },
    {
      category: t("faq.cat.payments"),
      items: [
        { q: t("faq.p1.q"), a: t("faq.p1.a") },
        { q: t("faq.p2.q"), a: t("faq.p2.a") },
        { q: t("faq.p3.q"), a: t("faq.p3.a") },
      ],
    },
    {
      category: t("faq.cat.security"),
      items: [
        { q: t("faq.s1.q"), a: t("faq.s1.a") },
        { q: t("faq.s2.q"), a: t("faq.s2.a") },
        { q: t("faq.s3.q"), a: t("faq.s3.a") },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="brand" className="mb-5">
            <HelpCircle className="h-3.5 w-3.5" /> {t("faq.hero.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("faq.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("faq.hero.subtitle")}
          </p>
          </div>
          <div className="relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]">
            <Image
              src="/images/faq.png"
              alt="ParkGo FAQ"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- FAQ groups */}
      <Section>
        <div className="mx-auto max-w-3xl space-y-12">
          {groups.map((group) => (
            <div key={group.category}>
              <Eyebrow>{group.category}</Eyebrow>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-navy-100 bg-white shadow-card transition-colors open:border-brand-200"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left [&::-webkit-details-marker]:hidden">
                      <span className="font-bold text-navy-900">{item.q}</span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-navy-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <MessageCircle className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("faq.cta.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("faq.cta.body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className={buttonVariants({ variant: "white", size: "lg" })}>
                {t("faq.cta.contact")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("faq.cta.how")}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              {SITE.tagline}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
