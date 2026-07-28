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
| **Traveller** | Search daily or hourly, filter (price / covered / CCTV / EV / step-free), map with price pins → build the bundle (parking + transfer one-way/return with pickup time + EV) → pay (or check out as a guest, no account) → QR access code → extend, amend dates or cancel → travel-day page (status stepper, live driver map, chat with driver) → review. Plus saved spaces, trips + rebook, calendar export, offline pass, referrals |
| **Host / Landlord** | List spaces (photos, hourly rate, capacity), pause/reactivate a listing (holiday mode), bookings calendar, earnings chart, payout history + Excel export, KYC verification, guest-facing profile |
| **Admin / Compliance** | Triage strip, marketplace-wide search, status + date-range filters, money KPIs, host verification queue (open KYC documents, approve/reject, Excel export), listing moderation, user management (suspend / role change), payments, support console, transfer-operator monitoring, audit log, 5 Excel exports |

A fourth seeded account, **`user_admin2`** (Ops Support), carries
`adminScope: "support"` — an admin who can work the support console but cannot
see money pages, exports or platform settings. There is no demo button for it;
set the `parkgo_session` cookie to `user_admin2` to try the scope guard. In
live mode these are real staff created through **`/team/login`** and the invite
flow rather than seeded.

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # run the production build
npm run typecheck    # tsc --noEmit
npm test             # vitest — 308 tests across 27 files
npm run lint         # next lint
```

The suite covers the money paths (commission split, hourly pricing, payout
hold), the guards (admin scopes, staff sessions, auth redirects, 2FA core),
the support brain (intents, bot, queue, business hours, SLA stats, inbound
parsing, Svix signatures), the guest suite (saved spaces, vehicles, referral
credit), the rewards maths (loyalty clamped to the platform's cut, gift cards
and passes as prepayments rather than discounts), and the flight rules (which
designators are real, when a delay is worth extending for). See
**[Quality gates](#quality-gates)** for the audits that run against a real build.

---

## What's in the product

**Support**
- Live chat with a rule-based first responder, escalation to a human, saved
  replies, attachments, typing and read receipts, priority triage, CSAT.
- **Any language in, English out — and back again.** A visitor writing in Urdu,
  Hindi, German or Chinese reaches the agent console in English; the agent
  writes English and the visitor receives it in their own language. Neither
  side is ever shown a translation on its own: the original sits underneath it,
  every time. Machine translation drops negations often enough that an agent
  acting only on the English could refund the wrong booking — and a customer
  reading "we have refunded you" deserves the sentence the company actually
  wrote, not only a machine's copy of it.

**Traveller**
- Search by destination (airports **and** city centres, stations, stadiums) with
  daily **or hourly** stays; sort and filter by price, covered, CCTV, EV and
  **step-free access**.
- Space pages with host profile, reviews, price breakdown; checkout with
  transfer options (one-way/return, pickup time — airports only), EV add-on,
  card/wallet via **Stripe** (mock gateway without keys).
- **Guest checkout** — book without signing up first. The account is created
  from the checkout details mid-payment and the traveller lands signed in. An
  email that already has an account is refused rather than adopted, so checkout
  can never be used to walk into someone else's bookings.
- Booking page with QR access code, directions, extend-stay (price difference
  charged), cancellation (free >24h, late fee within 24h, refund shown).
- **Amend dates** after booking — shift or shorten a stay when the new dates
  cost the same or less; the difference comes back as account credit and the
  host payout is rewritten to match the days actually used. Availability is
  re-checked ignoring the booking being amended.
- Travel-day page: 4-step status stepper, live map (driver route only when a
  transfer is booked), live camera & EV status, verified handover code,
  **chat with the transfer driver**, review after the trip.
- **Trips**: upcoming and past in one place, one-tap **rebook** of a past trip
  with the dates prefilled.
- **Take the booking off the network** three ways — add it to a calendar
  (`.ics` with two alarms), open an **offline pass** (`/pass/[id]`, a service
  worker keeps the QR readable with no signal), or **share it with a second
  driver** by signed link, which shows the pass without granting any access to
  the account.
- **Account**: saved spaces, several vehicles per account, business/VAT details
  for company bookings, accessibility preferences, saved card for next time.
- **Paid extras at checkout**: cancellation protection (waives the late-cancel
  fee; the premium itself is not refunded because the cover was used) and
  **car care** the host performs while the car is parked — a wash, a valet, a
  tyre check — priced off the listing, not off the posted form.
- **Rewards**: a loyalty tier earned by completed trips rather than money spent
  (Silver/Gold/Platinum at 3/8/20 trips, 3/6/10% off the parking), **gift cards**
  and **trip passes** of prepaid parking days. Loyalty is a discount the
  platform absorbs and is clamped to its own cut; gift cards and passes are
  **prepayments** — they reduce what reaches the card without changing what the
  host is owed.
- **Flight tracking**: attach a return flight and a late landing extends the
  stay automatically, free. The host is still paid for the extra time, funded
  out of the platform's commission rather than out of them.
- **Travel-day tools**: wallet pass, "I'm N minutes away" to the host,
  timestamped **condition photos** at drop-off and pick-up that neither side can
  delete, an assistance request that reaches the host's board, and opt-in SMS.
- **Group bookings** (two cars, one reservation, capacity checked per car),
  **company accounts** (one owner, one invoice, month-to-date spend), a
  **date waitlist** for when a search comes back empty, a **journey share** link
  that shows progress without the address or gate code, and **claims with
  photos**, because photographs are what settle a damage dispute.
- **Referrals**: a personal code, credit for the referrer once the invited
  traveller completes a first booking, applied automatically at checkout while
  leaving enough to satisfy Stripe's minimum charge.
- **Price & availability alerts** — watch a space or a destination and get
  notified when a price drops or a space frees up.

**Host**
- Listings with photo upload/removal (Supabase Storage in live mode, orphaned
  files purged), hourly rate badge, capacity, covered/CCTV/EV flags.
- **Pause/Reactivate** own listings (holiday mode) — hidden from search, no data
  lost.
- Dashboard: next-arrival countdown, grouped bookings (upcoming vs past),
  6-month earnings chart, **bookings calendar** (cars on site per day,
  month navigation), payout history with **Excel export**, Stripe Connect
  payout onboarding, KYC submission (ID + proof of address).
- **Today** view for arrivals and departures, per-booking detail with guest
  messaging, **analytics** (views → bookings, occupancy), review replies, a
  downloadable **statement**, and an **iCal feed** (`/api/host/ical`) so the
  bookings show up in whatever calendar the host already uses.
- Pricing controls beyond the base rate: weekend and seasonal rates, bays,
  **request-to-book**, a guest blocklist, blocked dates and co-hosts.
- Payouts are held for a configurable window after pick-up (`payoutHoldDays`)
  so a dispute can still be resolved against the money.

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
  restore, traveller↔host role switch — admins protected), transfer-operator
  API monitoring, claims, promos, broadcasts, platform settings, audit feed.
- **Excel exports** (styled workbooks + CSV fallback): bookings, users,
  waitlist, payments, verifications.
- **Two admin tiers.** Support agents hold `role: "admin"` so they can work
  tickets, but `requireFinanceAdmin()` keeps them out of payments, payouts,
  exports and settings — the pages redirect, and the controls are not rendered
  in the first place. Staff are invited by email, set their own password, and
  sign in at `/team/login`; a signed nonce makes the invite single-use.

**Support console**
- **Live two-way chat** with the visitor widget: typing indicators, read
  receipts, attachments (private bucket, signed URLs), canned macros, notes,
  tags, snooze and priority.
- **Round-robin assignment** across on-duty agents, **SLA reply targets** with
  escalation when one is about to breach, business hours with an out-of-hours
  auto-reply, and callback requests.
- **CSAT** with an optional comment, plus an analytics page (volume, first
  response, resolution, satisfaction).
- **Inbound email** folds a customer's reply back into the same thread, and
  **web push** reaches the on-call agent with the tab closed.
- The bot answers in the visitor's language across all five locales before
  handing off.

**Platform**
- **Instant support chat** on every page: the assistant answers common
  questions, and anything it can't resolve escalates to a ticket, an email to
  the support inbox and a live agent — same thread throughout.
- **Notifications**: in-app feed per user with a bell + unread badge that
  clears on the `/notifications` page.
- **i18n ×5** (English, Urdu, Hindi, German, Chinese) with RTL for Urdu;
  locale-aware dates and month names.
- **Accessibility**: WCAG 2.1 AA on all 35 pages, text and icons, verified in a
  real browser rather than asserted — see [Quality gates](#quality-gates). The
  measured palette rules live in `tailwind.config.ts`; the short version is
  that orange backgrounds carry near-black text (white can never clear 4.5:1 on
  `#F26A1B`), orange text is `-700`, orange icons are `-600`, and on the dark
  CTA gradient it inverts to `-100` and `-200`.
