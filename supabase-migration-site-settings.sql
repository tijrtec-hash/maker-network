-- =============================================
-- IA MAKER NETWORK — Migração: Configurações do site
-- Execute no Supabase SQL Editor
-- =============================================

create table if not exists public.site_settings (
  id text primary key default 'main',
  instagram_handle text,
  instagram_url text,
  icon_url text,
  storage_path text,
  updated_at timestamptz not null default now()
);

-- Insert a default row so there is always one
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

-- RLS
alter table public.site_settings enable row level security;

-- Public can read (needed for the footer)
create policy "public_read_site_settings" on public.site_settings for select using (true);

-- Only authenticated admin can update
create policy "admin_update_site_settings" on public.site_settings for update using (auth.role() = 'authenticated');

-- Storage bucket for site icons
insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict (id) do nothing;

create policy "public_read_site_storage" on storage.objects for select using (bucket_id = 'site');
create policy "admin_upload_site_storage" on storage.objects for insert with check (bucket_id = 'site' and auth.role() = 'authenticated');
create policy "admin_delete_site_storage" on storage.objects for delete using (bucket_id = 'site' and auth.role() = 'authenticated');
