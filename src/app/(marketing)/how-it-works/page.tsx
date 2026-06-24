import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Camera,
  CarTaxiFront,
  CheckCircle2,
  CreditCard,
  MapPin,
  QrCode,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Section, Container, Eyebrow } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "From search to verified handover — see how ParkGo bundles airport parking, a licensed transfer, EV charging and live security into one booking, one price and one app.",
  path: "/how-it-works",
});

const steps = [
  {
    n: "1",
    icon: Search,
    tone: "brand" as const,
    title: "Search & compare",
    body: "Tell us your airport and dates. ParkGo shows verified private spaces with price, distance to the terminal, EV charging, CCTV and real traveller ratings — side by side, no hidden extras.",
    points: ["Verified, ID-checked hosts only", "Transparent per-day pricing", "Filter by EV, CCTV and distance"],
  },
  {
    n: "2",
    icon: CarTaxiFront,
    tone: "go" as const,
    title: "Build your bundle",
    body: "Add a licensed terminal transfer, EV charging and live security to your parking — then pay once. Explainable AI suggests the right combination for your trip, with a single transparent price.",
    points: ["Parking + transfer + EV + security", "One checkout, one price", "AI suggestions you can understand"],
  },
  {
    n: "3",
    icon: QrCode,
    tone: "accent" as const,
    title: "Pay & get your QR",
    body: "Check out securely and receive a QR access code instantly. It is everything you need for the parking gate, your driver and the verified handover — all stored in your booking.",
    points: ["Secure card payment", "Instant QR access code", "Booking saved offline in-app"],
  },
  {
    n: "4",
    icon: Radio,
    tone: "brand" as const,
    title: "Travel day",
    body: "Watch it all happen. Track your licensed driver on a live map, see your parked car on a live in-app camera, and confirm a verified handover with a one-time code — timestamped and logged.",
    points: ["Live map of customer, host & driver", "Live camera of your car", "Verified, logged handover"],
  },
  {
    n: "5",
    icon: RotateCcw,
    tone: "go" as const,
    title: "Return & review",
    body: "Land, get picked up and collect your car with another verified handover. Then rate your host and driver — two-sided trust scoring keeps the whole network honest and high quality.",
    points: ["Return transfer on landing", "Collect with verified handover", "Two-sided reviews"],
  },
];

const liveFeatures = [
  { icon: Radio, title: "Live location sharing", body: "You, your host and your licensed driver share one live map on travel day." },
  { icon: Camera, title: "Live camera of your car", body: "Open the app to watch your parked vehicle with a LIVE badge and timestamp." },
  { icon: BadgeCheck, title: "Verified handover", body: "Both parties confirm a one-time code at drop-off and collection — every event logged." },
];

const hostSteps = [
  { title: "Get verified", body: "Confirm your identity and address, then add your space — dimensions, EV, CCTV and photos." },
  { title: "Go live", body: "Pass a quick compliance review, set availability and your driveway starts earning." },
  { title: "Get paid", body: "Receive secure payouts after each completed booking — you keep the large majority." },
];

