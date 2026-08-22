-- =============================================
-- IA MAKER NETWORK — Schema Fase 2
-- Execute no Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → cole e Execute
-- =============================================

-- 1. Tabela de vídeos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  embed_url text not null,
  thumbnail_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by text,
  created_at timestamptz not null default now()
);

-- 2. Tabela de documentos
create table if not exists public.docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  file_url text,
  storage_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by text,
  created_at timestamptz not null default now()
);

-- 3. Tabela de prompts
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  content text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by text,
  created_at timestamptz not null default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.videos  enable row level security;
alter table public.docs    enable row level security;
alter table public.prompts enable row level security;

-- Leitura pública: somente aprovados
create policy "public_read_approved_videos"  on public.videos  for select using (status = 'approved');
create policy "public_read_approved_docs"    on public.docs    for select using (status = 'approved');
create policy "public_read_approved_prompts" on public.prompts for select using (status = 'approved');

-- Inserção pública: qualquer um pode enviar (status inicia como 'pending')
create policy "public_insert_videos"  on public.videos  for insert with check (status = 'pending');
create policy "public_insert_docs"    on public.docs    for insert with check (status = 'pending');
create policy "public_insert_prompts" on public.prompts for insert with check (status = 'pending');

-- Admin lê tudo (autenticado)
create policy "admin_read_all_videos"  on public.videos  for select using (auth.role() = 'authenticated');
create policy "admin_read_all_docs"    on public.docs    for select using (auth.role() = 'authenticated');
create policy "admin_read_all_prompts" on public.prompts for select using (auth.role() = 'authenticated');

-- Admin pode atualizar status
create policy "admin_update_videos"  on public.videos  for update using (auth.role() = 'authenticated');
create policy "admin_update_docs"    on public.docs    for update using (auth.role() = 'authenticated');
create policy "admin_update_prompts" on public.prompts for update using (auth.role() = 'authenticated');

-- Admin pode deletar
create policy "admin_delete_videos"  on public.videos  for delete using (auth.role() = 'authenticated');
create policy "admin_delete_docs"    on public.docs    for delete using (auth.role() = 'authenticated');
create policy "admin_delete_prompts" on public.prompts for delete using (auth.role() = 'authenticated');

-- =============================================
-- Storage bucket para documentos
-- =============================================

insert into storage.buckets (id, name, public)
values ('docs', 'docs', true)
on conflict (id) do nothing;

-- Leitura pública do bucket
create policy "public_read_docs_storage"
  on storage.objects for select
  using (bucket_id = 'docs');

-- Upload público (qualquer um pode enviar)
create policy "public_upload_docs_storage"
  on storage.objects for insert
  with check (bucket_id = 'docs');

-- =============================================
-- Dados de exemplo (aprovados) — opcional
-- =============================================

insert into public.videos (title, embed_url, status, submitted_by) values
  ('Como a IA está transformando o futuro do trabalho', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'approved', 'João Silva'),
  ('Introdução ao Prompt Engineering', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'approved', 'Maria Oliveira'),
  ('IA generativa: tendências para 2025', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'approved', 'Pedro Santos');

insert into public.docs (title, file_url, status, submitted_by) values
  ('Guia completo de criação de prompts', '#', 'approved', 'Maria Oliveira'),
  ('RAG na prática', '#', 'approved', 'Carlos Lima'),
  ('Fine-tuning de modelos', '#', 'approved', 'Juliana Costa'),
  ('Agentes autônomos com LangChain', '#', 'approved', 'Rafael Souza'),
  ('Visão computacional com IA', '#', 'approved', 'Fernanda Alves'),
  ('NLP avançado — transformers', '#', 'approved', 'Thiago Nunes');

insert into public.prompts (title, content, status, submitted_by) values
  ('Prompt avançado para análise de dados', 'Você é um analista de dados especialista. Analise os dados fornecidos e produza: 1) Resumo executivo; 2) Principais insights; 3) Anomalias detectadas; 4) Recomendações estratégicas.', 'approved', 'Pedro Santos'),
  ('Gerador de copy para marketing', 'Atue como um copywriter especialista em marketing digital. Crie 5 variações de copy para [produto/serviço], focando em [benefício principal]. Use gatilhos mentais de urgência e prova social.', 'approved', 'Ana Costa'),
  ('Revisor de código profissional', 'Você é um engenheiro sênior revisando código. Analise: bugs potenciais, performance, segurança, legibilidade e boas práticas. Sugira melhorias com exemplos de código corrigido.', 'approved', 'Carlos Lima'),
  ('Criador de plano de negócios', 'Baseado na ideia de negócio fornecida, crie um plano completo incluindo: análise de mercado, modelo de receita, custos iniciais, estratégia de marketing, riscos e projeções para 12 meses.', 'approved', 'Juliana Costa');

-- Pendentes de exemplo
insert into public.videos (title, embed_url, status, submitted_by) values
  ('IA generativa: tendências e possibilidades', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'pending', 'Juliana Costa');

insert into public.docs (title, file_url, status, submitted_by) values
  ('Guia prático de fine-tuning', '#', 'pending', 'Roberto Nunes');

insert into public.prompts (title, content, status, submitted_by) values
  ('Assistente de escrita acadêmica', 'Atue como professor universitário. Revise o texto acadêmico fornecido melhorando: estrutura argumentativa, clareza, coerência e referências.', 'pending', 'Beatriz Lima');

-- =============================================
-- Fase 3 — Storage bucket para capas
-- Execute no Supabase SQL Editor
-- =============================================

-- Bucket público para imagens de capa
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "public_read_covers_storage"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "public_upload_covers_storage"
  on storage.objects for insert
  with check (bucket_id = 'covers');
