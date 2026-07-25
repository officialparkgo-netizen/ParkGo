-- Traveller-side upgrade: saved spaces, several vehicles per account,
-- business/VAT details, referral credit, price & availability alerts, and a
-- step-free accessibility flag on listings.
-- Run in the Supabase SQL editor (safe to re-run).

-- ---------------------------------------------------------------- users -----
-- `vehicle` (single) stays for existing rows; `vehicles` is the new list and
-- the app treats the old column as the first entry until it is migrated.
alter table public.users add column if not exists vehicles jsonb not null default '[]'::jsonb;
-- Company details for anyone expensing a trip; printed on the VAT receipt.
alter table public.users add column if not exists business jsonb;
-- Stripe customer, so a returning traveller's card is offered back to them.
alter table public.users add column if not exists stripe_customer_id text;
-- Referrals: everyone gets a code, credit is held in pence.
alter table public.users add column if not exists referral_code text;
alter table public.users add column if not exists referred_by uuid;
alter table public.users add column if not exists credit_pence integer not null default 0;
-- Set when the account was created for someone mid-checkout rather than by
-- them signing up — they still need to claim it with the emailed link.
alter table public.users add column if not exists guest_created boolean;

create unique index if not exists users_referral_code_idx
  on public.users (referral_code)
  where referral_code is not null;

-- Backfill the existing single vehicle into the list, once.
update public.users
   set vehicles = jsonb_build_array(vehicle)
 where vehicle is not null
   and vehicles = '[]'::jsonb;

-- --------------------------------------------------------------- spaces -----
-- Step-free approach, wide bay, no kerb to mount — the things that decide
-- whether a space is usable at all for some travellers.
alter table public.spaces add column if not exists accessible boolean;

-- -------------------------------------------------------- saved spaces ------
create table if not exists public.saved_spaces (
  user_id uuid not null references public.users (id) on delete cascade,
  space_id uuid not null references public.spaces (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, space_id)
);
create index if not exists saved_spaces_user_idx on public.saved_spaces (user_id, created_at desc);
alter table public.saved_spaces enable row level security;
drop policy if exists "own saved spaces" on public.saved_spaces;
create policy "own saved spaces" on public.saved_spaces
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -------------------------------------------------------------- alerts ------
-- "Tell me when this space frees up on my dates" / "…when anything near LHR
-- drops below £X". One row per watch; cleared once it fires.
create table if not exists public.space_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  space_id uuid references public.spaces (id) on delete cascade,
  airport_slug text,
  start_at timestamptz,
  end_at timestamptz,
  max_price_pence integer,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  -- A watch has to be about something: a specific space or an airport.
  constraint space_alerts_target check (space_id is not null or airport_slug is not null)
);
create index if not exists space_alerts_open_idx
  on public.space_alerts (created_at desc)
  where notified_at is null;
create index if not exists space_alerts_user_idx on public.space_alerts (user_id);
alter table public.space_alerts enable row level security;
drop policy if exists "own alerts" on public.space_alerts;
create policy "own alerts" on public.space_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
