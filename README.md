# ParkGo

**Park Smart. Travel Easy.**

ParkGo (PARKGO LIMITED) is a parking marketplace for the **UK & Ireland** — live
at **[www.parkgo.ai](https://www.parkgo.ai)**. Travellers book a **verified
private parking space** near an **airport, city centre, station or stadium**,
and can bundle an optional **licensed terminal transfer** (airports), **EV
charging** and **trust & security** (host verification, CCTV, live camera,
verified handover) into **one booking and one payment** — for days or just a
few hours.

This repository is the full product: the **public marketing site** and the
**three-role portal** (Traveller, Host, Admin) in a single Next.js codebase,
web-first and ready to wrap for iOS/Android with Capacitor. The terminal
transfer is fulfilled by an **independent licensed operator, integrated by
API** — there is no driver sign-up and no ParkGo driver app.

> It runs **end-to-end with zero API keys**: every integration (database,
> payments, maps, camera, email, support AI) has a mock implementation behind a
> clean interface. Set `PARKGO_MODE=live` plus the Supabase/Stripe keys and the
> same code runs against real providers.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Open `/login` and pick a **demo account** (no password in mock mode):

| Role | What you can do |
| --- | --- |
| **Traveller** | Search daily or hourly, filter (price / covered / CCTV / EV), map with price pins → build the bundle (parking + transfer one-way/return with pickup time + EV) → pay → QR access code → extend or cancel → travel-day page (status stepper, live driver map, chat with driver) → review |
| **Host / Landlord** | List spaces (photos, hourly rate, capacity), pause/reactivate a listing (holiday mode), bookings calendar, earnings chart, payout history + Excel export, KYC verification, guest-facing profile |
| **Admin / Compliance** | Triage strip, marketplace-wide search, status + date-range filters, money KPIs, host verification queue (open KYC documents, approve/reject, Excel export), listing moderation, user management (suspend / role change), payments, support tickets, transfer-operator monitoring, audit log, 5 Excel exports |

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # run the production build
npm run typecheck    # tsc --noEmit
npm test             # vitest (pricing split, hourly pricing, trust, booking lifecycle, handover, storage paths)
npm run lint         # next lint
```

---

## What's in the product

**Traveller**
- Search by destination (airports **and** city centres, stations, stadiums) with
  daily **or hourly** stays; sort and filter by price, covered, CCTV, EV.
- Space pages with host profile, reviews, price breakdown; checkout with
  transfer options (one-way/return, pickup time — airports only), EV add-on,
  card/wallet via **Stripe** (mock gateway without keys).
- Booking page with QR access code, directions, extend-stay (price difference
  charged), cancellation (free >24h, late fee within 24h, refund shown).
- Travel-day page: 4-step status stepper, live map (driver route only when a
  transfer is booked), live camera & EV status, verified handover code,
  **chat with the transfer driver**, review after the trip.

**Host**
- Listings with photo upload/removal (Supabase Storage in live mode, orphaned
  files purged), hourly rate badge, capacity, covered/CCTV/EV flags.
- **Pause/Reactivate** own listings (holiday mode) — hidden from search, no data
  lost.
- Dashboard: next-arrival countdown, grouped bookings (upcoming vs past),
  6-month earnings chart, **bookings calendar** (cars on site per day,
  month navigation), payout history with **Excel export**, Stripe Connect
  payout onboarding, KYC submission (ID + proof of address).

**Admin**
- Stat row (GMV, platform revenue, payouts due, avg booking value, cancellation
  rate) with **All time / 7 / 30 / 90-day range**, month-over-month revenue
  delta, top destinations.
- **Marketplace-wide search** (`?q=`) across bookings, listings, users and
  support tickets; booking status filter pills.
- Host verification queue showing the host's email/phone/join date/listings,
  submitted legal name & address, and **clickable KYC documents** served from
  the private bucket by an admin-only viewer route.
- Listing moderation (approve/reject/pause), **user management** (suspend /
  restore, traveller↔host role switch — admins protected), support-ticket
  queue, transfer-operator API monitoring, audit feed.
- **Excel exports** (styled workbooks + CSV fallback): bookings, users,
  waitlist, payments, verifications.

**Platform**
- **Instant support chat** on every page: guided assistant answers common
  questions; unresolved chats escalate to a support ticket + email to the
  support inbox, visible in the admin queue.
- **Notifications**: in-app feed per user with a bell + unread badge that
  clears on the `/notifications` page.
- **i18n ×5** (English, Urdu, Hindi, German, Chinese) with RTL for Urdu;
  locale-aware dates and month names.
- SEO: server-rendered, sitemap/robots, per-destination landing pages with
  JSON-LD, blog.

---

## Mock mode vs live mode

`IS_LIVE` is true only when `PARKGO_MODE=live` **and** the Supabase server keys
are set. Every data module has a mock branch (in-memory seed on `globalThis`)
and a live branch (Supabase) returning identical shapes.

| Concern | Where | Mock | Live |
| --- | --- | --- | --- |
| Data | `src/lib/data/*` | In-memory seed | **Supabase Postgres** (schema + RLS in `supabase/migrations`) |
| Auth | `src/lib/auth.ts` | Cookie session + demo logins | **Supabase Auth** (password + magic link), role-aware redirects |
| Payments | `src/lib/stripe.ts`, `services/payments.ts` | Simulated charge + split | **Stripe Checkout + Connect** (host payouts to connected accounts, webhook confirm) |
| Storage | `src/lib/storage.ts` | Token placeholders | **Supabase Storage** — public `space-photos`, private `kyc-docs` and `support-files` (signed URLs, 1h) |
| Maps | `components/portal/mapbox-map.tsx` / `live-map.tsx` | Schematic animated map | **Mapbox GL** price-pin + route maps (`NEXT_PUBLIC_MAPBOX_TOKEN`) |
| Email | `src/lib/email.ts` | Console log | **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`) |
| Inbound email | `api/support/inbound` | Off | Resend Receiving → `email.received` webhook, Svix-verified (`RESEND_WEBHOOK_SECRET`); or any provider with `SUPPORT_INBOUND_SECRET` |
| Web push | `src/lib/push.ts` | Off | Staff push alerts (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) |
| Support AI | `src/lib/support-intents.ts` | Rule-based intents (works in both modes) | Same; LLM swap-ready |
| Live camera | `services/camera.ts` | Simulated CCTV | IP/RTSP → HLS/WebRTC (interface ready) |
| Transfer operator | `services/transfer-operator.ts` | Derived from bookings | Licensed operator REST API |

The **marketplace split** is real logic in both modes (`src/lib/pricing.ts`):
platform commission (~18% parking / ~12% transfers, configurable via env) +
host/driver payouts, unit-tested so `platform + host + driver === total`.
Hourly pricing bills `ceil(hours) × price/hour`, capped at the daily rate.

---

## Database & migrations (Supabase)

Apply `supabase/migrations` in order — either `supabase db push` with the CLI,
or paste each file into the **Supabase SQL editor**:

| File | What it adds |
| --- | --- |
| `0001_init.sql` | Full schema + Row-Level Security |
| `0002_auth_profiles.sql` | Auth → profile row trigger |
| `0003_seed_airports.sql` | Destination seed |
| `0004_demo_data.sql` | Demo rows (optional; see `launch_cleanup.sql`) |
| `0005_payments_external_ref.sql` | Stripe payment references |
| `0006_payout_refunded.sql` | Refunded payout status |
| `0007_space_capacity.sql` | Multi-car capacity |
| `0008_spaces_covered.sql` | Covered-parking flag |
| `0009_hosts_bio.sql` | Host guest-facing bio |
| `0010_spaces_price_per_hour.sql` | Hourly rates |
| `0011_support_tickets.sql` | Escalated support tickets |
| `0012_transfer_messages.sql` | Traveller↔driver chat relay |
| `0013_user_suspended.sql` | Account suspension flag |
| `0014_spaces_blocked_dates.sql` | Host-blocked days |
| `0015_claims.sql` | Damage / incident claims |
| `0016_user_profile_extras.sql` | Avatars, onboarding, 2FA opt-in |
| `0017_admin_suite.sql` | Admin action log, promos, search events |
| `0018_admin_suite2.sql` | Platform settings, admin scopes, receipts |
| `0019_admin_suite3.sql` | Booking edits, waitlist invites, macros |
| `0020_host_suite.sql` | Booking messages, host bank details, review replies, weekend pricing |
| `0021_host_suite2.sql` | Seasonal pricing, bays, request-to-book, guest blocklist, co-hosts, listing views |
| `0022_team_invites.sql` | Staff invite nonce (set-password links) |
| `0023_support_suite.sql` | Support tickets: account link, priority, presence, read receipts, first-response timing, CSAT, `support-files` bucket |
| `0024_support_suite2.sql` | Support notes, tags, snooze, SLA escalation, callbacks, visitor language, agent duty flag, `push_subscriptions`; `support-files` becomes private |
| `0025_guest_suite.sql` | Saved spaces, several vehicles per account, business/VAT details, referral credit, price & availability alerts, step-free listing flag |

RLS keeps each role to its own rows; the exact address and camera stream are
released only to the paying traveller. KYC files live in the **private**
`kyc-docs` bucket (never public URLs — an admin-only route streams them);
listing photos live in the public `space-photos` bucket. Buckets are created
lazily by the app.

---

## Project structure

```
src/
  app/
    (marketing)/          Home, how-it-works, travellers, hosts, pricing,
                          trust-safety, about, faq, contact, blog,
                          airports/[slug] (all destination kinds), privacy, terms
    (portal)/
      login/              Demo logins (mock) / Supabase Auth (live)
      app/                Traveller: dashboard, search, space/[id], book/[spaceId],
                          booking/[id] (+ /track: stepper, map, camera, chat)
      host/               Dashboard (calendar, earnings, payouts), new, verify,
                          spaces/[id]/edit, export (payout .xlsx)
      admin/              Dashboard (search, filters, KPIs, queues),
                          export (5 report types), kyc (private doc viewer)
      account/            Profile & preferences
      notifications/      Notification feed (marks read on open)
  components/
    ui/ brand/ common/    Primitives, logo, Photo, LanguageSwitcher, SupportWidget
    marketing/            Header, Footer, SearchWidget (daily/hourly, destinations)
    portal/               Shell, Checkout, LiveMap/MapboxMap, EarningsChart,
                          HostCalendar, DriverChat, HandoverPanel, ReviewForm, QR
    host/                 PhotoManager (upload + remove)
  lib/
    data/                 store.ts (mock seed/API) + per-entity modules with
                          mock/live branches (bookings, hosts, users, reviews,
                          verifications, notifications, messages, support, waitlist)
    i18n/                 areas/* dictionaries (en/ur/hi/de/zh), registry, RTL
    services/             payments, maps, camera, ai, notifications, transfer-operator
    stripe.ts storage.ts email.ts export-sheet.ts pricing.ts trust.ts auth.ts
    booking-actions.ts host-actions.ts user-actions.ts chat-actions.ts
    support-actions.ts support-intents.ts        (server actions & support brain)
  types/index.ts          Domain model (single source of truth)
supabase/migrations/      Postgres schema + RLS (0001–0025)
capacitor.config.ts       iOS/Android wrapper config
```

---

## Go-live checklist

1. **Supabase**: create the project, run migrations **0001 → 0025**, run
   `launch_cleanup.sql` on launch day to drop demo rows.
   Two Vercel crons back this: `/api/admin/digest` daily (KPI digest, expired
   booking requests, arrival reminders, space watches) and `/api/admin/sla`
   every 15 minutes (support reply targets). Both need `CRON_SECRET` in live
   mode.
2. **Vercel env**: `PARKGO_MODE=live`, `NEXT_PUBLIC_PARKGO_MODE=live`,
   `NEXT_PUBLIC_SITE_URL`, Supabase URL + anon + service-role keys.
3. **Stripe**: live secret/publishable keys + webhook secret
   (`/api/stripe/webhook`), Connect enabled for host payouts.
4. **Email**: `RESEND_API_KEY` + `EMAIL_FROM`; mailboxes (info@, support@) in
   Microsoft 365.
5. **Maps**: `NEXT_PUBLIC_MAPS_PROVIDER=mapbox` + `NEXT_PUBLIC_MAPBOX_TOKEN`.
6. **Inbound support email** (optional) — lets customers reply to a support
   email and have it land back in the chat:
   - In Resend, **Domains → Receiving**: add the MX record it gives you, on a
     subdomain such as `support.parkgo.ai` (priority 10, and it must be the
     lowest priority on that host) so existing mail routing is untouched.
   - **Webhooks → Add webhook**: endpoint `https://www.parkgo.ai/api/support/inbound`
     (a full URL — a bare path is rejected), event **`email.received`** only.
   - Copy that webhook's `whsec_…` signing secret into `RESEND_WEBHOOK_SECRET`.
     Resend signs with Svix and cannot send custom headers, which is why the
     secret goes here rather than in a header.
   - `RESEND_API_KEY` must also be set: `email.received` carries metadata only,
     so the body is fetched from the receiving API.
   - Any non-Resend provider can instead POST `{from, subject, text}` with
     `SUPPORT_INBOUND_SECRET` in an `X-ParkGo-Secret` header.
7. **Staff push alerts** (optional): `npx web-push generate-vapid-keys`, then
   set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT`
   (a `mailto:` address). The button stays hidden until these exist.
8. Optional: Sentry DSN, commission overrides
   (`PARKGO_COMMISSION_PARKING_BPS` / `_TRANSFER_BPS`).

See `.env.example` for the full annotated list.

---

## Mobile (iOS / Android)

```bash
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios @capacitor/android
BUILD_TARGET=capacitor npm run build     # static export to ./out
npx cap add ios && npx cap add android
npx cap sync && npx cap open ios          # or android
```

`BUILD_TARGET=capacitor` switches `next.config.mjs` to `output: 'export'`. Add
permission usage strings (location, camera, notifications) in the native
projects. ParkGo sells real-world services, so external/card payment is
generally allowed rather than in-app purchase — confirm with legal.

---

## Security, privacy & compliance

- **UK GDPR / ICO aligned**: minimal data capture, lawful basis, retention and
  data-subject rights (see `/privacy`).
- **KYC separated** from operational data — private storage bucket, admin-only
  streaming viewer, no public URLs, path-traversal guarded.
- **Least privilege + RLS** everywhere; suspended accounts are blocked at the
  sign-in guard (admins can never be suspended or demoted).
- Exact address & host contact released **only after payment**.
- Append-only audit feed in the admin portal.

---

## Tech stack

**Next.js 15** (App Router) · **React 19** · **TypeScript** (strict) ·
**Tailwind CSS** (brand system: orange `#F26A1B` + ink `#15171A`) ·
**Supabase** (Postgres, Auth, Storage, RLS) · **Stripe Connect** ·
**Mapbox GL** · **Resend** · **ExcelJS** (styled exports) · **Vitest** ·
**lucide-react** · **qrcode** · **zod** · **Capacitor**.
