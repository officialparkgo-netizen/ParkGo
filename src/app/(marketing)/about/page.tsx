import Link from "next/link";
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

export const metadata = pageMetadata({
  title: "About & team",
  description:
    "ParkGo is on a mission to make airport access seamless across the UK & Ireland — bundling parking, licensed transfers, EV charging and live security into one trusted booking. Meet the team building it.",
  path: "/about",
});

const values = [
  { icon: ShieldCheck, tone: "go" as const, title: "Trust first", body: "Verification, visibility and clear records sit at the heart of every decision we make." },
  { icon: Layers, tone: "brand" as const, title: "Genuinely integrated", body: "One booking, one price, one app — we refuse to ship another disconnected experience." },
  { icon: Heart, tone: "accent" as const, title: "Human by default", body: "Multilingual, accessible and supportive. Travel is stressful enough already." },
  { icon: Globe2, tone: "navy" as const, title: "Open & fair", body: "Transparent pricing for travellers and fair, configurable economics for hosts and partners." },
];

const team = [
  { name: "Alex Morgan", role: "Founder & CEO", tone: "brand" as const },
  { name: "Priya Shah", role: "Head of Product", tone: "go" as const },
  { name: "Daniel Okoye", role: "Head of Engineering", tone: "accent" as const },
  { name: "Sofia Lindqvist", role: "Trust & Safety Lead", tone: "navy" as const },
];

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

export default function AboutPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="brand" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> About ParkGo
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            Making airport access seamless for the UK &amp; Ireland
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            ParkGo brings parking, licensed transfers, EV charging and live security into one trusted
            booking — so getting to your flight is the easy part of the trip.
          </p>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Mission */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our mission</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Integrated airport access, built on trust
          </h2>
          <p className="mt-5 text-lg text-navy-600">
            We believe getting to the airport should be as well designed as the flight itself. Our
            mission is to connect verified hosts, an independent licensed transfer operator and
            travellers in a single, transparent journey — across the UK &amp; Ireland and in your
            language.
          </p>
        </div>
      </Section>

      {/* --------------------------------------------- Problem & approach */}
      <Section className="bg-navy-50/50">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">The problem</h3>
            <p className="mt-3 text-navy-600">
              Airport travel is fragmented. You book parking on one site, a transfer on another, hunt for
              EV charging separately, and just hope your car is safe while you&apos;re away. Prices are
              opaque, shuttles are slow, and there&apos;s no real visibility on the day it matters.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-600">
              {[
                "Multiple bookings, multiple prices",
                "No clear view of where your car or driver is",
                "Limited trust and patchy verification",
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
            <h3 className="mt-4 text-xl font-bold text-navy-900">Our approach</h3>
            <p className="mt-3 text-navy-600">
              ParkGo bundles the whole journey into one checkout, then makes it visible and verifiable.
              Verified hosts, licensed drivers, a single transparent price, and live tracking with an
              in-app camera and verified handovers from start to finish.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-600">
              {[
                "One booking, one price, one app",
                "Two-sided verification and trust scoring",
                "Live tracking, camera and verified handovers",
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
          <Eyebrow>What we value</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            The principles behind the product
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((f) => (
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

      {/* -------------------------------------------------------------- Team */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Our team</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            The people building ParkGo
          </h2>
          <p className="mt-4 text-navy-600">
            A small, focused team obsessed with trust, design and getting travellers to their flight
            without the stress.
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
              <p className="text-sm text-brand-600">{m.role}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-navy-500">
          <Users className="h-4 w-4" /> We&apos;re growing — see open roles on our{" "}
          <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
            contact page
          </Link>
          .
        </p>
      </Section>

      {/* ----------------------------------------------------- Vision strip */}
      <Section>
        <div className="grid gap-8 rounded-2xl bg-navy-800 p-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, k: "1 mission", v: "Seamless airport access" },
            { icon: Globe2, k: "UK & Ireland", v: "Where we&apos;re launching first" },
            { icon: Handshake, k: "3 sides", v: "Travellers, hosts & partners" },
            { icon: Lightbulb, k: "Built to trust", v: "Verification at every step" },
          ].map((s) => (
            <div key={s.v}>
              <s.icon className="mx-auto mb-3 h-7 w-7 text-go-300" />
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
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Come along for the journey
            </h2>
            <p className="mt-3 text-brand-100">
              We&apos;re building ParkGo in the open and launching airport by airport. Join the waitlist
              and grow with us.
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
                See how it works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