- **SEO**: server-rendered, sitemap/robots, canonicals everywhere,
  per-destination landing pages with JSON-LD (`Airport` + `BreadcrumbList` +
  `FAQPage`), `Organization` and `WebSite` on the homepage, and a 1200×630
  share card on every page so links posted to WhatsApp, LinkedIn or Slack
  render as a card instead of a bare URL.

---

## Mock mode vs live mode

`IS_LIVE` is true only when `PARKGO_MODE=live` **and** the Supabase server keys
are set. Every data module has a mock branch (in-memory seed on `globalThis`)
and a live branch (Supabase) returning identical shapes.

| Concern | Where | Mock | Live |
| --- | --- | --- | --- |
| Data | `src/lib/data/*` | In-memory seed | **Supabase Postgres** (schema + RLS in `supabase/migrations`) |
| Auth | `src/lib/auth.ts` | Cookie session + demo logins | **Supabase Auth** (password + magic link), role-aware redirects. Guest checkout creates the account mid-payment and signs them in. |
| Payments | `src/lib/stripe.ts`, `services/payments.ts` | Simulated charge + split | **Stripe Checkout + Connect** (host payouts to connected accounts, webhook confirm) |
| Storage | `src/lib/storage.ts` | Token placeholders | **Supabase Storage** — public `space-photos`, private `kyc-docs` and `support-files` (signed URLs, 1h) |
| Maps | `components/portal/mapbox-map.tsx` / `live-map.tsx` | Schematic animated map | **Mapbox GL** price-pin + route maps (`NEXT_PUBLIC_MAPBOX_TOKEN`) |
| Email | `src/lib/email.ts` | Console log | **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`) |
| Inbound email | `api/support/inbound` | Off | Resend Receiving → `email.received` webhook, Svix-verified (`RESEND_WEBHOOK_SECRET`); or any provider with `SUPPORT_INBOUND_SECRET` |
| Web push | `src/lib/push.ts` | Off | Staff push alerts (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) |
| Flight tracking | `src/lib/flights.ts` | Off — the number is stored but not watched | **AviationStack** (`AVIATIONSTACK_KEY`); a delay extends the stay free, funded from the platform's own cut |
| Travel-day SMS | `src/lib/sms.ts` | Off | **Twilio** (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`). Opt-in per account on top of the keys |
| Wallet passes | `src/lib/wallet.ts` | Off — `/pass/[id]` works offline regardless | **Google Wallet** (`GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_CLASS_ID`, `GOOGLE_WALLET_SA_EMAIL`, `GOOGLE_WALLET_SA_KEY`); **Apple Wallet** needs a Pass Type certificate (`APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_PASS_CERT_P12`, `APPLE_WWDR_CERT`) |
| Support AI | `src/lib/support-intents.ts` | Rule-based intents (works in both modes) | Same; LLM swap-ready |
| Support translation | `src/lib/translate.ts` | Off (`PARKGO_DEMO_TRANSLATE=1` shows the console wiring with clearly-labelled placeholder text) | **DeepL** (`DEEPL_API_KEY`) or **Google Translate** (`GOOGLE_TRANSLATE_API_KEY`) — visitor messages rendered into English for the team, agent replies rendered into the visitor's language, original always kept on both sides |
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
| `0026_guest_suite2.sql` | Cancellation protection, host car-care services, gift cards, trip passes, loyalty counter, flight tracking columns, condition photos, date waitlist, group bookings, company accounts, claim photos |

