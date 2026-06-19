-- Consultório MC — Mariana Consentino, Psicóloga Clínica
-- Migration 0001: schema inicial
--
-- Modelo: a psicóloga (usuário do sistema) gerencia PACIENTES. Cada paciente
-- tem ficha + anamnese. AGENDAMENTOS marcam os horários (e a presença). Cada
-- atendimento gera uma SESSÃO (resumo/evolução do caso). PAGAMENTOS alimentam
-- o financeiro/balancete. ARQUIVOS são anexos (anamnese, sessão) no Storage.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Usuário do sistema (a psicóloga e, futuramente, secretária). Liga em
-- auth.users do Supabase.
-- ─────────────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'psicologa'
                check (role in ('psicologa', 'secretaria')),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Pacientes — ficha cadastral + anamnese
-- ─────────────────────────────────────────────────────────────────────────
create table pacientes (
  id                  uuid primary key default gen_random_uuid(),
  nome                text not null,
  data_nascimento     date,
  telefone            text,
  email               text,
  endereco            text,
  profissao           text,
  contato_emergencia  text,
  queixa              text,                 -- queixa/motivo principal
  anamnese            text,                 -- ficha de anamnese (texto livre)
  valor_sessao        numeric(10,2),        -- valor padrão da sessão
  status              text not null default 'ativo'
                        check (status in ('ativo', 'inativo', 'alta')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Agendamentos — agenda + presença (status do atendimento)
-- ─────────────────────────────────────────────────────────────────────────
create table agendamentos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references pacientes(id) on delete cascade,
  inicio       timestamptz not null,
  duracao_min  int not null default 50,
  status       text not null default 'agendado'
                 check (status in ('agendado', 'realizado', 'faltou', 'cancelado')),
  observacao   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Sessões — resumo/evolução do caso (uma por atendimento)
-- ─────────────────────────────────────────────────────────────────────────
create table sessoes (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references pacientes(id) on delete cascade,
  agendamento_id  uuid references agendamentos(id) on delete set null,
  data            date not null default current_date,
  resumo          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Arquivos — anexos no Storage (bucket privado "arquivos")
-- ─────────────────────────────────────────────────────────────────────────
create table arquivos (
  id            uuid primary key default gen_random_uuid(),
  paciente_id   uuid not null references pacientes(id) on delete cascade,
  sessao_id     uuid references sessoes(id) on delete set null,
  categoria     text not null default 'outro'
                  check (categoria in ('anamnese', 'sessao', 'outro')),
  storage_path  text not null,
  file_name     text,
  uploaded_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Pagamentos — financeiro (receitas e despesas) p/ o balancete mensal
-- ─────────────────────────────────────────────────────────────────────────
create table pagamentos (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid references pacientes(id) on delete set null,
  agendamento_id  uuid references agendamentos(id) on delete set null,
  descricao       text,
  valor           numeric(10,2) not null,
  tipo            text not null default 'receita'
                    check (tipo in ('receita', 'despesa')),
  pago            boolean not null default true,
  metodo          text,                       -- pix, dinheiro, cartão, etc.
  data            date not null default current_date,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Índices (FKs e colunas mais consultadas)
-- ─────────────────────────────────────────────────────────────────────────
create index idx_agendamentos_paciente on agendamentos(paciente_id);
create index idx_agendamentos_inicio   on agendamentos(inicio);
create index idx_sessoes_paciente      on sessoes(paciente_id);
create index idx_arquivos_paciente     on arquivos(paciente_id);
create index idx_arquivos_sessao       on arquivos(sessao_id);
create index idx_pagamentos_paciente   on pagamentos(paciente_id);
create index idx_pagamentos_data       on pagamentos(data);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger de updated_at
-- ─────────────────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_pacientes_updated
  before update on pacientes
  for each row execute function set_updated_at();

create trigger trg_agendamentos_updated
  before update on agendamentos
  for each row execute function set_updated_at();

create trigger trg_sessoes_updated
  before update on sessoes
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Cria o profile automaticamente quando um usuário se registra
-- ─────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
