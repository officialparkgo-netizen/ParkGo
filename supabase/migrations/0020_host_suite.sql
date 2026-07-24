-- Host suite: booking messages, bank details, review replies, weekend pricing,
-- email preferences, referral attribution.
-- Run in the Supabase SQL editor (safe to re-run — everything is IF NOT EXISTS).

-- 1. Traveller ↔ host thread on a booking.
create table if not exists public.booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  sender text not null check (sender in ('host', 'traveller')),
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists booking_messages_booking_idx
  on public.booking_messages (booking_id, created_at);
alter table public.booking_messages enable row level security;

-- 2. Manual payout bank details (service-role access only).
alter table public.hosts add column if not exists bank_sort text;
alter table public.hosts add column if not exists bank_account text;

-- 3. Host public replies on reviews.
alter table public.reviews add column if not exists reply text;
alter table public.reviews add column if not exists replied_at timestamptz;

-- 4. Weekend price uplift per listing (percent).
alter table public.spaces add column if not exists weekend_uplift_pct integer;

-- 5. Host preference: booking alert emails (default on).
alter table public.users add column if not exists email_booking_alerts boolean;

-- 6. Referral attribution on waitlist signups.
alter table public.waitlist add column if not exists referred_by text;
