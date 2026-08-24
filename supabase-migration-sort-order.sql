-- =============================================
-- IA MAKER NETWORK — Migração: Ordem manual (drag/reorder)
-- Execute no Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → cole e Execute
-- =============================================

alter table public.videos  add column if not exists sort_order integer not null default 0;
alter table public.docs    add column if not exists sort_order integer not null default 0;
alter table public.prompts add column if not exists sort_order integer not null default 0;

create index if not exists videos_sort_order_idx  on public.videos  (sort_order);
create index if not exists docs_sort_order_idx    on public.docs    (sort_order);
create index if not exists prompts_sort_order_idx on public.prompts (sort_order);
