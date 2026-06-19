-- Consultório MC — Mariana Consentino
-- Migration 0002: Row Level Security e Storage
--
-- Dados de saúde, sigilosos (LGPD). Não há acesso público: tudo exige sessão
-- autenticada. Como é uma ferramenta interna de um único consultório, qualquer
-- usuário autenticado (a psicóloga / secretária) tem acesso total aos dados.

-- ─────────────────────────────────────────────────────────────────────────
-- Habilita RLS em todas as tabelas
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles      enable row level security;
alter table pacientes     enable row level security;
alter table agendamentos  enable row level security;
alter table sessoes       enable row level security;
alter table arquivos      enable row level security;
alter table pagamentos    enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- Usuários autenticados têm acesso total (ferramenta interna).
-- ─────────────────────────────────────────────────────────────────────────
create policy "auth full access" on pacientes
  for all to authenticated using (true) with check (true);
create policy "auth full access" on agendamentos
  for all to authenticated using (true) with check (true);
create policy "auth full access" on sessoes
  for all to authenticated using (true) with check (true);
create policy "auth full access" on arquivos
  for all to authenticated using (true) with check (true);
create policy "auth full access" on pagamentos
  for all to authenticated using (true) with check (true);

-- Cada usuário vê e edita o próprio perfil
create policy "own profile" on profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- Storage: bucket privado de anexos. Acesso só por usuário autenticado.
-- Download é servido por Route Handler com signed URL (app/api/arquivo).
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('arquivos', 'arquivos', false)
on conflict (id) do nothing;

create policy "auth reads arquivos" on storage.objects
  for select to authenticated using (bucket_id = 'arquivos');
create policy "auth writes arquivos" on storage.objects
  for insert to authenticated with check (bucket_id = 'arquivos');
create policy "auth updates arquivos" on storage.objects
  for update to authenticated using (bucket_id = 'arquivos');
create policy "auth deletes arquivos" on storage.objects
  for delete to authenticated using (bucket_id = 'arquivos');
