-- Support desk upgrade: who the chat belongs to, priority, presence,
-- read receipts, first-response timing and the post-chat rating.
-- Run in the Supabase SQL editor (safe to re-run).

alter table public.support_tickets add column if not exists user_id uuid;
alter table public.support_tickets add column if not exists priority text
  check (priority in ('normal', 'urgent'));
alter table public.support_tickets add column if not exists first_response_at timestamptz;
alter table public.support_tickets add column if not exists typing_by text
  check (typing_by in ('user', 'agent'));
alter table public.support_tickets add column if not exists typing_at timestamptz;
alter table public.support_tickets add column if not exists user_read_at timestamptz;
alter table public.support_tickets add column if not exists agent_read_at timestamptz;
-- 1 = happy, -1 = unhappy; null = not rated.
alter table public.support_tickets add column if not exists csat smallint
  check (csat in (1, -1));
alter table public.support_tickets add column if not exists csat_comment text;

-- Deliberately not a foreign key: anonymising a user must not delete the
-- support history the team may still need for a dispute.
create index if not exists support_tickets_user_idx
  on public.support_tickets (user_id);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);

-- Chat attachments live in their own public bucket (images shared in chat).
insert into storage.buckets (id, name, public)
values ('support-files', 'support-files', true)
on conflict (id) do nothing;
