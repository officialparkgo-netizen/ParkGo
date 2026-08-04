# ParkGo — Platform Documentation

Airport parking, licensed transfer, EV charging and live security — one booking.

www.parkgo.ai  ·  United Kingdom & Ireland  ·  6 languages

August 2026


## 1. What ParkGo is

ParkGo is a two-sided marketplace for airport access across the UK & Ireland. A traveller books, in one checkout and for one transparent price, a bundle that normally takes four separate purchases: a verified private parking space near the airport, a licensed terminal transfer, EV charging, and live security (in-app camera + CCTV). Hosts earn from their driveways and yards; licensed transfer partners carry the traveller; ParkGo takes a configurable commission on each booking.

- Live product : www.parkgo.ai, deployed automatically from the main development branch on Vercel. The /api/health endpoint reports the exact commit currently serving, the runtime mode, and whether translation is configured.
- Technology : Next.js 15 (App Router, React 19, TypeScript strict), Supabase (Postgres + Auth + Storage), Stripe payments, Resend email, Mapbox maps, Web Push. One codebase runs in two modes: a fully seeded demo mode for testing, and live mode against the production database.
- Languages : English, Urdu, Hindi, German, Chinese and Arabic — full right-to-left layout for Urdu and Arabic, and machine translation for every conversation on the platform.
- Money model : every amount is stored in pence; each payment is split into platform, host and driver shares with an enforced invariant that the three always sum to the total.

## 2. Languages & the translation system

The whole product ships in six languages from a single dictionary system (twelve translation areas, kept complete by an automated parity audit). The language switcher stores the choice both in the browser and on the account, and the layout flips to right-to-left automatically for Urdu and Arabic.


### Conversations translate themselves

- Where : support chat (visitor ↔ team) and the booking thread (guest ↔ host), in both directions. The reader always sees the message in their language with the sender's original kept underneath — a machine rendering is never trusted alone.
- How the language is decided : the text itself wins. Script detection tells Urdu from Arabic letters, recognises Hindi and Chinese, and spots German by vocabulary; the saved account language only breaks ties for Latin text; and Latin text that looks like no English at all (“hola”, “merci”) is probed through the provider's own detection. An account left on English never blocks a translation.
- The language follows the conversation : a chat opened in Arabic that carries on in Urdu re-aims the replies to Urdu automatically — in support tickets and booking threads alike.
- Provider : Google Translate first, DeepL as an alternative, switchable by environment key. Admin Settings includes a live “Run test” card that proves the key with real sample translations in all five target languages and confirms the booking-chat storage migration is in place.
- Self-healing history : messages written before the provider existed are repaired the moment someone looks — the support queue heals its visible tickets and the booking pages heal their threads, persisting the repair.

## 3. Traveller portal (/app)


### Search & booking

- Airport search with live suggestions, space pages with photos, EV and security details, host rating and reviews (with photos).
- One-price bundle checkout: parking + licensed transfer + EV + security, with Stripe payment, saved cards for returning travellers, and guest checkout that needs no account.
- Multi-vehicle garage, business profile for expensing (company details printed on receipts), corporate accounts for teams, promo codes, gift cards, account credit, loyalty and a multi-trip pass.

### Managing a trip

- Amend dates, extend an active stay mid-trip, rebook a past trip in two clicks, cancel under a clear policy — with optional cancellation protection and care add-ons.
- Date waitlist and price/availability alerts when a space or airport is full or too expensive.

### Travel day

- QR handover code that works offline, wallet passes, calendar (.ics) files, share-with-a-second-driver, and a shareable live journey page for family.
- Flight lookup with delay awareness, arriving-soon ping to the host, vehicle condition photos at drop-off and pick-up, assistance requests, and optional SMS updates.
- Transfer tracking page for the ride to the terminal.

### Communication & account

- Booking chat with the host — automatically translated both ways, with the original always shown.
- Support chat everywhere on the site, in any language (see section 6).
- Notifications page where every alert opens the thing it announces; dashboard stat blocks are links too.
- Account: vehicles, business details, two-factor login, referral code (both sides earn credit), and full GDPR self-service account deletion.

## 4. Host portal (/host)


### Dashboard

- Clickable stat cards — lifetime earnings, pending payouts, upcoming bookings, live listings, and a real trust score with the live review average; each card opens its section.
- Earnings chart (last six months), booking calendar where occupied days open a panel of that day's bookings, each row linking to the booking.
- Notifications list where a “New message” alert opens that booking's chat directly.

