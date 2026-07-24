-- Admin suite 3: waitlist invites + demand analytics.
-- Run in the Supabase SQL editor (safe to re-run — everything is IF NOT EXISTS).

-- 1. Waitlist invite tracking.
alter table public.waitlist add column if not exists invited_at timestamptz;

-- 2. Search demand events (no user identifiers by design — supply planning only).
create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  airport_slug text not null,
  dest_name text,
  results integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists search_events_created_idx on public.search_events (created_at desc);
create index if not exists search_events_airport_idx on public.search_events (airport_slug);
alter table public.search_events enable row level security;