RLS keeps each role to its own rows; the exact address and camera stream are
released only to the paying traveller. KYC files live in the **private**
`kyc-docs` bucket (never public URLs — an admin-only route streams them);
listing photos live in the public `space-photos` bucket. Buckets are created
lazily by the app.

---

## Project structure

```
src/
  middleware.ts           Supabase session refresh + staff idle timeout.
                          NOTE: must live at src/middleware.ts, not the repo
                          root — with an src/app project a root-level
                          middleware.ts is silently never compiled.
  app/
    (marketing)/          Home, how-it-works, travellers, hosts, pricing,
                          trust-safety, about, faq, contact, blog,
                          airports/[slug] (all destination kinds), privacy, terms
    (portal)/
      login/              Demo logins (mock) / Supabase Auth (live)
      team/               Staff: login, accept (invite → set password)
      app/                Traveller: dashboard, search, saved, trips,
                          space/[id], book/[spaceId],
                          booking/[id] (+ /track, /receipt)
      host/               Dashboard (calendar, earnings, payouts), today, new,
                          verify, analytics, reviews, settings, statement,
                          bookings/[id], spaces/[id]/edit, export (payout .xlsx)
      admin/              Dashboard (search, filters, KPIs, queues), support,
                          users, listings, payments, verification, analytics,
                          claims, promos, reviews, broadcast, operator, today,
                          audit, settings, export, kyc (private doc viewer)
      account/            Profile, vehicles, business details, referrals
      notifications/      Notification feed (marks read on open)
      verify-2fa/         Admin second factor
    pass/[id]             Offline booking pass (signed link, works with no signal)
    api/                  stripe/*, support/* (thread, inbound, push, context),
                          booking/[id]/ics, host/ical, geo/suggest, health,
                          admin/digest + admin/sla (cron endpoints)
  components/
    ui/ brand/ common/    Primitives, logo, Photo, LanguageSwitcher, SupportWidget
    marketing/            Header, Footer, SearchWidget (daily/hourly, destinations)
    portal/               Shell, Checkout, LiveMap/MapboxMap/ResultsMap,
                          EarningsChart, HostCalendar, DriverChat, OfflinePass,
                          SaveSpaceButton, HandoverPanel, ReviewForm, QR
    admin/                SupportLiveThread, TemplatePicker, PushToggle
    host/                 PhotoManager (upload + remove), BlockedDatesPicker
  lib/
    data/                 store.ts (mock seed/API) + per-entity modules with
                          mock/live branches (bookings, hosts, users, reviews,
                          verifications, notifications, messages, support,
                          saved, settings, waitlist)
    i18n/                 areas/* dictionaries (en/ur/hi/de/zh), registry, RTL
    services/             payments, maps, camera, ai, notifications, transfer-operator
    stripe.ts storage.ts email.ts export-sheet.ts pricing.ts trust.ts auth.ts
    payouts.ts referrals.ts referral-payout.ts space-alerts.ts alert-sweep.ts
    guest-checkout.ts booking-share.ts booking-calendar.ts booking-access.ts
    support-{sla,assign,queue,lang,escalate,inbound,hours,stats,bot}.ts
    staff-session.ts team-invite.ts svix.ts push.ts ical.ts impersonation.ts
    *-actions.ts          Server actions (booking, host, user, chat, support,
                          guest, team, admin)
  types/index.ts          Domain model (single source of truth)
public/
  sw-pass.js              Caches the offline pass (network-first, /pass/* only)
  sw-push.js              Staff web-push receiver
  og.png                  1200×630 share card
scripts/
  a11y/contrast-all.mjs   WCAG AA audit, 35 routes, text + icons
  seo/audit.mjs           Titles, descriptions, canonicals, og:image, JSON-LD
  og/og-card.html         Source of public/og.png — screenshot it to rebuild
supabase/migrations/      Postgres schema + RLS (0001–0025)
capacitor.config.ts       iOS/Android wrapper config
```

