-- Second traveller round: cancellation protection, car care, gift cards,
-- loyalty, trip passes, flight tracking, condition photos, date waitlists,
-- group bookings, corporate accounts and photo-backed claims.
-- Run in the Supabase SQL editor (safe to re-run).

-- --------------------------------------------------------------- users ------
-- Loyalty is earned by completed trips, so it is derived rather than stored —
-- only the counter is cached here to keep the dashboard off a full scan.
alter table public.users add column if not exists completed_trips integer not null default 0;
-- Corporate: a traveller can belong to one organisation and either own it or
-- just book against it.
alter table public.users add column if not exists organisation_id uuid;
alter table public.users add column if not exists organisation_role text
  check (organisation_role in ('owner', 'member'));
-- Texts cost money and are unwelcome unasked, so they are opt-in per account.
alter table public.users add column if not exists sms_opt_in boolean not null default false;

-- -------------------------------------------------------------- spaces ------
-- Extras the host performs while the car is parked: wash, valet, tyre check.
-- Host-defined, so a list rather than fixed columns.
alter table public.spaces add column if not exists care_services jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------ bookings ------
-- Cancellation protection: a premium paid at checkout that waives the late
-- cancellation fee. Stored as a flag; the money is inside `price`.
alter table public.bookings add column if not exists protection boolean not null default false;
-- Care bought at checkout, copied off the space so a later price change on the
-- listing cannot alter what was agreed. CareService[].
alter table public.bookings add column if not exists care_services jsonb not null default '[]'::jsonb;
-- Flight link, so a delayed landing extends the stay instead of overrunning it.
alter table public.bookings add column if not exists flight_number text;
alter table public.bookings add column if not exists flight_status text
  check (flight_status in ('scheduled', 'delayed', 'landed', 'cancelled', 'unknown'));
alter table public.bookings add column if not exists flight_scheduled_at timestamptz;
alter table public.bookings add column if not exists flight_arrival_at timestamptz;
alter table public.bookings add column if not exists flight_checked_at timestamptz;
-- Set once when a delay pushed the end time out, so it can never double-extend.
alter table public.bookings add column if not exists flight_extended_at timestamptz;
-- Group booking: more than one car on a single reservation. VehicleProfile[].
alter table public.bookings add column if not exists vehicles jsonb not null default '[]'::jsonb;
-- Free text: step-free access, help with a pushchair, an extra-large boot.
alter table public.bookings add column if not exists assistance text;
-- "I'm N minutes away" — the host's cue to open the gate.
alter table public.bookings add column if not exists arriving_eta_min integer;
alter table public.bookings add column if not exists arriving_pinged_at timestamptz;
-- Billed to a company rather than the traveller's own card.
alter table public.bookings add column if not exists organisation_id uuid;
-- Paid up front with a gift card or a trip pass. Deliberately NOT part of
-- `price`: the booking is worth what it is worth, and the host is owed their
-- full share whether the traveller paid with a card or with a card we sold
-- them earlier. Only the amount charged today goes down.
alter table public.bookings add column if not exists prepaid_pence integer not null default 0;
alter table public.bookings add column if not exists prepaid_from jsonb;

create index if not exists bookings_flight_idx
  on public.bookings (flight_arrival_at)
  where flight_number is not null and flight_extended_at is null;
create index if not exists bookings_org_idx
  on public.bookings (organisation_id, start_at desc)
  where organisation_id is not null;

-- -------------------------------------------------------------- claims ------
-- Photographs are what settle a damage dispute, so a claim carries its own.
alter table public.claims add column if not exists photos jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------- organisations ------
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_number text,
  billing_email text not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  -- One invoice at month end instead of a card charge per trip.
  monthly_invoice boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists organisations_owner_idx on public.organisations (owner_id);
alter table public.organisations enable row level security;
drop policy if exists "read own organisation" on public.organisations;
create policy "read own organisation" on public.organisations
  for select using (
    owner_id = auth.uid()
    or id = (select organisation_id from public.users where id = auth.uid())
  );
