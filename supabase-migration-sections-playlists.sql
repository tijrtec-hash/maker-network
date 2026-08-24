-- =============================================
-- IA MAKER NETWORK — Migração: Seções + Playlists
-- Execute no Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → cole e Execute
-- (Pode rodar junto ou depois da migração de sort_order)
-- =============================================

-- 1. Coluna de seção em cada tabela de conteúdo
--    Usada para organizar Vídeos / Docs / Prompts em categorias fixas
alter table public.videos  add column if not exists section text;
alter table public.docs    add column if not exists section text;
alter table public.prompts add column if not exists section text;

create index if not exists videos_section_idx  on public.videos  (section);
create index if not exists docs_section_idx    on public.docs    (section);
create index if not exists prompts_section_idx on public.prompts (section);

-- =============================================
-- 2. Playlists de vídeos
-- =============================================

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Tabela de junção: quais vídeos pertencem a quais playlists, e em que ordem
create table if not exists public.playlist_videos (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (playlist_id, video_id)
);

create index if not exists playlist_videos_playlist_idx on public.playlist_videos (playlist_id);
create index if not exists playlist_videos_video_idx    on public.playlist_videos (video_id);

-- =============================================
-- RLS — Playlists
-- =============================================

alter table public.playlists       enable row level security;
alter table public.playlist_videos enable row level security;

-- Leitura pública de playlists (qualquer visitante pode ver)
create policy "public_read_playlists" on public.playlists for select using (true);
create policy "public_read_playlist_videos" on public.playlist_videos for select using (true);

-- Somente admin autenticado pode criar/editar/excluir playlists
create policy "admin_insert_playlists" on public.playlists for insert with check (auth.role() = 'authenticated');
create policy "admin_update_playlists" on public.playlists for update using (auth.role() = 'authenticated');
create policy "admin_delete_playlists" on public.playlists for delete using (auth.role() = 'authenticated');

create policy "admin_insert_playlist_videos" on public.playlist_videos for insert with check (auth.role() = 'authenticated');
create policy "admin_update_playlist_videos" on public.playlist_videos for update using (auth.role() = 'authenticated');
create policy "admin_delete_playlist_videos" on public.playlist_videos for delete using (auth.role() = 'authenticated');
