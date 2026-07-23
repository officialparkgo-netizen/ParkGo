-- 0015: per-admin two-factor opt-in (Account settings toggle, default off).
alter table public.users
  add column if not exists twofa_enabled boolean not null default false;