### Running the business

- Listings : create and edit spaces, photos, bays, EV details, weekend pricing; new listings pass admin review before going live.
- Today view : today's check-ins and check-outs at a glance.
- Bookings : guest details, repeat-guest history, request approval, bay assignment, incident reports, guest blocking, and the translated guest chat.
- Money : payouts with bank details, downloadable statements (CSV) and a yearly statement for tax time.
- Reviews : every guest review with a public reply box — replies appear under the review on the listing.
- Settings : co-host invite (limited check-in-only account), automatic welcome message (delivered in the guest's language), iCal calendar export, email preferences.
- Verification : identity and document upload, reviewed by the admin team; verification feeds the trust score.

## 5. Admin portal (/admin)


### Dashboard

- KPI cards — hosts to review, live listings, users, bookings, GMV, payouts due, average booking value, cancellation rate — every card clickable, with a 7/30/90-day range filter.
- Global search across bookings, listings, users and support tickets; monthly GMV chart; revenue by destination; clickable alerts.

### Sections

- Host verification : approval queue plus a Trust & quality list computed from real reviews, reliability, verification and tenure — the same numbers hosts see.
- Listings, Bookings, Users : moderation and live/pause control; user roles, suspension and restore, GDPR anonymisation, per-user detail pages.
- Payments : payouts due and mark-paid, refunds, and Stripe dispute triage with evidence deadlines.
- Reviews & Claims : hide abusive reviews; handle damage claims filed in-app.
- Broadcast : audience-segmented email campaigns — send now or schedule; scheduled sends are delivered by the daily digest sweep exactly once.
- Blog : a full multilingual CMS (all six languages per post) with SEO fields, publish/unpublish, and an invited writer role that can do nothing else.
- Settings : commission and fees, cancellation policy, VAT number for invoices, support-desk configuration (hours, SLA target, auto-assign, rate limit, canned replies), announcement banner, admin alert email, daily KPI digest (cron + send-now), and the translation health check.
- Audit : an append-only log of every admin action, who did it and to what.
- Operator : transfer-operator console (demo until a live operator integration lands — see section 12).

## 6. Support desk

A launcher on every page opens a chat that answers instantly from a knowledge base, recognises the visitor's language, and escalates to a human without losing anything.

- For the visitor : bot answers with helpful links; signed-in customers are never asked who they are; escalation returns a ticket reference; the thread stays live on the site with typing/seen indicators, attachments, a callback-request option, desk-hours notice when the team is offline, and a satisfaction rating with comment at the end.
- Resolution flow : resolving a ticket tells the visitor in their own language — banner plus a line in the transcript — with a one-click fresh-start button; if the visitor replies instead, the ticket reopens automatically and the team is alerted.
- For the team : a queue with search, filters (open/urgent/snoozed), priorities, snooze, SLA badges with automatic breach reporting, round-robin auto-assignment of on-duty agents, per-visitor history, booking context, canned replies, internal notes and tags.
- Language : every visitor message reaches the agent with an English rendering (any language, any account setting); replies go back in the visitor's current language; each ticket wears a language badge.
- Alerting : ops webhook, team inbox email, desktop/mobile push for urgent tickets and callbacks, and bell notifications that deep-link to the desk — from the notifications page and the dashboard alike.

## 7. Team roles & access control

- Full admin : everything in section 5.
- Support agent : invited by email with a set-password link; sees the ticket desk and nothing else — no exports, finance or settings.
- Content writer : invited the same way; sees the blog editor and nothing else.
- Removing a teammate disables their account immediately (they cannot sign in), and an admin can restore them later as a normal customer. Every such action lands in the audit log.

## 8. Trust, safety & the real trust score

Trust numbers are computed, never asserted. The score (0–100) blends four weighted components:

- Reviews — 35 points : the live average across the host's spaces; five stars earns full marks, one star earns none, and confidence grows with volume. A good review raises the score the day it lands; a bad one lowers it the same way.
- Verification — 35 points : approved identity earns full points, pending earns partial, unverified earns none.
- Reliability — 20 points : completed versus cancelled bookings.
- Tenure — 10 points : how long they have hosted.
The same computation feeds the host dashboard card and the admin trust list, and submitting a review refreshes the host's public rating so listings never show a stale number. Reviews are two-sided (hosts also rate travellers), support photos, and can be hidden by moderation.


## 9. Money

- Pricing : per-day space rates with weekend pricing and demand-aware suggestions; the checkout shows one bundled price with a full breakdown.
- Splits : every payment divides into platform / host / driver shares in pence, with the sum enforced to equal the total.
- Invoices : receipts double as VAT invoices — platform VAT number plus the traveller's company details when a business profile exists.
- Host payouts : scheduled with a hold window, bank details on file, statements and CSV export, yearly statement.
- Protection & extras : cancellation protection, care add-ons, gift cards, account credit, loyalty points, trip pass, promo codes, corporate billing.
- Disputes : Stripe chargebacks surface in admin Payments with status and evidence deadlines.

## 10. Notifications

- One system across the platform: booking, payout, verification, support and handover kinds — delivered to the in-app bell, the notifications page, web push (including urgent support alerts), and email where it matters.
- Everything is a door : a notification about booking PG-XXXXX opens that booking; a support alert opens the desk; a payout alert opens payouts — from the notifications page, the host dashboard and the admin dashboard equally.
- Digest : a daily KPI email to admins (Vercel cron), which also delivers scheduled campaigns and sweeps SLA breaches.

## 11. Public website & blog

- Homepage : live search into the app, a count-up stats band driven by real registry data, popular destinations with live space counts and lowest prices, feature tour, six-language trust chip, and structured data (Organization + WebSite with sitelinks search).
- About : refreshed to tell the live story honestly — a founder-led team section (no invented names), real registry numbers, and live calls to action.
- Marketing pages : travellers, hosts, pricing, how-it-works, FAQ, trust & safety, contact, terms, privacy — all in six languages.
- Airports : a page per covered location with local content and SEO.
- Blog : publicly readable in six languages with four launch articles; posts carry share images, structured data and language switchers.

## 12. What is still demo, and the plan for it

- Transfer operators & drivers : the biggest one. Driver names, live vehicle tracking and driver chat replies come from demo data until a licensed operator is connected. Two parallel paths are designed: onboarding local licensed operators directly (operator portal, driver logins with GPS from their phones, job dispatch, real ratings and payouts — no external API needed), and a provider abstraction ready for fleet APIs such as Karhoo, Autocab iGo or Mozio once a partner agreement exists.
- Flight status : the lookup is wired but answers with deterministic demo data until a flight-data API key is added.
- Live camera : the in-app “watch your car” visual is a placeholder until hosts provide real camera feeds.
- Airports registry : the twelve covered locations are real places, but the list lives in code; an admin-managed airports table (with host “request this location” flow) is designed and ready to build when expansion demands it.
Everything else — bookings, payments, payouts, statements, VAT, reviews, trust scores, support, translations, notifications, campaigns, blog, referrals, gift cards, disputes — runs on real data in live mode.


## 13. Quality, testing & operations

- Unit tests : 360 tests across pricing, splits, trust, translation gating, support queueing, healing and more.
- End-to-end battery : ~380 browser checks across ten suites — operations (24), navigation with a raw-key leak guard (18), RTL Arabic (9), blog (25 + 48), money round (24), search (25), guest suite (52), translation (36) — plus a whole-site audit that opens all 59 routes as the right role in English and Arabic (118 checks) and fails on any error page or untranslated key.
- Other audits : i18n parity across all six languages, SEO, colour-contrast accessibility, and reduced-motion safety.
- Operations : /api/health reports mode, serving commit and translation status; database changes ship as numbered SQL migrations (0001–0030) run in the Supabase SQL editor; every deploy is verified against the health endpoint.

### Key environment configuration

Key

Purpose

PARKGO_MODE

“live” for production data; anything else runs the seeded demo

NEXT_PUBLIC_SUPABASE_URL / ANON_KEY

Database & auth (public client)

SUPABASE_SERVICE_ROLE_KEY

Server-side data access

Stripe keys + webhook secret

Payments, saved cards, disputes

Resend key

All transactional email

GOOGLE_TRANSLATE_API_KEY / DEEPL_API_KEY

Conversation translation (Google first)

Mapbox token

Maps and geocoding

VAPID keys

Web push notifications

NEXT_PUBLIC_SITE_URL

Canonical URL for links, SEO and emails

Flight-data API key (future)

Real flight status & delay feed

This document reflects the platform as deployed in August 2026. The /api/health endpoint on the live site always names the exact build serving, so this document can be checked against reality at any time.
