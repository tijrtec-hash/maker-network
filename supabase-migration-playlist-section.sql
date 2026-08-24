-- =============================================
-- IA MAKER NETWORK — Migração: Seção da Playlist
-- Execute no Supabase SQL Editor após as migrações anteriores
-- =============================================

alter table public.playlists add column if not exists section text;
create index if not exists playlists_section_idx on public.playlists (section);
