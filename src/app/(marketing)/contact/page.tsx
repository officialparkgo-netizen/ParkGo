import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CarTaxiFront,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ContactForm } from "@/components/marketing/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with ParkGo. Whether you're a traveller, host, transfer partner or team, our support team is here to help across the UK & Ireland.",
  path: "/contact",
});

const channels = [
  {
    icon: LifeBuoy,
    tone: "go" as const,
    title: "Support",
    body: "Questions about a booking, your account or payments.",
    action: { label: "support@parkgo.app", href: "mailto:support@parkgo.app" },
  },
  {
    icon: Building2,
    tone: "brand" as const,
    title: "Partnerships",
    body: "Hosting at scale or bringing a licensed fleet to ParkGo.",
    action: { label: "partners@parkgo.app", href: "mailto:partners@parkgo.app" },
  },
  {
    icon: MessageCircle,
    tone: "accent" as const,
    title: "Press & general",
    body: "Media enquiries and everything else.",
    action: { label: "hello@parkgo.app", href: "mailto:hello@parkgo.app" },
  },
];

const quickLinks = [
  { icon: HelpCircle, title: "Read the FAQ", body: "Most questions are answered here.", href: "/faq" },
  { icon: MapPin, title: "For travellers", body: "How booking and travel day work.", href: "/travellers" },
  { icon: Building2, title: "For hosts", body: "List a space and start earning.", href: "/hosts" },
  { icon: CarTaxiFront, title: "For partners", body: "Bring your fleet to ParkGo.", href: "/transfer-partners" },
];

export default function ContactPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="brand" className="mb-5">
            <Mail className="h-3.5 w-3.5" /> Contact us
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            Travellers, hosts, transfer partners and teams — whatever you need, our support team across
            the UK &amp; Ireland is here to help.
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------- Channels + the form */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: blurb + contact methods */}
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Pick the right inbox, or just send us a message
            </h2>
            <p className="mt-4 text-navy-600">
              ParkGo is building integrated airport access for the UK &amp; Ireland. We aim to reply to
              every enquiry quickly — choose the team that fits, or use the form and we&apos;ll route it for
              you.
            </p>

            <div className="mt-8 space-y-4">
              {channels.map((c) => (
                <Card key={c.title} className="flex items-start gap-4 p-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      c.tone === "brand"
                        ? "bg-brand-50 text-brand-600"
                        : c.tone === "go"
                          ? "bg-go-50 text-go-600"
                          : "bg-accent-50 text-accent-500"
                    }`}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900">{c.title}</h3>
                    <p className="text-sm text-navy-600">{c.body}</p>
                    <a
                      href={c.action.href}
                      className="mt-1 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {c.action.label}
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-navy-50 p-5">
              <Users className="h-6 w-6 shrink-0 text-navy-700" />
              <p className="text-sm text-navy-600">
                Setting up travel for a team?{" "}
                <Link href="/pricing" className="font-semibold text-brand-600 hover:text-brand-700">
                  See corporate accounts
                </Link>{" "}
                for monthly invoicing and priority support.
              </p>
            </div>
          </div>

          {/* Right: the form */}
          <Card className="p-7 sm:p-8">
            <h2 className="text-xl font-bold text-navy-900">Send us a message</h2>
            <p className="mt-1.5 text-sm text-navy-600">
              Fill in the form and we&apos;ll get back to you by email.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>
        </div>
      </Section>

      {/* ----------------------------------------------------- Quick links */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Before you write</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            You might find your answer faster here
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href} className="group">
              <Card className="h-full p-6 transition-shadow group-hover:shadow-card-lg">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <l.icon className="h-5 w-5" />
                </div>
                <h3 className="flex items-center gap-1 text-base font-bold text-navy-900">
                  {l.title}
                  <ArrowRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                </h3>
                <p className="mt-1.5 text-sm text-navy-600">{l.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to park smart and travel easy?
            </h2>
            <p className="mt-3 text-brand-100">
              Start a booking or explore how ParkGo brings parking, transfers and EV charging into one
              trusted journey.
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
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              8 launch airports across the UK &amp; Ireland.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
