-- Support desk round two: internal notes, tags, snooze, SLA escalation,
-- callback requests, visitor language, and agent duty status.
-- Run in the Supabase SQL editor (safe to re-run).

alter table public.support_tickets add column if not exists notes jsonb not null default '[]'::jsonb;
alter table public.support_tickets add column if not exists tags text[] not null default '{}';
alter table public.support_tickets add column if not exists snooze_until timestamptz;
alter table public.support_tickets add column if not exists escalated_at timestamptz;
alter table public.support_tickets add column if not exists phone text;
alter table public.support_tickets add column if not exists callback_at timestamptz;
alter table public.support_tickets add column if not exists locale text
  check (locale in ('en', 'ur', 'hi', 'de', 'zh'));

-- The rate limiter counts a sender's recent tickets on every new chat.
create index if not exists support_tickets_email_created_idx
  on public.support_tickets (lower(email), created_at desc);
-- Snoozed tickets are filtered out of the live queue until they come due.
create index if not exists support_tickets_snooze_idx
  on public.support_tickets (snooze_until)
  where snooze_until is not null;

-- Agents mark themselves on/off duty; auto-assign only picks those on duty.
alter table public.users add column if not exists support_available boolean;

-- Chat attachments move to a PRIVATE bucket: the app hands out short-lived
-- signed URLs instead, so a link that leaks stops working within the hour.
insert into storage.buckets (id, name, public)
values ('support-files', 'support-files', false)
on conflict (id) do update set public = false;

-- Web push for on-call staff. One row per browser/device; the endpoint is the
-- natural key because that is what the push service hands us back.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
-- Service role only: the app writes these, never the browser directly.
