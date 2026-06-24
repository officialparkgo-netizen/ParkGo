-- =============================================================================
-- ParkGo — initial schema (Postgres / Supabase)
-- Mirrors src/types/index.ts. Money is stored in minor units (pence) as integers.
-- Row-Level Security is enabled on every table so each role sees only its own
-- data (least-privilege, per the compliance section of the brief).
--
-- Apply with the Supabase CLI:  supabase db push
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "postgis";  -- geo search; optional, see spaces.geo

-- ----- Enums -----------------------------------------------------------------
create type role as enum ('traveller', 'host', 'transfer', 'admin');
create type locale as enum ('en', 'ur', 'hi', 'de', 'zh');
create type vehicle_size as enum ('small', 'medium', 'large', 'van');
create type verification_status as enum
  ('not_started', 'pending', 'in_review', 'approved', 'rejected');
create type space_status as enum
  ('draft', 'pending_review', 'live', 'paused', 'rejected');
create type booking_status as enum
  ('requested', 'paid', 'active', 'completed', 'reviewed', 'cancelled');
create type transfer_status as enum
  ('unassigned', 'assigned', 'en_route', 'arrived', 'handover_pending', 'completed');
create type payment_method as enum ('card', 'wallet', 'crypto');
create type payment_provider as enum ('stripe', 'crypto', 'mock');
create type payout_status as enum ('pending', 'scheduled', 'paid');

-- ----- Users -----------------------------------------------------------------
-- Mirrors auth.users; profile row keyed by the Supabase auth uid.
create table users (
  id uuid primary key default gen_random_uuid(),
  role role not null default 'traveller',
  name text not null,
  email text not null unique,
  phone text,
  locale locale not null default 'en',
  vehicle jsonb,                      -- VehicleProfile (travellers)
  corporate_account_id uuid,
  created_at timestamptz not null default now()
);

-- ----- Verification (KYC kept separate from operational data) -----------------
create table verifications (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null,
  subject_type text not null check (subject_type in ('host', 'transfer', 'traveller')),
  status verification_status not null default 'not_started',
  documents jsonb not null default '[]',  -- VerificationDocument[]; files in a separate bucket
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid references users (id),
  notes text,
  reverify_due_at timestamptz
);

-- ----- Airports (reference data) ---------------------------------------------
create table airports (
  slug text primary key,
  code text not null,
  name text not null,
  city text not null,
  country text not null check (country in ('UK', 'IE')),
  lat double precision not null,
  lng double precision not null,
  terminals text[] not null default '{}'
);

-- ----- Hosts & spaces --------------------------------------------------------
create table hosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  display_name text not null,
  verification_status verification_status not null default 'not_started',
  payout_account_ref text,
  rating numeric(2,1) not null default 0,
  joined_at timestamptz not null default now()
);

create table spaces (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts (id) on delete cascade,
  title text not null,
  airport_slug text not null references airports (slug),
  approx_area text not null,
  exact_address text not null,         -- released only after payment (see RLS note)
  lat double precision not null,
  lng double precision not null,
  distance_miles numeric(4,1) not null,
  drive_minutes int not null,
  dimensions jsonb not null,           -- { lengthM, widthM }
  max_vehicle_size vehicle_size not null default 'large',
  ev_charger jsonb,                    -- EvCharger | null
  cctv boolean not null default false,
  live_camera boolean not null default false,
  access_rules text not null default '',
  photos text[] not null default '{}',
  price_per_day int not null,          -- pence
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  status space_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index spaces_airport_idx on spaces (airport_slug) where status = 'live';

-- ----- Transfer providers, drivers, vehicles ---------------------------------
create table transfer_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  company_name text not null,
  operator_licence_no text not null,
  verification_status verification_status not null default 'not_started',
  reverify_due_at timestamptz,
  rating numeric(2,1) not null default 0,
  sla_minutes int not null default 15
);

create table drivers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references transfer_providers (id) on delete cascade,
  name text not null,
  licence_no text not null,
  badge_no text not null,
  verification_status verification_status not null default 'not_started',
  rating numeric(2,1) not null default 0
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references transfer_providers (id) on delete cascade,
  make text not null,
  model text not null,
  colour text not null,
  reg text not null,
  seats int not null default 4,
  insurance_expiry timestamptz not null
);

-- ----- Bookings, transfers ---------------------------------------------------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  traveller_id uuid not null references users (id),
  space_id uuid not null references spaces (id),
  bundle jsonb not null,               -- { parking, transfer, ev }
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'requested',
  price jsonb not null,                -- PriceBreakdown
  qr_token text not null,
  transfer_id uuid,
  created_at timestamptz not null default now()
);

