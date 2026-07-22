-- 0013: account suspension flag (admin user management).
-- Suspended accounts are bounced back to /login at the sign-in guard.
alter table public.users
  add column if not exists suspended boolean not null default false;
