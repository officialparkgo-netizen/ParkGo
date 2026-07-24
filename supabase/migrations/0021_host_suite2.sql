-- Host suite 2: custom date pricing, bays, request-to-book, auto-welcome,
-- guest blocklist, co-host accounts, listing view analytics.
-- Run in the Supabase SQL editor (safe to re-run — everything is IF NOT EXISTS).

-- 1. Listing extras: per-date prices, named bays, approval-first bookings.
alter table public.spaces add column if not exists custom_prices jsonb not null default '{}'::jsonb;
alter table public.spaces add column if not exists bay_names jsonb not null default '[]'::jsonb;
alter table public.spaces add column if not exists request_to_book boolean not null default false;

-- 2. Request-to-book state + bay assignment on bookings.
alter table public.bookings add column if not exists approval text
  check (approval in ('pending', 'approved', 'declined'));
alter table public.bookings add column if not exists approval_deadline timestamptz;
alter table public.bookings add column if not exists bay_index integer;

-- 3. Host extras: auto welcome message, blocked guests, co-host link.
alter table public.hosts add column if not exists auto_welcome text;
alter table public.hosts add column if not exists blocked_guests jsonb not null default '[]'::jsonb;
alter table public.hosts add column if not exists cohost_user_id uuid;
alter table public.hosts add column if not exists cohost_email text;

-- 4. Co-host accounts point back at the host they help.
alter table public.users add column if not exists cohost_host_id uuid;

-- 5. Listing page views (anonymous) for views → bookings conversion.
create table if not exists public.space_views (
  id bigint generated always as identity primary key,
  space_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists space_views_space_idx
  on public.space_views (space_id, created_at desc);
alter table public.space_views enable row level security;
