-- =============================================================================
-- ParkGo — auth profile bootstrap
-- When a Supabase Auth user is created, create the matching public.users profile
-- row from the sign-up metadata (name, role). Idempotent.
-- Apply after 0001_init.sql.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::role, 'traveller')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow a signed-in user to insert their own profile row as a fallback
-- (e.g. if the trigger is ever disabled). Complements users_self_read/update.
drop policy if exists users_self_insert on users;
create policy users_self_insert on users for insert with check (id = auth.uid());
