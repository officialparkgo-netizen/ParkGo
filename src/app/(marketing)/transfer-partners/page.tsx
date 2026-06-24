import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarTaxiFront,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  IdCard,
  Inbox,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { pageMetadata } from "@/lib/seo";
import { COMMISSION } from "@/lib/pricing";

export const metadata = pageMetadata({
  title: "For transfer partners",
  description:
    "Licensed taxi and PHV operators: receive bundled airport transfer jobs, manage drivers, vehicles and licences, share live location and confirm verified handovers — all in one platform.",
  path: "/transfer-partners",
});

const transferKeepPct = Math.round((10_000 - COMMISSION.transferBps) / 100);

const benefits = [
  { icon: Inbox, tone: "brand" as const, title: "Bundled jobs, ready to accept", body: "Transfers arrive pre-attached to a confirmed parking booking — qualified demand, not cold leads." },
  { icon: Users, tone: "go" as const, title: "Manage your fleet", body: "Add drivers and vehicles, store licences and insurance, and assign jobs from one dashboard." },
  { icon: Navigation, tone: "accent" as const, title: "Live location sharing", body: "Share your driver&apos;s position with the traveller and host on a single live map." },
  { icon: BadgeCheck, tone: "navy" as const, title: "Verified handovers", body: "Confirm pick-up and drop-off with a one-time code — every job timestamped and logged." },
  { icon: Wallet, tone: "go" as const, title: "Fair, transparent pay", body: `Keep around ${transferKeepPct}% of each transfer fare, paid per completed job. Commission is configurable.` },
  { icon: Gauge, tone: "brand" as const, title: "Clear SLAs", body: "Know exactly what&apos;s expected on response time, punctuality and service quality." },
];

const onboarding = [
  { icon: IdCard, title: "Register your operation", body: "Add your operator details, the airports you cover and your contact information." },
  { icon: FileCheck2, title: "Upload licences & insurance", body: "Provide operator, vehicle and driver licensing plus insurance documents for verification." },
  { icon: Users, title: "Add drivers & vehicles", body: "Build your fleet profile — each driver and vehicle is checked before going live." },
  { icon: ClipboardCheck, title: "Compliance review", body: "Our team verifies your documents against our standards before you receive any jobs." },
  { icon: CheckCircle2, title: "Go live & accept jobs", body: "Start receiving bundled transfer jobs and managing them in real time." },
  { icon: RefreshCw, title: "Periodic re-verification", body: "Licences and insurance are re-checked on a schedule so your profile always stays compliant." },
];

const requirements = [
  "Valid private hire or taxi operator licence",
  "Licensed, background-checked drivers",
  "Appropriately insured, roadworthy vehicles",
  "Smartphone with location sharing enabled",
  "Commitment to ParkGo service-level standards",
  "Up-to-date documents for periodic re-verification",
];

export default function TransferPartnersPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="accent" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> For licensed taxi &amp; PHV operators
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            Bundled airport transfer jobs, sent straight to your fleet
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            ParkGo pairs every parking booking with a licensed terminal transfer. Become a partner to
            receive that demand, manage your drivers in one place and get paid per completed job.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Become a partner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#onboarding" className={buttonVariants({ variant: "outline", size: "lg" })}>
              How onboarding works
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-go-500" /> Keep ~{transferKeepPct}% per transfer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-go-500" /> Verified, two-sided trust
            </span>
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Benefits */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Why partner with ParkGo</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Qualified demand and the tools to deliver it
          </h2>
          <p className="mt-4 text-navy-600">
            Transfers are tied to real, paid parking bookings — so you spend less time finding work and
            more time completing it.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* -------------------------------------------------------- Onboarding */}
      <Section className="bg-navy-50/50" id="onboarding">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Getting set up</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Onboarding built around licensing and trust
          </h2>
          <p className="mt-4 text-navy-600">
            Every operator, driver and vehicle is verified before jobs start flowing — and re-verified
            on a schedule to keep standards high.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {onboarding.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-400 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-navy-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-navy-600">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* --------------------------------------- Requirements + how a job runs */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>What you need</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Partner requirements
            </h2>
            <p className="mt-4 text-navy-600">
              ParkGo only works with properly licensed, insured operators. Here&apos;s what we ask for
              before you go live.
            </p>
            <ul className="mt-6 space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <span className="text-navy-700">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How a job runs */}
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                <CarTaxiFront className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">How a transfer job runs</h3>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                { icon: Inbox, t: "Receive the job", b: "A bundled transfer lands with pick-up time, location and trip details." },
                { icon: Users, t: "Assign a driver", b: "Allocate the job to an available, verified driver and vehicle." },
                { icon: MapPin, t: "Share live location", b: "The traveller and host follow your driver on a live map." },
                { icon: BadgeCheck, t: "Confirm handover", b: "Verify a one-time code at pick-up and drop-off — both events are logged." },
                { icon: Wallet, t: "Get paid", b: "Your fare is released after the job completes, with the split shown clearly." },
              ].map((row, i) => (
                <li key={row.t} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-bold text-navy-900">
                      <row.icon className="h-4 w-4 text-accent-500" /> {row.t}
                    </p>
                    <p className="text-sm text-navy-600">{row.b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/pricing" className={buttonVariants({ variant: "outline", className: "mt-6 w-full" })}>
              See partner economics <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <CarTaxiFront className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bring your fleet to ParkGo
            </h2>
            <p className="mt-3 text-brand-100">
              Join the partner waitlist and we&apos;ll guide you through verification so you&apos;re ready to
              accept bundled jobs the day we launch at your airports.
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm role="transfer" dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              We&apos;ll only work with licensed, insured operators.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
