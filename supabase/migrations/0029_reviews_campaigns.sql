-- Round 8: photo reviews + scheduled email campaigns.
-- Run in the Supabase SQL editor (safe to re-run).

-- ------------------------------------------------------------- reviews ------
-- Traveller photos on a review (storage URLs, up to 3). Text reviews predate
-- this and simply have an empty list.
alter table public.reviews
  add column if not exists photos jsonb not null default '[]'::jsonb;

-- ----------------------------------------------------------- campaigns ------
-- Marketing emails written in /admin/broadcast: sent immediately, or
-- scheduled and delivered by the daily digest sweep.
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  message text not null,
  -- Which audience: hosts | travellers | waitlist | inactive | upcoming | blog
  segment text not null,
  send_at timestamptz,
  sent_at timestamptz,
  cancelled_at timestamptz,
  sent_count integer not null default 0,
  recipient_count integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists campaigns_due_idx
  on public.campaigns (send_at)
  where sent_at is null and cancelled_at is null;
alter table public.campaigns enable row level security;
-- Service-role only: recipients and copy are internal.

-- The platform VAT number (shown on VAT invoices) needs no DDL — it lives in
-- the platform_settings jsonb row, set from /admin/settings.
