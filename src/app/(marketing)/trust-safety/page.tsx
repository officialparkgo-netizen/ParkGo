import Link from "next/link";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Trust & safety",
  description:
    "How ParkGo keeps everyone safe: two-sided verification, ID-checked hosts, licensed and insured drivers, CCTV and live camera, verified handovers, two-sided trust scoring, and GDPR/ICO-aligned data protection.",
  path: "/trust-safety",
});

const pillars = [
  {
    icon: UserCheck,
    tone: "go" as const,
    title: "Two-sided verification",
    body: "Both sides of every booking are verified. Hosts complete identity and address checks; travellers register real accounts; partners prove their licensing.",
  },
  {
    icon: Fingerprint,
    tone: "brand" as const,
    title: "ID-checked hosts",
    body: "Every host passes a KYC identity check and a right-to-list declaration before a single space goes live.",
  },
  {
    icon: BadgeCheck,
    tone: "accent" as const,
    title: "Licensed & insured drivers",
    body: "Transfer partners provide operator, vehicle and driver licensing plus insurance — verified and periodically re-checked.",
  },
  {
    icon: Camera,
    tone: "navy" as const,
    title: "CCTV & live camera",
    body: "Spaces can include CCTV, and travellers can watch a live in-app camera of their car with a LIVE badge and timestamp.",
  },
  {
    icon: ShieldCheck,
    tone: "go" as const,
    title: "Verified handovers",
    body: "Drop-off and collection are each confirmed with a one-time code, creating a timestamped, logged chain of custody.",
  },
  {
    icon: Star,
    tone: "brand" as const,
    title: "Two-sided trust scoring",
    body: "Travellers, hosts and drivers rate each other after every trip. Scores keep the network honest and high quality.",
  },
];

const dataPractices = [
  { icon: Lock, title: "Minimal data", body: "We collect only what a booking genuinely needs — and no more. Data minimisation is the default." },
  { icon: ScrollText, title: "Lawful basis & consent", body: "Every use of your data has a lawful basis. Where we rely on consent, it&apos;s specific, informed and easy to withdraw." },
  { icon: FileLock2, title: "Defined retention", body: "Personal data is kept only as long as needed, then deleted or anonymised on a defined retention schedule." },
  { icon: UserCheck, title: "Data-subject requests", body: "Access, correct, export or erase your data. We honour data-subject requests in line with UK GDPR." },
  { icon: KeyRound, title: "Separated, encrypted KYC", body: "Identity and bank documents are encrypted and stored separately from your everyday profile data." },
  { icon: Eye, title: "Audit logging", body: "Sensitive actions are recorded in an audit log so access can be reviewed and accounted for." },
  { icon: Users, title: "Least privilege & RLS", body: "Strict access controls and row-level security mean people and services only ever see what they should." },
  { icon: ShieldAlert, title: "Breach response", body: "A defined incident process means we contain, assess and notify quickly if anything ever goes wrong." },
];

export default function TrustSafetyPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="go" className="mb-5">
            <ShieldCheck className="h-3.5 w-3.5" /> Trust &amp; safety
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            Safety you can see, data you can trust
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            ParkGo is built on verification, visibility and strict data protection. Here&apos;s exactly how
            we keep travellers, hosts and partners safe — and how we handle your information.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#data" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Data &amp; privacy <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/faq" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Read the FAQ
            </Link>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Safety pillars */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Safety on both sides</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Verified people and verified moments
          </h2>
          <p className="mt-4 text-navy-600">
            Trust isn&apos;t a badge — it&apos;s a set of checks that happen before, during and after every
            booking.
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
      </Section>

      {/* ------------------------------------------ Verified handover detail */}
      <Section className="bg-navy-50/50">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>The verified handover</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              A clear, logged chain of custody
            </h2>
            <p className="mt-4 text-navy-600">
              The handover is the moment that matters most. ParkGo turns it into a confirmed,
              timestamped event so there&apos;s never any doubt about who had the car and when.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { t: "One-time codes", b: "A unique code is confirmed by both parties at drop-off and collection." },
                { t: "Timestamped & logged", b: "Each confirmation is recorded with a time, creating an auditable trail." },
                { t: "Live context", b: "Live location and the in-app camera give everyone the same picture in real time." },
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
                Handover confirmed
              </span>
            </div>
            <div className="mt-5 rounded-2xl border border-go-200 bg-go-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-go-700">
                One-time code
              </p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-navy-900">
                4K9PQ2
              </p>
              <p className="mt-2 text-xs text-navy-500">Confirmed by both parties · 14:32</p>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {["Host confirmed drop-off", "Driver confirmed pick-up", "Event written to audit log"].map((s) => (
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
          <Eyebrow>Data protection</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            GDPR and ICO-aligned, by design
          </h2>
          <p className="mt-4 text-navy-600">
            We treat your data as something we look after, not something we own. Our approach is built
            around UK GDPR principles and ICO guidance.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dataPractices.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
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

      {/* ------------------------------------------------- Security posture */}
      <Section className="bg-navy-50/50">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Security baked into the platform
            </h2>
            <p className="mt-4 text-navy-600">
              Good intentions aren&apos;t enough — protection has to be engineered in. These are the
              controls that sit behind every booking.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              { icon: KeyRound, t: "Encryption of sensitive data", b: "Identity and payment-related documents are encrypted at rest and in transit." },
              { icon: Users, t: "Least privilege & row-level security", b: "Access is restricted to the minimum needed, enforced at the data layer." },
              { icon: Eye, t: "Audit logging", b: "Sensitive operations are logged so access can be reviewed and accounted for." },
              { icon: ShieldAlert, t: "Defined breach response", b: "A clear incident process to contain, assess and notify without delay." },
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
              Have a question about safety or privacy?
            </h2>
            <p className="mt-3 text-brand-100">
              We&apos;re happy to explain anything about how we verify people or handle your data. Get in
              touch and we&apos;ll point you to the detail.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className={buttonVariants({ variant: "white", size: "lg" })}>
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                Read the FAQ
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              Verification and re-verification run continuously, not just at sign-up.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