drop policy if exists "owner writes organisation" on public.organisations;
create policy "owner writes organisation" on public.organisations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------- gift cards ------
-- The balance is the truth; `initial_pence` is kept only so a partly-spent
-- card can still show what it was worth.
create table if not exists public.gift_cards (
  code text primary key,
  initial_pence integer not null check (initial_pence > 0),
  balance_pence integer not null check (balance_pence >= 0),
  purchased_by uuid references public.users (id) on delete set null,
  recipient_email text,
  message text,
  -- The payment that bought it. Stripe can send a payer back to the success
  -- URL more than once, and this is what stops a refresh minting a second card.
  stripe_ref text,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);
create index if not exists gift_cards_buyer_idx on public.gift_cards (purchased_by, created_at desc);
create unique index if not exists gift_cards_stripe_ref_idx
  on public.gift_cards (stripe_ref)
  where stripe_ref is not null;
alter table public.gift_cards enable row level security;
-- Redemption goes through the service role: a card is bearer money, so nobody
-- gets to read the table by code from the browser.
drop policy if exists "read cards i bought" on public.gift_cards;
create policy "read cards i bought" on public.gift_cards
  for select using (purchased_by = auth.uid());

-- --------------------------------------------------------- trip passes ------
create table if not exists public.trip_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  days_total integer not null check (days_total > 0),
  days_used integer not null default 0 check (days_used >= 0),
  price_pence integer not null check (price_pence >= 0),
  -- What one day off the pass is worth when spent, fixed at purchase.
  day_value_pence integer not null check (day_value_pence > 0),
  expires_at timestamptz not null,
  -- See gift_cards.stripe_ref.
  stripe_ref text,
  created_at timestamptz not null default now(),
  constraint trip_passes_not_overspent check (days_used <= days_total)
);
create index if not exists trip_passes_user_idx on public.trip_passes (user_id, expires_at desc);
create unique index if not exists trip_passes_stripe_ref_idx
  on public.trip_passes (stripe_ref)
  where stripe_ref is not null;
alter table public.trip_passes enable row level security;
drop policy if exists "own passes" on public.trip_passes;
create policy "own passes" on public.trip_passes
  for select using (user_id = auth.uid());

-- ----------------------------------------------------- condition photos -----
-- Taken at drop-off and again at pick-up. The pair is the evidence; neither
-- side can delete one, which is the whole point.
create table if not exists public.condition_photos (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  phase text not null check (phase in ('dropoff', 'pickup')),
  url text not null,
  taken_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists condition_photos_booking_idx
  on public.condition_photos (booking_id, created_at);
alter table public.condition_photos enable row level security;
drop policy if exists "read photos on my booking" on public.condition_photos;
create policy "read photos on my booking" on public.condition_photos
  for select using (
    booking_id in (select id from public.bookings where traveller_id = auth.uid())
  );
drop policy if exists "add photos to my booking" on public.condition_photos;
create policy "add photos to my booking" on public.condition_photos
  for insert with check (
    booking_id in (select id from public.bookings where traveller_id = auth.uid())
  );

-- -------------------------------------------------------- date waitlist -----
-- Distinct from `space_alerts` in 0025: that watches a price, this watches a
-- sold-out date range and fires when anything at all opens up.
create table if not exists public.date_waitlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  airport_slug text not null,
  space_id uuid references public.spaces (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint date_waitlists_order check (end_at > start_at)
);
create index if not exists date_waitlists_open_idx
  on public.date_waitlists (airport_slug, start_at)
  where notified_at is null;
create index if not exists date_waitlists_user_idx on public.date_waitlists (user_id, created_at desc);
alter table public.date_waitlists enable row level security;
drop policy if exists "own waitlist" on public.date_waitlists;
create policy "own waitlist" on public.date_waitlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
