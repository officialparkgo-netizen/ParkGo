-- 0014: host-blocked days per listing (holiday / own use).
-- Array of "YYYY-MM-DD" strings; availability checks refuse overlapping bookings.
alter table public.spaces
  add column if not exists blocked_dates jsonb not null default '[]'::jsonb;
