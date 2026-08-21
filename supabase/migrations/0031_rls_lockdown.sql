-- Supabase security advisor: "Table publicly accessible —
-- rls_disabled_in_public". The airports table (created in 0001) never had
-- Row-Level Security enabled, so the public anon key could read and write it.
-- The app reads locations from its own registry, not this table, and all
-- server-side access uses the service role (which bypasses RLS) — so locking
-- it down changes nothing for the app and closes the hole.
--
-- Run in the Supabase SQL editor. Safe to re-run: enabling RLS is idempotent.

alter table public.airports enable row level security;

-- Belt and braces: every application table, so a future restore or hand-made
-- change can never quietly drop the flag on one of them. Enabling RLS on a
-- table that already has it is a no-op.
alter table public.admin_actions enable row level security;
alter table public.audit_log enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.blog_stats enable row level security;
alter table public.blog_subscribers enable row level security;
alter table public.booking_messages enable row level security;
alter table public.bookings enable row level security;
alter table public.camera_streams enable row level security;
alter table public.campaigns enable row level security;
alter table public.claims enable row level security;
alter table public.condition_photos enable row level security;
alter table public.corporate_accounts enable row level security;
alter table public.date_waitlists enable row level security;
alter table public.drivers enable row level security;
alter table public.gift_cards enable row level security;
alter table public.hosts enable row level security;
alter table public.locations_live enable row level security;
alter table public.notifications enable row level security;
alter table public.organisations enable row level security;
alter table public.payments enable row level security;
alter table public.platform_settings enable row level security;
alter table public.promo_codes enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.referrals enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_spaces enable row level security;
alter table public.search_events enable row level security;
alter table public.space_alerts enable row level security;
alter table public.space_views enable row level security;
alter table public.spaces enable row level security;
alter table public.support_tickets enable row level security;
alter table public.transfer_messages enable row level security;
alter table public.transfer_providers enable row level security;
alter table public.transfers enable row level security;
alter table public.trip_passes enable row level security;
alter table public.trust_scores enable row level security;
alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.verifications enable row level security;
alter table public.waitlist enable row level security;
