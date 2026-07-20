-- Instant-support chat: escalated conversations forwarded to a human agent.
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null,
  topic text not null default 'other',
  transcript jsonb not null default '[]',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

-- Server-only access (service role); no anon/authenticated policies needed.
alter table support_tickets enable row level security;
