# ParkGo

**Park Smart. Travel Easy.**

ParkGo is an integrated airport-access marketplace for the **UK & Ireland**. It
bundles four things travellers normally arrange separately — a **verified private
parking space**, an optional **licensed terminal transfer**, **EV charging**, and
**trust & security** (verification, CCTV, live camera, verified handover) — into
**one booking and one payment**.

This repository is a full-stack foundation: the **public marketing site** and the
**four-role portal** (Traveller, Host, Transfer Provider, Admin) in a single
Next.js codebase, **web-first** and ready to wrap for iOS/Android with Capacitor.

> It runs **end-to-end with zero API keys** — every integration (payments, maps,
> live camera, AI, KYC, notifications) has a mock implementation behind a clean
> interface, so you can demo the whole product today and swap in real providers
> per `.env`.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Then open the site and click **Get started → Sign in** (or go to `/login`) and
pick any of the four **demo accounts** (no password — mock mode):

| Role | What you can do |
| --- | --- |
| **Traveller** | Search → bundle → pay → QR → live track + camera + verified handover → review |
| **Host / Landlord** | List spaces, see bookings, earnings & payouts, verification status |
| **Transfer Provider** | Manage drivers/vehicles/docs, jobs, confirm handovers, earnings |
| **Admin / Compliance** | Verification queue (approve/reject), trust scores, payments, audit log |

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # run the production build
npm run typecheck    # tsc --noEmit
npm test             # vitest (pricing split, trust, booking lifecycle, handover)
npm run lint         # next lint
```

---

## The demo walkthrough (acceptance criteria)

1. **Bundle & pay** — as the Traveller, search an airport → open a space →
   *Build your bundle* (parking + transfer + EV) → pay → you get a **QR access code**.
2. **Travel day** — open the active trip → **live map** of the driver, **live
   camera** of your car, and a **verified handover** (enter the 6-char code).
3. **Host → verify → live** — as the Host, *List a new space* (it enters review);
   as the Admin, approve it under **Verification queue** → it appears in search.
4. **Transfer onboarding** — the Admin approves a transfer provider's
   licence/insurance → the provider can be assigned jobs.
5. **Languages** — the language switcher (top bar) toggles **English / Urdu /
   Hindi / German / Chinese**, with right-to-left layout for Urdu.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS** with the ParkGo brand system (navy `#0E2A47`, blue `#1B6CB3`,
  green `#36B24A`, accent orange `#E8842B`)
- **Vitest** for unit tests of core logic
- **lucide-react** icons, **qrcode** for QR generation, **zod** for validation
- **Supabase** (Postgres + RLS + Auth + Realtime + Storage) for production data —
  schema provided in `supabase/migrations` (mock mode needs none of it)
- **Capacitor** to ship the web build as iOS/Android apps (`capacitor.config.ts`)

### Why one codebase?

Per the chosen **web-first + Capacitor** strategy, the marketing site and the
portal share components, types and branding. The web build is SEO-strong
(server-rendered, sitemap, JSON-LD, airport landing pages); the same build is
exported statically and wrapped for the app stores.

---

## Mock mode vs live mode

Everything is gated by `PARKGO_MODE` (default `mock`) and per-provider env vars.
Each integration is an interface with a mock implementation and a documented swap
point — see `.env.example`.

| Concern | Interface | Mock | Live (swap in) |
| --- | --- | --- | --- |
| Data / Auth | `src/lib/data/store.ts`, `src/lib/auth.ts` | In-memory seed + cookie session | Supabase (schema in `supabase/migrations`) |
| Payments (split) | `src/lib/services/payments.ts` | Simulated charge + split | **Stripe Connect** (+ crypto provider TBD) |
| Maps / live location | `src/lib/services/maps.ts` + `LiveMap` | Schematic animated map | Mapbox / Google Maps |
| Live camera | `src/lib/services/camera.ts` + `CameraView` | Simulated CCTV feed | IP/RTSP → HLS/WebRTC |
| AI | `src/lib/services/ai.ts` | Transparent heuristics | LLM (Anthropic/OpenAI) |
| Identity / KYC | (documents in data model) | Marked verified | Stripe Identity / Onfido |
| Notifications | `src/lib/services/notifications.ts` | Console + in-app feed | Expo Push / Resend / SendGrid |

The **marketplace split** is real logic in both modes (`src/lib/pricing.ts`):
platform commission (~18% parking / ~12% transfers, configurable) + host/driver
payouts, with a unit test asserting `platform + host + driver === total`.

---

## Project structure

```
src/
  app/
    (marketing)/        Public site: home, how-it-works, travellers, hosts,
                        transfer-partners, pricing, trust-safety, about, faq,
                        contact, blog, airports/[slug], privacy, terms
    (portal)/
      login/            Demo logins per role
      app/              Traveller: dashboard, search, space/[id], book/[spaceId],
                        booking/[id], booking/[id]/track  (live map + camera + handover)
      host/             Host dashboard + new listing
      transfer/         Transfer provider dashboard
      admin/            Admin & compliance dashboard
    sitemap.ts robots.ts layout.tsx globals.css
  components/
    ui/                 Button, Card, Badge, Field, Section (brand primitives)
    brand/              Logo / wordmark
    common/             Photo, Stars, LanguageSwitcher
    marketing/          Header, Footer, SearchWidget, Waitlist/Contact forms
    portal/             Shell, StatusBadge, StatCard, SpaceCard, LiveMap,
                        CameraView, HandoverPanel, Checkout, QR, ReviewForm
  lib/
    data/               seed.ts (demo dataset) + store.ts (data API)
    services/           payments, maps, camera, ai, notifications
    i18n/               config, dictionaries (en/ur/hi/de/zh), switcher action
    auth.ts auth-actions.ts pricing.ts trust.ts seo.ts utils.ts
    booking-actions.ts host-actions.ts   (server actions)
  content/blog.ts       Blog posts
  types/index.ts        Domain model (single source of truth)
supabase/migrations/    Production Postgres schema + Row-Level Security
capacitor.config.ts     iOS/Android wrapper config
```

