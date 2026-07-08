-- Consultório MC — Mariana Consentino
-- Migration 0003: data da primeira sessão do paciente
--
-- Registra quando o paciente iniciou (ou vai iniciar) o acompanhamento. Campo
-- da ficha cadastral, opcional.

alter table pacientes
  add column if not exists primeira_sessao date;
