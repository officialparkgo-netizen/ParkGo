-- Traveller ↔ driver chat, relayed through the transfer operator.
create table if not exists transfer_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  sender text not null check (sender in ('traveller', 'driver')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists transfer_messages_booking_idx
  on transfer_messages (booking_id, created_at);

-- Server-only access (service role); no anon/authenticated policies needed.
alter table transfer_messages enable row level security;