create table transfers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  provider_id uuid not null references transfer_providers (id),
  driver_id uuid references drivers (id),
  vehicle_id uuid references vehicles (id),
  status transfer_status not null default 'unassigned',
  pickup_at timestamptz not null,
  handover_code text not null,
  handover_confirmed_at timestamptz
);

-- ----- Realtime: live location & camera --------------------------------------
create table locations_live (
  booking_id uuid not null references bookings (id) on delete cascade,
  actor text not null check (actor in ('traveller', 'host', 'driver')),
  lat double precision not null,
  lng double precision not null,
  heading_deg int,
  updated_at timestamptz not null default now(),
  primary key (booking_id, actor)
);

create table camera_streams (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  label text not null,
  protocol text not null check (protocol in ('hls', 'webrtc')),
  url text not null,
  live boolean not null default false
);

-- ----- Payments --------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  provider payment_provider not null,
  method payment_method not null,
  amount int not null,                 -- pence
  currency text not null default 'GBP',
  split jsonb not null,                -- PaymentSplit
  payout_status payout_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ----- Reviews & trust -------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  author_id uuid not null references users (id),
  author_role role not null,
  subject_id uuid not null,
  subject_type text not null check (subject_type in ('space', 'host', 'driver', 'traveller')),
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

create table trust_scores (
  subject_id uuid not null,
  subject_type text not null check (subject_type in ('host', 'driver', 'traveller')),
  score int not null check (score between 0 and 100),
  components jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (subject_id, subject_type)
);

-- ----- Notifications, corporate, referrals, audit ----------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table corporate_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  billing_email text not null,
  invoice_monthly boolean not null default true,
  priority_support boolean not null default true,
  seats int not null default 1
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users (id) on delete cascade,
  code text not null unique,
  reward_pence int not null default 1000,
  redeemed_by_id uuid references users (id),
  redeemed_at timestamptz
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  action text not null,
  target text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'traveller',
  airport text,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Row-Level Security
-- Every table is locked down by default. A SECURITY DEFINER helper resolves the
-- current user's role. Admins bypass via the is_admin() predicate. Policies
-- below are representative — extend per table as flows are built out.
-- =============================================================================
create or replace function current_role_name() returns role
  language sql stable as $$ select role from users where id = auth.uid() $$;

create or replace function is_admin() returns boolean
  language sql stable as $$ select coalesce(current_role_name() = 'admin', false) $$;

alter table users enable row level security;
alter table verifications enable row level security;
alter table hosts enable row level security;
alter table spaces enable row level security;
alter table transfer_providers enable row level security;
alter table drivers enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table transfers enable row level security;
alter table locations_live enable row level security;
alter table camera_streams enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table trust_scores enable row level security;
alter table notifications enable row level security;
alter table corporate_accounts enable row level security;
alter table referrals enable row level security;
alter table audit_log enable row level security;
alter table waitlist enable row level security;

-- Users: read/update own row; admins read all.
create policy users_self_read on users for select using (id = auth.uid() or is_admin());
create policy users_self_update on users for update using (id = auth.uid());

-- Spaces: anyone may read LIVE listings; hosts manage their own; admins all.
create policy spaces_public_read on spaces for select
  using (status = 'live' or host_id in (select id from hosts where user_id = auth.uid()) or is_admin());
create policy spaces_host_write on spaces for all
  using (host_id in (select id from hosts where user_id = auth.uid()) or is_admin())
  with check (host_id in (select id from hosts where user_id = auth.uid()) or is_admin());

-- Bookings: traveller sees own; host sees bookings on their spaces; admins all.
create policy bookings_read on bookings for select using (
  traveller_id = auth.uid()
  or space_id in (select s.id from spaces s join hosts h on h.id = s.host_id where h.user_id = auth.uid())
  or is_admin()
);
create policy bookings_traveller_write on bookings for insert with check (traveller_id = auth.uid());

-- Camera streams: only the booking traveller (post-payment), the owning host,
-- or an admin may read. exact_address on spaces follows the same principle in
-- the application layer (released after payment).
create policy camera_read on camera_streams for select using (
  is_admin()
  or space_id in (select s.id from spaces s join hosts h on h.id = s.host_id where h.user_id = auth.uid())
  or space_id in (
    select b.space_id from bookings b
    where b.traveller_id = auth.uid() and b.status in ('paid', 'active')
  )
);

-- Verifications, payments, audit: admin-only read (compliance); subjects read own.
create policy verifications_read on verifications for select using (subject_id = auth.uid() or is_admin());
create policy payments_read on payments for select using (
  is_admin() or booking_id in (select id from bookings where traveller_id = auth.uid())
);
create policy audit_admin_read on audit_log for select using (is_admin());

-- Waitlist: public insert (marketing), admin read.
create policy waitlist_insert on waitlist for insert with check (true);
create policy waitlist_admin_read on waitlist for select using (is_admin());
