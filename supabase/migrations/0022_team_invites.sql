-- Staff invites: a per-invite nonce that signs the "set your password" link.
-- Cleared once the password is set, which makes that link single-use; rotated
-- whenever an admin re-sends the invite, which kills the older link.
-- Run in the Supabase SQL editor (safe to re-run).

alter table public.users add column if not exists invite_nonce text;
