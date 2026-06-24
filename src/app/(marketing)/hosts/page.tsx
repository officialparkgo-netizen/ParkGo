import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Camera,
  CheckCircle2,
  FileCheck2,
  Home,
  IdCard,
  Landmark,
  MapPin,
  PiggyBank,
  Ruler,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { pageMetadata } from "@/lib/seo";
import { COMMISSION } from "@/lib/pricing";

export const metadata = pageMetadata({
  title: "For hosts",
  description:
    "Turn an empty driveway, yard or parking space near an airport into income. Get verified, list in minutes and keep the large majority of every booking — with secure payouts and built-in trust.",
  path: "/hosts",
});

// Host keeps everything minus commission. parkingBps 1800 -> keeps ~82%.
const hostKeepPct = Math.round((10_000 - COMMISSION.parkingBps) / 100);

const onboarding = [
  { icon: IdCard, title: "Verify your identity", body: "A quick KYC check confirms who you are. Documents are encrypted and stored separately from your profile." },
  { icon: MapPin, title: "Verify your address", body: "We confirm the location of the space you want to list so travellers know exactly where they&apos;re parking." },
  { icon: Ruler, title: "Add property details", body: "Photos, bay dimensions, access notes and whether you offer EV charging or CCTV — the things travellers filter on." },
  { icon: ScrollText, title: "Right-to-list declaration", body: "Confirm you&apos;re entitled to rent the space (owner or with permission) and that it&apos;s safe and legal to use." },
  { icon: Landmark, title: "Add bank details", body: "Tell us where to send your payouts. Bank details are encrypted and never shown to travellers." },
  { icon: FileCheck2, title: "Compliance review", body: "Our team reviews your listing against our trust and safety standards before it can go live." },
  { icon: CheckCircle2, title: "Go live & earn", body: "Set your availability and price. Your space starts appearing in traveller searches straight away." },
];

const trust = [
  { icon: BadgeCheck, title: "Verified travellers", body: "Bookings come from real, registered ParkGo customers — and you can review them too." },
  { icon: Camera, title: "Optional CCTV & live camera", body: "Add a camera to your listing for extra reassurance, for you and the traveller alike." },
  { icon: ShieldCheck, title: "Verified handovers", body: "Every drop-off and collection is confirmed with a one-time code, timestamped and logged." },
  { icon: ScrollText, title: "Clear terms", body: "Transparent host terms, a defined right-to-list declaration and platform support if anything goes wrong." },
];

export default function HostsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <Badge tone="go" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> For hosts &amp; landlords
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
              Earn from a driveway near the airport
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-600">
              If you live near a UK or Irish airport, your empty driveway, yard or spare space could be
              earning. Get verified, list it in minutes and keep the large majority of every booking.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
                List your space <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#onboarding" className={buttonVariants({ variant: "outline", size: "lg" })}>
                How onboarding works
              </Link>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-go-500" /> Keep ~{hostKeepPct}% of parking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-go-500" /> Verified travellers
              </span>
            </p>
          </div>

          {/* Earnings card */}
          <div className="mx-auto w-full max-w-md">
            <Card className="p-7">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-go-600" />
                <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                  What you keep
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-5xl font-extrabold text-navy-900">~{hostKeepPct}%</div>
                  <div className="mt-1 text-sm text-navy-500">of every parking booking</div>
                </div>
                <Badge tone="go">Indicative</Badge>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-navy-600">Traveller pays for parking</span>
                  <span className="font-semibold text-navy-900">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-600">ParkGo commission</span>
                  <span className="font-semibold text-navy-900">
                    ~{100 - hostKeepPct}%
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-navy-100 pt-3">
                  <span className="font-bold text-navy-700">You receive</span>
                  <span className="text-lg font-extrabold text-go-700">~{hostKeepPct}%</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-navy-500">
                EV charging revenue follows the same split — you own the charger. Figures are indicative
                and to be confirmed at launch.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------- Earnings angle */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Why host with ParkGo</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Put unused space to work
          </h2>
          <p className="mt-4 text-navy-600">
            Travellers want a secure, convenient place to leave the car. If you&apos;re near a terminal,
            that&apos;s exactly what your space already is.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Banknote, tone: "go", title: "Strong economics", body: `Keep around ${hostKeepPct}% of each parking booking, with EV charging on top where you offer it.` },
            { icon: Home, tone: "brand", title: "Use what you have", body: "A driveway, a yard, a spare bay — no building work, no new equipment required to start." },
            { icon: Zap, tone: "accent", title: "Earn more with EV", body: "List a charger and capture EV charging revenue while travellers are away." },
            { icon: ShieldCheck, tone: "navy", title: "Lower risk", body: "Verified travellers, optional CCTV and verified handovers mean fewer surprises." },
          ].map((f) => (
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

      {/* -------------------------------------------------------- Onboarding */}
      <Section className="bg-navy-50/50" id="onboarding">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Getting set up</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            From sign-up to go-live in a few clear steps
          </h2>
          <p className="mt-4 text-navy-600">
            Onboarding is built around trust on both sides. Every host is verified before a single
            traveller can book.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {onboarding.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-go-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-navy-900">{s.title}</h3>
                <p
                  className="mt-1.5 text-sm text-navy-600"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ----------------------------------------------- Trust, payouts, etc */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Trust &amp; protection</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Built to protect hosts as much as travellers
            </h2>
            <p className="mt-4 text-navy-600">
              You&apos;re inviting someone to use your space, so trust matters. ParkGo verifies both sides
              and keeps a clear, logged record of every booking.
            </p>
            <ul className="mt-6 space-y-4">
              {trust.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go-50 text-go-600">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">{f.title}</h3>
                    <p className="text-sm text-navy-600">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/trust-safety" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
              <ShieldCheck className="h-4 w-4" /> Read trust &amp; safety
            </Link>
          </div>

          {/* Payouts card */}
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Simple, secure payouts</h3>
            </div>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                { t: "Paid per completed booking", b: "Earnings are released after each trip completes — no chasing, no invoicing on your side." },
                { t: "Straight to your bank", b: "Payouts go to the encrypted bank details you add during onboarding." },
                { t: "Clear statements", b: "See every booking, the commission taken and your payout in one place." },
                { t: "You set the price", b: "Choose your per-day rate and availability — raise it for peak periods whenever you like." },
              ].map((row) => (
                <li key={row.t} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-go-500" />
                  <div>
                    <p className="font-bold text-navy-900">{row.t}</p>
                    <p className="text-navy-600">{row.b}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/pricing" className={buttonVariants({ variant: "primary", className: "mt-6 w-full" })}>
              See host economics <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* --------------------------------------------------------- Waitlist */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Building2 className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to earn from your space?
            </h2>
            <p className="mt-3 text-brand-100">
              Join the host waitlist and we&apos;ll invite you to get verified and list as soon as we launch
              near you.
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <WaitlistForm role="host" dark />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              No obligation — list only when you&apos;re ready.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