const partnerSteps = [
  { title: "Onboard your fleet", body: "Add drivers, vehicles, licences and insurance. We verify before you receive jobs." },
  { title: "Receive bundled jobs", body: "Accept terminal transfers that come pre-attached to a parking booking." },
  { title: "Confirm & get paid", body: "Share live location, complete a verified handover and get paid per completed job." },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-16 text-center lg:py-20">
          <Badge tone="go" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> One booking · one price · one app
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">
            How ParkGo works, from search to verified handover
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-navy-600">
            Most travellers juggle parking, a transfer and EV charging across three apps and prices.
            ParkGo brings them into a single trusted journey you can watch the whole way.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start a booking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See pricing
            </Link>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------- The traveller journey */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The traveller journey</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Five steps from your driveway search to landing back home
          </h2>
          <p className="mt-4 text-navy-600">
            Every step is verified, transparent and tracked. No surprises at the gate, no guessing where your car is.
          </p>
        </div>

        <ol className="mt-14 space-y-6">
          {steps.map((s) => (
            <li key={s.n}>
              <Card className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-go-500 text-lg font-bold text-white">
                    {s.n}
                  </span>
                  <div
                    className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:inline-flex ${
                      s.tone === "brand"
                        ? "bg-brand-50 text-brand-600"
                        : s.tone === "go"
                          ? "bg-go-50 text-go-600"
                          : "bg-accent-50 text-accent-500"
                    }`}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900">{s.title}</h3>
                  <p className="mt-2 max-w-2xl text-navy-600">{s.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700">
                        <CheckCircle2 className="h-4 w-4 text-go-500" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------ Live on travel day */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Live on travel day</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Peace of mind you can actually watch
          </h2>
          <p className="mt-4 text-navy-600">
            ParkGo&apos;s differentiators come alive the day you fly. These three features turn a stressful
            morning into something you can follow in real time.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {liveFeatures.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-navy-600">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------- What you get in one checkout */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>One transparent price</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Four services, bundled into a single checkout
            </h2>
            <p className="mt-4 text-navy-600">
              No bouncing between providers or comparing apples with oranges. ParkGo combines everything
              into one price you can understand, with a small, clearly shown service fee.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: MapPin, tone: "brand", title: "Verified private parking", body: "An ID-checked host&apos;s driveway or yard near your terminal." },
                { icon: CarTaxiFront, tone: "go", title: "Licensed terminal transfer", body: "A licensed, insured driver to and from the airport door." },
                { icon: Zap, tone: "accent", title: "EV charging", body: "Top up while you travel where the host offers a charger." },
                { icon: ShieldCheck, tone: "navy", title: "Live security", body: "CCTV, a live camera and verified handovers throughout." },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
                  <div>
                    <h3 className="font-bold text-navy-900">{f.title}</h3>
                    <p
                      className="text-sm text-navy-600"
                      dangerouslySetInnerHTML={{ __html: f.body }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-7">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-bold uppercase tracking-wide text-navy-500">
                Example bundle
              </span>
            </div>
            <dl className="mt-5 divide-y divide-navy-100 text-sm">
              {[
                { k: "Airport parking", v: "from your chosen host" },
                { k: "Licensed transfer", v: "both ways" },
                { k: "EV charging", v: "optional add-on" },
                { k: "Service fee", v: "£2.99" },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-3">
                  <dt className="font-medium text-navy-700">{row.k}</dt>
                  <dd className="text-navy-500">{row.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm font-bold text-navy-700">One price at checkout</span>
              <span className="text-2xl font-extrabold text-navy-900">~£49</span>
            </div>
            <p className="mt-3 text-xs text-navy-500">
              Indicative example. Your price depends on airport, dates and the add-ons you choose.
            </p>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "outline", className: "mt-5 w-full" })}
            >
              How pricing works <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* ----------------------------------------------- For hosts & partners */}
      <Section className="bg-navy-50/50">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The other side of the network</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            How it works for hosts and transfer partners
          </h2>
          <p className="mt-4 text-navy-600">
            Travellers only get a seamless trip because hosts and licensed partners are verified and
            paid fairly. Here is the short version of each.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">For hosts</h3>
            </div>
            <ol className="mt-5 space-y-4">
              {hostSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-go-100 text-xs font-bold text-go-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-navy-900">{s.title}</p>
                    <p className="text-sm text-navy-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/hosts"
              className={buttonVariants({ variant: "primary", className: "mt-6 w-full" })}
            >
              List your space <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                <CarTaxiFront className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">For transfer partners</h3>
            </div>
            <ol className="mt-5 space-y-4">
              {partnerSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-navy-900">{s.title}</p>
                    <p className="text-sm text-navy-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/transfer-partners"
              className={buttonVariants({ variant: "accent", className: "mt-6 w-full" })}
            >
              Become a partner <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-navy-800">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <Container className="relative py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Banknote className="mx-auto mb-4 h-8 w-8 text-go-300" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to park smart and travel easy?
            </h2>
            <p className="mt-3 text-brand-100">
              Start a booking in minutes, or join the waitlist for your airport and we&apos;ll let you know the moment we go live.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className={buttonVariants({ variant: "white", size: "lg" })}>
                Start a booking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/travellers"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                For travellers
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-brand-200">
              <Star className="h-3.5 w-3.5 fill-current text-accent-300" />
              8 launch airports across the UK &amp; Ireland.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