---

## Quality gates

Beyond `npm test`, several audits run against a **real production build in a
real browser**, because they check things that only exist once the page is
composed — a colour is only wrong against the background it actually lands on,
and a meta tag is only right once the framework has finished resolving it.

```bash
npm i -D playwright && npx playwright install chromium   # one time

npm run build && npm start &                # audits need a running build
BASE=http://localhost:3000 npm run audit:a11y     # contrast, 35 routes
BASE=http://localhost:3000 npm run audit:seo      # titles, canonicals, JSON-LD
BASE=http://localhost:3000 npm run audit:motion   # prefers-reduced-motion
BASE=http://localhost:3000 npm run e2e:search     # destination suggestions
BASE=http://localhost:3000 npm run e2e:nav        # current-page indicator
BASE=http://localhost:3000 npm run e2e:guest2     # traveller round two

# Support translation needs the placeholder provider switched on:
#   PARKGO_DEMO_TRANSLATE=1 npm start &
BASE=http://localhost:3000 npm run e2e:translate

npm run audit:i18n                          # no server needed
```

Both exit non-zero when they find something, so they drop straight into CI, and
both refuse to run at all if `BASE` isn't serving — a dead server would
otherwise read as a clean sweep, since a page that renders nothing has nothing
that can fail.

**`audit:a11y`** walks 35 routes — marketing signed out, portal behind each
role's session cookie — and applies both WCAG floors: 4.5:1 for text (3:1 once
it is 24px, or 18.66px bold) and 3:1 for icons as graphical objects. Two
details matter or it quietly lies to you. A gradient band reports
`background-color: transparent`, so a naive ancestor climb sails past it to the
white body and scores white-on-white at 1:1 — it pulls the stops out of the
gradient and judges against the worst one instead. And a full-bleed background
texture is decoration, not a graphical object, so those are skipped by
geometry.

