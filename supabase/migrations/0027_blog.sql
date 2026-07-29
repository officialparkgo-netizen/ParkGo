-- Blog platform: articles written in the admin console, alongside the
-- built-in launch posts that ship as code.
-- Run in the Supabase SQL editor (safe to re-run).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  -- Markdown. Rendered server-side by an escape-first renderer, so what is
  -- stored is what the author typed, never pre-rendered HTML.
  body text not null default '',
  cover_url text,
  author text not null default 'The ParkGo Team',
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

alter table public.blog_posts enable row level security;

-- Published posts are public by definition; drafts exist only for the team.
-- Writes go through the service role (admin console) — no client write policy.
drop policy if exists "published posts are public" on public.blog_posts;
create policy "published posts are public" on public.blog_posts
  for select using (status = 'published');
