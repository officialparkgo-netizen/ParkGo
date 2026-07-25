import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Globe2,
  Handshake,
  Heart,
  Lightbulb,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { pageMetadata } from "@/lib/seo";
import { initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "About & team",
  description:
    "ParkGo is on a mission to make airport access seamless across the UK & Ireland — bundling parking, licensed transfers, EV charging and live security into one trusted booking. Meet the team building it.",
  path: "/about",
});

function avatarClasses(tone: "brand" | "go" | "accent" | "navy") {
  switch (tone) {
    case "brand":
      return "bg-brand-100 text-brand-700";
    case "go":
      return "bg-go-100 text-go-700";
    case "accent":
      return "bg-accent-100 text-accent-700";
    default:
      return "bg-navy-100 text-navy-800";
  }
}

export default async function AboutPage() {
  const { t } = await getI18n();

  const values = [
    { icon: ShieldCheck, tone: "go" as const, title: t("about.value.trust.title"), body: t("about.value.trust.body") },
    { icon: Layers, tone: "brand" as const, title: t("about.value.integrated.title"), body: t("about.value.integrated.body") },
    { icon: Heart, tone: "accent" as const, title: t("about.value.human.title"), body: t("about.value.human.body") },
    { icon: Globe2, tone: "navy" as const, title: t("about.value.fair.title"), body: t("about.value.fair.body") },
  ];

  const team = [
    { name: "Alex Morgan", role: t("about.team.role.ceo"), tone: "brand" as const },
    { name: "Priya Shah", role: t("about.team.role.product"), tone: "go" as const },
    { name: "Daniel Okoye", role: t("about.team.role.engineering"), tone: "accent" as const },
    { name: "Sofia Lindqvist", role: t("about.team.role.trust"), tone: "navy" as const },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
          <Badge tone="brand" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {t("about.badge")}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance lg:mx-0 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            {t("about.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl lg:mx-0 text-lg text-navy-600">
            {t("about.hero.subtitle")}
          </p>
          </div>
          <div className="relative mt-2 block h-60 w-full sm:h-72 lg:mt-0 lg:h-full lg:min-h-[400px]">
            <Image
              src="/images/dashboard.webp"
              alt="ParkGo Dashboard"
              fill
              sizes="(min-width: 1280px) 588px, (min-width: 1024px) 46vw, 100vw"
              className="object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Mission */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{t("about.mission.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("about.mission.title")}
          </h2>
          <p className="mt-5 text-lg text-navy-600">
            {t("about.mission.body")}
          </p>
        </div>
      </Section>

      {/* --------------------------------------------- Problem & approach */}
      <Section className="bg-navy-50/50">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">{t("about.problem.title")}</h3>
            <p className="mt-3 text-navy-600">
              {t("about.problem.body")}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-600">
              {[
                t("about.problem.point1"),
                t("about.problem.point2"),
                t("about.problem.point3"),
              ].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" /> {p}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">{t("about.approach.title")}</h3>
            <p className="mt-3 text-navy-600">
              {t("about.approach.body")}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-600">
              {[
                t("about.approach.point1"),
                t("about.approach.point2"),
                t("about.approach.point3"),
              ].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-go-500" /> {p}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Values */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("about.values.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("about.values.title")}
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((f) => (
            <Card key={f.title} className="p-6">
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  f.tone === "brand"
                    ? "bg-brand-50 text-brand-700"
                    : f.tone === "go"
                      ? "bg-go-50 text-go-600"
                      : f.tone === "accent"
                        ? "bg-accent-50 text-accent-700"
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

      {/* -------------------------------------------------------------- Team */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("about.team.eyebrow")}</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {t("about.team.title")}
          </h2>
          <p className="mt-4 text-navy-600">
            {t("about.team.body")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <Card key={m.name} className="p-7 text-center">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-xl font-extrabold ${avatarClasses(
                  m.tone
                )}`}
                aria-hidden
              >
                {initials(m.name)}
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{m.name}</h3>
              <p className="text-sm text-brand-700">{m.role}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-navy-500">
          <Users className="h-4 w-4" /> {t("about.team.growing")}{" "}
          <Link href="/contact" className="font-semibold text-brand-700 hover:text-brand-700">
            {t("about.team.contactPage")}
          </Link>
          .
        </p>
      </Section>

      {/* ----------------------------------------------------- Vision strip */}
      <Section>
        <div className="grid gap-8 rounded-2xl bg-navy-800 p-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, k: t("about.vision.mission.k"), v: t("about.vision.mission.v") },
            { icon: Globe2, k: t("about.vision.region.k"), v: t("about.vision.region.v") },
            { icon: Handshake, k: t("about.vision.sides.k"), v: t("about.vision.sides.v") },
            { icon: Lightbulb, k: t("about.vision.trust.k"), v: t("about.vision.trust.v") },
          ].map((s) => (
            <div key={s.v}>
              <s.icon className="mx-auto mb-3 h-7 w-7 text-go-200" />
              <div className="text-2xl font-extrabold text-white">{s.k}</div>
              <div
                className="mt-1 text-sm text-navy-200"
                dangerouslySetInnerHTML={{ __html: s.v }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-go-200" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("about.waitlist.title")}
            </h2>
            <p className="mt-3 text-brand-100">
              {t("about.waitlist.body")}
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm dark />
            </div>
            <div className="mt-6">
              <Link
                href="/how-it-works"
                className={buttonVariants({
                  variant: "outline",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                {t("about.waitlist.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