---

## Data model

TypeScript types in `src/types/index.ts` mirror the Postgres schema in
`supabase/migrations/0001_init.sql`. Entities: `users`, `verifications`,
`hosts`, `spaces`, `transfer_providers`, `drivers`, `vehicles`, `bookings`,
`transfers`, `locations_live`, `camera_streams`, `payments`, `reviews`,
`trust_scores`, `notifications`, `corporate_accounts`, `referrals`, `audit_log`,
`waitlist`. Money is stored in **minor units (pence)** throughout.

### Production database (Supabase)

```bash
# with the Supabase CLI configured
supabase db push          # applies supabase/migrations/0001_init.sql
```

Row-Level Security is enabled on every table so each role sees only its own data
(travellers their bookings, hosts their spaces/bookings, admins everything). The
exact address and live camera are gated to the paying traveller — both in the app
layer and in the `camera_streams` RLS policy.

---

## Internationalisation

Lightweight dictionary i18n in `src/lib/i18n` covering **English, Urdu, Hindi,
German, Chinese**, with English fallback for any missing key and **RTL** layout
for Urdu. The locale is stored in a cookie and applied on `<html lang dir>`. UI
chrome (nav, hero, CTAs) is translated; long-form marketing/legal copy is English
with the switcher demonstrated — full content translation is a content task, and
the AI `translate()` hook is ready for on-the-fly translation of host free-text.

---

## SEO

Server-rendered pages, `metadataBase` + per-page OpenGraph/canonical
(`src/lib/seo.ts`), `sitemap.xml`, `robots.txt`, and **per-airport landing
pages** (`/airports/[slug]`, statically generated) with `AggregateOffer` /
`FAQPage` / `BreadcrumbList` JSON-LD. The blog is statically generated.

---

## Mobile (iOS / Android)

```bash
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios @capacitor/android
BUILD_TARGET=capacitor npm run build     # static export to ./out
npx cap add ios && npx cap add android
npx cap sync && npx cap open ios          # or android
```

`BUILD_TARGET=capacitor` switches `next.config.mjs` to `output: 'export'`. Add the
permission usage strings (location, camera, notifications) in the native projects
to satisfy the iOS privacy manifest and Android Data safety form. Because ParkGo
sells **real-world services**, external/card payment is generally allowed (not
in-app purchase) — confirm with legal.

---

## Security, privacy & compliance

- **UK GDPR / ICO aligned**: minimal data capture, lawful basis, consent,
  retention, and data-subject access/erasure (see `/privacy`).
- **KYC separated** from operational data; sensitive data encrypted at rest/in
  transit; **no secrets in the client**.
- **Least-privilege + row-level security**; append-only **audit log**.
- Traveller exact address & host contact are **released only after payment**.

---

## What's implemented vs. scaffolded

**Implemented (works in mock mode, end-to-end):** marketing site + SEO; auth &
RBAC with demo logins; traveller search → bundle → checkout → QR → live tracking →
live camera → verified handover → review; host dashboard + new-listing flow;
transfer dashboard + handover; admin verification queue/trust/payments/audit;
marketplace split pricing; i18n + RTL; QR codes; tests for the core logic.

**Scaffolded behind interfaces (swap providers for production):** Stripe Connect
charges & payouts; crypto payments; Mapbox/Google maps; real HLS/WebRTC camera;
Stripe Identity/Onfido KYC; Expo/Resend notifications; LLM-backed AI; Supabase
persistence (schema + RLS provided). Photo uploads use on-brand placeholders.

This maps to the brief's milestones: **1 Foundations**, **2 Core booking**,
**3 Real-time**, **4 Trust & compliance**, **5 AI & multilingual**, **6 Website +
store config** are all represented; production hardening of each provider is the
next phase.

---

## Decisions to confirm (from the brief)

These are wired with sensible defaults; confirm before production:

1. **Stack** — web-first + Capacitor (chosen). Backend: **Supabase** (recommended).
2. **Crypto payment** provider & supported coins/rails — _TBD_.
3. **Live-camera** approach & supported IP-camera hardware — _TBD_ (HLS/WebRTC interface ready).
4. **Identity/KYC** (Stripe Identity vs Onfido) and **maps** (Mapbox vs Google).
5. **Pricing/commission** — defaults: ~£49 bundle, 18% parking / 12% transfer (configurable in `.env`).
6. **Launch airports** — 8 seeded (Heathrow, Gatwick, Stansted, Luton, Manchester,
   Birmingham, Edinburgh, Dublin) and a go-live date.

---

_Figures such as the £49 bundle, commission rates and launch list are indicative
and to be confirmed against live data._
