-- 0009: host public bio -------------------------------------------------------
-- The "Your profile" introduction hosts write on their dashboard, shown to
-- travellers on the listing page. Run in the Supabase SQL editor; the save
-- button reports an error until this column exists.

alter table hosts
  add column if not exists bio text;