Currently **98 findings, all the same one**: white on ParkGo orange is 3.06:1,
below the 4.5:1 floor. That is a deliberate, informed brand decision — the
orange is not moving and the labels stay white — so the audit reports it rather
than being taught to ignore it. `#C9510B` is the same hue at 4.50:1 and is
recorded in `tailwind.config.ts` as the swap that would clear all 98 without
touching anything else. **Any finding that is not white-on-orange is a
regression.**

**`audit:seo`** checks title and description length against what Google
actually renders, plus canonical, `og:image`, JSON-LD validity, `h1` count and
missing `alt`s, across all 13 public pages. Currently **0 findings**.

**`audit:motion`** loads the marketing pages under `prefers-reduced-motion` and
checks that nothing is left hidden — a scroll-triggered reveal that never fires
is content that does not exist for anyone who turned animation off.

**`audit:i18n`** compares every locale against English per area. English is the
source of truth and everything falls back to it, so a missing key is never a
crash, which is exactly why it goes unnoticed. Areas a signed-in user acts on
(`core`, `portalTraveller`, `guestSuite`) must be complete in all five
languages; marketing copy is allowed to fall back.

To rebuild the share card, edit `scripts/og/og-card.html` and screenshot it at
1200×630 — it is rendered in a browser rather than drawn by hand so it inherits
the site's own type and palette.

---

## Go-live checklist

1. **Supabase**: create the project, run migrations **0001 → 0026**, run
   `launch_cleanup.sql` on launch day to drop demo rows.

   Migrations are applied by hand, so there is always a gap between a deploy and
   the SQL landing. The app is built to survive that gap: writes that touch
   columns a migration has not added yet retry without them and log a warning,
   so checkout keeps working and only the new fields are lost until you run it.
   Reads use `select("*")`, so a missing column simply comes back undefined.
2. **Crons.** `vercel.json` declares **one** cron — `/api/admin/digest`, daily
   at 07:00 — and that is deliberate. Vercel Hobby allows daily schedules only,
   and a sub-daily entry does not degrade, it **fails the whole deployment**,
   which means every commit after it silently never reaches the site. One daily
   entry deploys on any plan.

   That daily pass runs every sweep: expired booking requests, arrival
   reminders, space watches, the date waitlist, flight delays and support reply
   targets. Add an env var named exactly **`CRON_SECRET`** — Vercel then sends
   it as `Authorization: Bearer …` automatically and the routes reject anything
   else.

   **On Pro**, two of those want to run far more often than once a day. Add them
   back and redeploy:

   ```jsonc
   {
     "crons": [
       { "path": "/api/admin/digest",   "schedule": "0 7 * * *"   },
       { "path": "/api/admin/sla",      "schedule": "*/15 * * * *" },  // Pro only
       { "path": "/api/booking/flights","schedule": "*/30 * * * *" }   // Pro only
     ]
   }
   ```

   Both routes are idempotent, so the daily pass finding nothing left to do is
   the expected outcome, not a sign it is misconfigured. A delayed flight is the
   one that really needs the frequent schedule: once a day, the traveller may be
   home before it fires.

