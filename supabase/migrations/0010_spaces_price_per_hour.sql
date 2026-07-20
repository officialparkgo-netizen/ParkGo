-- Hourly bookings: optional per-hour rate on a space (pence).
-- Null means the space is daily-only; a value enables short (under-a-day) stays.
alter table spaces add column if not exists price_per_hour integer;
