-- Admin suite 2: platform settings, admin scopes, support assignment.
-- Run in the Supabase SQL editor (safe to re-run — everything is IF NOT EXISTS).

-- 1. DB-backed platform configuration (fees, cancel policy, alerts, banner).
--    One jsonb row keyed 'main'; written via the service-role key only.
create table if not exists public.platform_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;

-- 2. Admin scopes: 'support' admins are locked out of the money pages.
alter table public.users add column if not exists admin_scope text;

-- 3. Support ticket assignment (which admin picked it up).
alter table public.support_tickets add column if not exists assigned_to text;