3. **Vercel env**: `PARKGO_MODE=live`, `NEXT_PUBLIC_PARKGO_MODE=live`,
   Supabase URL + anon + service-role keys, and
   **`NEXT_PUBLIC_SITE_URL=https://www.parkgo.ai`** — canonicals, the sitemap
   and every `og:image` are built from it, so if it is left on localhost the
   share cards point at a dead host and no preview renders anywhere.
4. **Stripe**: live secret/publishable keys + webhook secret
   (`/api/stripe/webhook`), Connect enabled for host payouts. Saved cards,
   automatic payouts and the disputes view stay hidden until these exist.
5. **Email**: `RESEND_API_KEY` + `EMAIL_FROM`; mailboxes (info@, support@) in
   Microsoft 365.
6. **Maps**: `NEXT_PUBLIC_MAPS_PROVIDER=mapbox` + `NEXT_PUBLIC_MAPBOX_TOKEN`.
   The token must **not** carry a URL restriction: postcode lookups run on the
   server, which sends no `Referer`, so a restricted token returns 401 and
   every postcode silently finds nothing. `/api/geo/suggest?q=sw1a&diag=1`
   reports which endpoint answered and why.
7. **Flight delays** (optional): `AVIATIONSTACK_KEY`. Without it a flight
   number is stored and shown but never watched, and no stay is ever extended.
8. **Travel-day SMS** (optional): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_FROM_NUMBER`. Texts also require the recipient to have opted in on
   their account — the keys alone never cause a message to be sent.
9. **Support translation** (optional): `DEEPL_API_KEY`, or
   `GOOGLE_TRANSLATE_API_KEY` if you need languages DeepL does not cover.
   Whichever is set, a visitor writing in any language reaches the agent
   console in English, and the agent's English reply reaches them in their own
   language — with the original kept underneath in both directions. Agents keep
   writing English; a note above the composer tells them the reply is
   translated, so they avoid idioms that do not survive the trip. Without a key
   nothing is translated and both sides see exactly what they see today. No
   message is ever lost to a missing key or a provider outage.
10. **Wallet passes** (optional): Google needs a service account
   (`GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_CLASS_ID`,
   `GOOGLE_WALLET_SA_EMAIL`, `GOOGLE_WALLET_SA_KEY`). Apple needs a Pass Type
   ID certificate, which is a build artefact rather than an env var; until it
   exists the Apple button is not shown at all. `/pass/[id]` works offline
   either way, so nothing is lost by skipping this.
11. **Inbound support email** (optional) — lets customers reply to a support
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
12. **Staff push alerts** (optional): `npx web-push generate-vapid-keys`, then
   set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT`
   (a `mailto:` address). The button stays hidden until these exist.
13. **Support team**: invite agents from the admin console. They get an email
   with a single-use link, set their own password and sign in at
   `/team/login`. Give them the `support` scope unless they genuinely need the
   money pages.
14. Optional: Sentry DSN, commission overrides
    (`PARKGO_COMMISSION_PARKING_BPS` / `_TRANSFER_BPS`).

Then run the audits against the deployed URL —
`BASE=https://www.parkgo.ai npm run audit:seo` will tell you immediately if
step 3 was missed, because every canonical will still say `localhost`.

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
**Tailwind CSS** (brand system: orange `#F26A1B` + ink `#15171A`, with the
measured AA contrast rules documented in `tailwind.config.ts`) ·
**Supabase** (Postgres, Auth, Storage, RLS) · **Stripe Connect** ·
**Mapbox GL** · **Resend** (+ Svix-verified inbound) · **web-push** (VAPID) ·
**ExcelJS** (styled exports) · **Vitest** · **Playwright** (audits, dev-only) ·
**Sentry** · **lucide-react** · **qrcode** · **zod** · **Capacitor**.
