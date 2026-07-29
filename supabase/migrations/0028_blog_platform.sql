-- Blog round two: scheduling, translations, stats, revisions, newsletter —
-- and the "content" staff scope for invited writers.
-- Run in the Supabase SQL editor (safe to re-run).

-- ---------------------------------------------------------- blog_posts ------
-- Publish later: stays a draft until the moment passes, then goes live on the
-- next sweep or read.
alter table public.blog_posts add column if not exists scheduled_at timestamptz;
-- Language of the article, and which article it is a translation of. The
-- original leaves translation_of null; its translations point at it.
alter table public.blog_posts add column if not exists lang text not null default 'en';
alter table public.blog_posts add column if not exists translation_of uuid
  references public.blog_posts (id) on delete set null;

create index if not exists blog_posts_scheduled_idx
  on public.blog_posts (scheduled_at)
  where status = 'draft' and scheduled_at is not null;
create index if not exists blog_posts_translation_idx
  on public.blog_posts (translation_of)
  where translation_of is not null;

-- ----------------------------------------------------------- blog_stats -----
-- Keyed by slug rather than post id so the built-in launch posts (which have
-- no row in blog_posts) get counted too.
create table if not exists public.blog_stats (
  slug text primary key,
  views integer not null default 0,
  helpful integer not null default 0
);
alter table public.blog_stats enable row level security;
drop policy if exists "stats are public" on public.blog_stats;
create policy "stats are public" on public.blog_stats for select using (true);

-- ------------------------------------------------------- blog_revisions -----
-- The previous version of a post, snapshotted on every save. Capped to the
-- last ten per post by the app — enough to undo a bad edit, not an archive.
create table if not exists public.blog_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists blog_revisions_post_idx
  on public.blog_revisions (post_id, created_at desc);
alter table public.blog_revisions enable row level security;
-- Service-role only: revisions may hold text the author decided not to publish.

-- ----------------------------------------------------- blog_subscribers -----
create table if not exists public.blog_subscribers (
  email text primary key,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table public.blog_subscribers enable row level security;
-- Service-role only: a subscriber list is personal data, never client-readable.
