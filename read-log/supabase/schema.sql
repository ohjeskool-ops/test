-- Zielschema für den Sync zwischen Geräten (Supabase/Postgres).
-- Entspricht lib/types.ts; wird angewendet, sobald die Supabase-Anbindung gebaut wird.
create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('article','pdf','youtube','podcast')),
  title text not null,
  source text not null,
  url text,
  normalized_url text,
  content_hash text not null,
  created_at timestamptz not null default now(),
  tags text[] not null default '{}',
  status text not null default 'unread' check (status in ('unread','read')),
  text_status text not null default 'ok' check (text_status in ('ok','missing','needs_ocr')),
  blocks jsonb not null default '[]',
  read_position real not null default 0,
  summary jsonb,
  fts tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(source,''))) stored
);
create unique index items_user_url on items (user_id, normalized_url) where normalized_url is not null;
create index items_user_hash on items (user_id, content_hash);
create index items_fts on items using gin (fts);
alter table items enable row level security;
create policy "own items" on items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
