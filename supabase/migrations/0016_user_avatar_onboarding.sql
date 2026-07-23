-- 0016: profile photos + first-run onboarding flag.
-- avatar_url: public URL in the `avatars` storage bucket (created lazily).
-- onboarded: new sign-ups start false and are gated to /welcome until they
-- finish profile setup. Existing users see the welcome step once too.
alter table public.users
  add column if not exists avatar_url text,
  add column if not exists onboarded boolean not null default false;
