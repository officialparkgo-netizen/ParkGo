-- =============================================================================
-- ParkGo — demo data for testing (safe to remove later)
-- A demo host + 4 listings: 2 already live, 2 pending_review (approve them in
-- Admin). Idempotent. Run AFTER 0001_init.sql and 0003_seed_airports.sql.
-- The demo host is display-only (no login).
-- =============================================================================

insert into users (id, role, name, email) values
  ('d0000000-0000-4000-8000-000000000001', 'host', 'Demo Host', 'demo.host@parkgo.ai')
on conflict (id) do nothing;

insert into hosts (id, user_id, display_name, verification_status, rating) values
  ('d0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Demo Host', 'approved', 4.8)
on conflict (id) do nothing;

insert into spaces
  (id, host_id, title, airport_slug, approx_area, exact_address, lat, lng,
   distance_miles, drive_minutes, dimensions, max_vehicle_size, ev_charger,
   cctv, live_camera, access_rules, photos, price_per_day, rating, review_count, status)
values
  ('d0000000-0000-4000-8000-00000000000a', 'd0000000-0000-4000-8000-000000000002',
   'Secure driveway near Heathrow T5', 'heathrow', 'Longford, near T5', '12 Bath Rd, Longford UB7',
   51.49, -0.47, 1.8, 7, '{"lengthM":5.5,"widthM":2.6}', 'large',
   '{"connector":"Type 2","kw":7,"pricePerKwh":38}', true, true,
   'Park on the driveway; key-safe code sent on arrival.', ARRAY['drive-1'], 1200, 4.9, 24, 'live'),

  ('d0000000-0000-4000-8000-00000000000b', 'd0000000-0000-4000-8000-000000000002',
   'Gated parking 5 min from Gatwick', 'gatwick', 'Horley, South Terminal', '4 Victoria Rd, Horley RH6',
   51.17, -0.18, 2.2, 9, '{"lengthM":5.0,"widthM":2.4}', 'medium', null, true, false,
   'Gated forecourt, CCTV monitored.', ARRAY['drive-1'], 1000, 4.7, 11, 'live'),

  ('d0000000-0000-4000-8000-00000000000c', 'd0000000-0000-4000-8000-000000000002',
   'Covered space near Manchester', 'manchester', 'Wythenshawe', '9 Ringway Rd, Manchester M22',
   53.37, -2.28, 2.5, 9, '{"lengthM":5.5,"widthM":2.6}', 'large', null, false, false,
   'Covered carport, quiet residential street.', ARRAY['drive-1'], 900, 0, 0, 'pending_review'),

  ('d0000000-0000-4000-8000-00000000000d', 'd0000000-0000-4000-8000-000000000002',
   'Driveway 8 min from Stansted', 'stansted', 'Bishop''s Stortford', '22 Dunmow Rd, CM23',
   51.88, 0.16, 3.1, 11, '{"lengthM":5.0,"widthM":2.4}', 'medium', null, true, false,
   'Private driveway, sensor light, CCTV.', ARRAY['drive-1'], 850, 0, 0, 'pending_review')
on conflict (id) do nothing;
