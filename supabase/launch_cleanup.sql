-- =============================================================================
-- ParkGo — LAUNCH-DAY CLEANUP (run once, just before going live)
-- Removes the demo host + demo listings (and any test bookings made on them),
-- and sweeps abandoned unpaid checkouts. Real hosts/listings are untouched.
-- =============================================================================

-- Test bookings on demo listings (payments/reviews cascade with the booking)
delete from bookings where space_id in
  (select id from spaces where host_id = 'd0000000-0000-4000-8000-000000000002');

-- Demo listings, demo host, demo user
delete from spaces where host_id = 'd0000000-0000-4000-8000-000000000002';
delete from hosts  where id      = 'd0000000-0000-4000-8000-000000000002';
delete from users  where id      = 'd0000000-0000-4000-8000-000000000001';

-- Abandoned checkouts (never paid) older than a day
delete from bookings where status = 'requested' and created_at < now() - interval '1 day';
