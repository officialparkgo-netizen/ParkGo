-- 0008: covered/roofed listings ---------------------------------------------
-- Adds the "covered" flag hosts set on garages, carports and barns, used by
-- the new search filter. Run this in the Supabase SQL editor right after
-- deploying the covered-filter release (reads select this column).

alter table spaces
  add column if not exists covered boolean not null default false;
