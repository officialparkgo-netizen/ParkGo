import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about ParkGo — for travellers, hosts and transfer partners. Payments, security, languages, verification and how the bundle works.",
  path: "/faq",
});

type Faq = { q: string; a: string };
type FaqGroup = { category: string; items: Faq[] };

const groups: FaqGroup[] = [
  {
    category: "For travellers",
    items: [
      {
        q: "What exactly is included in a ParkGo booking?",
        a: "A ParkGo booking bundles a verified private parking space, a licensed terminal transfer (both ways), optional EV charging and live security — CCTV, an in-app camera and verified handovers — into one price and one checkout.",
      },
      {
        q: "Is my car safe while I am away?",
        a: "Yes. Hosts are ID-verified, spaces can include CCTV, and you can watch your parked car on a live in-app camera with a LIVE badge and timestamp. Both drop-off and collection use a verified, logged handover with a one-time code.",
      },
      {
        q: "What happens if my flight is delayed?",
        a: "Your parking and your return transfer are tied to your trip, so a delay is handled gracefully — you will not lose your space or your ride home. If plans change significantly, you can manage your booking in the app.",
      },
      {
        q: "Which airports does ParkGo cover?",
        a: "We are launching at eight airports across the UK and Ireland: Heathrow, Gatwick, Stansted, Luton, Manchester, Birmingham, Edinburgh and Dublin — with more to follow. Join the waitlist to hear when we reach yours.",
      },
    ],
  },
  {
    category: "For hosts",
    items: [
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
    ],
  },
  {
    category: "For transfer partners",
    items: [
      {
        q: "How do transfer partners receive work?",
        a: "Transfers arrive pre-attached to confirmed parking bookings, so you receive qualified jobs rather than cold leads. You assign each job to a verified driver and vehicle and manage everything from one dashboard.",
      },
      {
        q: "What do I need to become a transfer partner?",
        a: "A valid taxi or private hire operator licence, licensed and background-checked drivers, appropriately insured vehicles, and a commitment to our service-level standards. We verify all documents before you go live and re-check them periodically.",
      },
    ],
  },
  {
    category: "Payments & pricing",
    items: [
      {
        q: "How does ParkGo pricing work?",
        a: "Parking, the licensed transfer and EV charging are combined into a single transparent price, plus a small flat service fee of £2.99 that is always shown before you pay. There are no hidden extras.",
      },
      {
        q: "How much commission does ParkGo take?",
        a: "Indicatively around 18 percent on parking and around 12 percent on transfers, plus the flat service fee. Commission is configurable for partners at scale and is shown clearly in payout statements. Figures are indicative and to be confirmed.",
      },
      {
        q: "Do you offer corporate accounts?",
        a: "Yes. Corporate accounts add centralised bookings, monthly invoicing instead of per-trip cards, priority support and clear statements for expensing. Contact us to set your team up.",
      },
    ],
  },
  {
    category: "Security & languages",
    items: [
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
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((g) =>
    g.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="brand" className="mb-5">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently asked questions
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            Everything you wanted to ask about ParkGo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            Answers for travellers, hosts and transfer partners. Can&apos;t find what you need? Our team is
            one message away.
          </p>
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
              Still have a question?
            </h2>
            <p className="mt-3 text-brand-100">
              We&apos;re happy to help with anything about bookings, hosting, partnering or your data. Send
              us a message and we&apos;ll get back to you.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className={buttonVariants({ variant: "white", size: "lg" })}>
                Contact us <ArrowRight className="h-4 w-4" />
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
