import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
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
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with ParkGo. Whether you're a traveller, host or team, our support team is here to help across the UK & Ireland.",
  path: "/contact",
});

export default async function ContactPage() {
  const { t } = await getI18n();

  const channels = [
    {
      icon: LifeBuoy,
      tone: "go" as const,
      title: t("contact.channel.support.title"),
      body: t("contact.channel.support.body"),
      action: { label: "support@parkgo.ai", href: "mailto:support@parkgo.ai" },
    },
    {
      icon: Building2,
      tone: "brand" as const,
      title: t("contact.channel.partnerships.title"),
      body: t("contact.channel.partnerships.body"),
      action: { label: "partners@parkgo.ai", href: "mailto:partners@parkgo.ai" },
    },
    {
      icon: MessageCircle,
      tone: "accent" as const,
      title: t("contact.channel.press.title"),
      body: t("contact.channel.press.body"),
      action: { label: "info@parkgo.ai", href: "mailto:info@parkgo.ai" },
    },
  ];

  const quickLinks = [
    { icon: HelpCircle, title: t("contact.quick.faq.title"), body: t("contact.quick.faq.body"), href: "/faq" },
    { icon: MapPin, title: t("contact.quick.travellers.title"), body: t("contact.quick.travellers.body"), href: "/travellers" },
    { icon: Building2, title: t("contact.quick.hosts.title"), body: t("contact.quick.hosts.body"), href: "/hosts" },
    { icon: ShieldCheck, title: t("contact.quick.trust.title"), body: t("contact.quick.trust.body"), href: "/trust-safety" },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="brand" className="mb-5">
            <Mail className="h-3.5 w-3.5" /> {t("contact.hero.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("contact.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("contact.hero.subtitle")}
          </p>
          </div>
          <div className="relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]">
            <Image
              src="/images/contact.png"
              alt="ParkGo Contact & Support"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------- Channels + the form */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: blurb + contact methods */}
          <div>
            <Eyebrow>{t("contact.channels.eyebrow")}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {t("contact.channels.title")}
            </h2>
            <p className="mt-4 text-navy-600">
              {t("contact.channels.body")}
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
                {t("contact.teams.text")}{" "}
                <Link href="/pricing" className="font-semibold text-brand-600 hover:text-brand-700">
                  {t("contact.teams.link")}
                </Link>{" "}
                {t("contact.teams.suffix")}
              </p>
            </div>
          </div>

          {/* Right: the form */}
          <Card className="p-7 sm:p-8">
            <h2 className="text-xl font-bold text-navy-900">{t("contact.form.title")}</h2>
            <p className="mt-1.5 text-sm text-navy-600">
              {t("contact.form.subtitle")}
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
          <Eyebrow>{t("contact.quick.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("contact.quick.title")}
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
              {t("contact.cta.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("contact.cta.body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "white", size: "lg" })}>
                {t("contact.cta.start")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("contact.cta.how")}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              {t("contact.cta.note")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
