-- Admin suite: action log, promo codes, damage claims, review moderation.
-- Run in the Supabase SQL editor (safe to re-run — everything is IF NOT EXISTS).

-- 1. Who did what — real admin audit trail.
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  admin_name text,
  action text not null,
  target_type text,
  target_id text,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);
create index if not exists admin_actions_target_idx on public.admin_actions (target_id);
alter table public.admin_actions enable row level security;

-- 2. Promo codes (applied at checkout; discount absorbed by the platform).
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null default 'percent' check (kind in ('percent', 'fixed')),
  value integer not null check (value > 0),
  active boolean not null default true,
  uses integer not null default 0,
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.promo_codes enable row level security;

-- 3. Damage / incident claims raised against bookings.
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  booking_ref text,
  opened_by uuid,
  role text,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'rejected')),
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists claims_created_idx on public.claims (created_at desc);
alter table public.claims enable row level security;

-- 4. Review moderation flag (hidden reviews stay stored, disappear publicly).
alter table public.reviews add column if not exists hidden boolean not null default false;

-- All three new tables are written via the service-role key only (no client
-- policies on purpose) — same pattern as the other back-office tables.
