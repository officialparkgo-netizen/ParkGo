-- Arabic in the live schema + guest ↔ host thread translation.
-- Run in the Supabase SQL editor (safe to re-run).

-- 1. The app now speaks Arabic; the enum and the tickets check must too —
--    without these, a signed-in user choosing العربية (or an Arabic support
--    chat) fails to save in live mode.
alter type locale add value if not exists 'ar';

alter table public.support_tickets
  drop constraint if exists support_tickets_locale_check;
alter table public.support_tickets
  add constraint support_tickets_locale_check
  check (locale in ('en', 'ur', 'hi', 'de', 'zh', 'ar'));

-- 2. Booking-thread messages carry a rendering in the reader's language,
--    stored beside the original at send time (never instead of it).
alter table public.booking_messages
  add column if not exists translated text;
alter table public.booking_messages
  add column if not exists source_locale text;
