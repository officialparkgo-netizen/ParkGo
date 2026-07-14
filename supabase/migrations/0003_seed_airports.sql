-- =============================================================================
-- ParkGo — seed reference airports
-- Required: spaces.airport_slug has a foreign key to airports.slug, so at least
-- these rows must exist before hosts can create listings. Idempotent.
-- Apply after 0001_init.sql.
-- =============================================================================

insert into airports (slug, code, name, city, country, lat, lng, terminals) values
  ('heathrow',   'LHR', 'London Heathrow', 'London',     'UK', 51.47,   -0.4543, ARRAY['T2','T3','T4','T5']),
  ('gatwick',    'LGW', 'London Gatwick',  'London',     'UK', 51.1537, -0.1821, ARRAY['North','South']),
  ('stansted',   'STN', 'London Stansted', 'London',     'UK', 51.885,   0.235,  ARRAY['Main']),
  ('luton',      'LTN', 'London Luton',    'Luton',      'UK', 51.8747, -0.3683, ARRAY['Main']),
  ('manchester', 'MAN', 'Manchester',      'Manchester', 'UK', 53.365,  -2.2727, ARRAY['T1','T2','T3']),
  ('birmingham', 'BHX', 'Birmingham',      'Birmingham', 'UK', 52.4539, -1.748,  ARRAY['Main']),
  ('edinburgh',  'EDI', 'Edinburgh',       'Edinburgh',  'UK', 55.95,   -3.3725, ARRAY['Main']),
  ('dublin',     'DUB', 'Dublin',          'Dublin',     'IE', 53.4264, -6.2499, ARRAY['T1','T2'])
on conflict (slug) do nothing;
