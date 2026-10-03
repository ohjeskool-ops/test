-- read-log: Bibliothek mit Zeilen-Sicherheit pro Nutzer.
create extension if not exists pg_trgm with schema extensions;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
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
  -- Volltext für die Suche (Absätze mit Zeilenumbruch verbunden)
  body text not null default '',
  excerpt text generated always as (left(body, 220)) stored,
  read_position real not null default 0 check (read_position between 0 and 1),
  summary jsonb
);

create unique index items_user_url on public.items (user_id, normalized_url) where normalized_url is not null;
create index items_user_hash on public.items (user_id, content_hash);
create index items_user_created on public.items (user_id, created_at desc);
create index items_body_trgm on public.items using gin (body extensions.gin_trgm_ops);
create index items_title_trgm on public.items using gin (title extensions.gin_trgm_ops);

alter table public.items enable row level security;
create policy "eigene Inhalte lesen" on public.items for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigene Inhalte anlegen" on public.items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigene Inhalte ändern" on public.items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigene Inhalte löschen" on public.items for delete to authenticated using ((select auth.uid()) = user_id);
