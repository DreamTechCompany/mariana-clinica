# Consultório MC — código

Sistema de gestão do consultório da Mariana Consentino (psicóloga clínica).
Cliente da DreamTech. Repo de código próprio (fora do MazyOS).

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres, Auth,
Storage). Deploy na Vercel. Mesmo padrão do `aaposta-crm`.

## Identidade visual

Tirada da arte de divulgação da Mariana: **roxo profundo (#6a2c8f) + dourado
(#f2c94c)**, títulos em **Montserrat**, corpo em **Open Sans**. Tokens em
`app/globals.css` (`--color-roxo-*`, `--color-dourado-*`). Não trocar a paleta
sem alinhar com a cliente.

## Convenções

- Mutações via **Server Actions** (`actions.ts` por módulo), nunca chamadas
  Supabase no client.
- Dados de saúde = sigilo (LGPD). Sem rotas públicas; anexos no bucket privado
  `arquivos`, baixados por signed URL (`app/api/arquivo/[id]`).
- RLS: qualquer usuário autenticado tem acesso total (consultório de um dono).
- Datas/fuso: helpers em `lib/format.ts` (America/Sao_Paulo).
- Classes de UI compartilhadas em `lib/ui.ts`.

## Modelo de dados

`pacientes` (ficha + anamnese) · `agendamentos` (agenda + presença) ·
`sessoes` (resumo do caso) · `arquivos` (anexos) · `pagamentos` (financeiro).
Schema em `supabase/migrations/`.
