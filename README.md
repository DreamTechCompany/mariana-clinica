# Consultório MC — Mariana Consentino

Sistema de gestão do consultório de psicologia da Mariana Consentino. Construído
pela DreamTech.

Stack: **Next.js 15** (App Router) + **TypeScript** + **Tailwind v4** +
**Supabase** (Postgres, Auth e Storage). Deploy na **Vercel**.

## Funcionalidades

- **Login** com e-mail e senha (Supabase Auth)
- **Pacientes** — ficha cadastral + anamnese, com anexo de arquivos
- **Agenda** — horários do dia, com marcação de presença (compareceu/faltou)
- **Sessões** — resumo/evolução do caso por paciente, com anexo
- **Financeiro** — lançamentos de receita/despesa e balancete mensal
- **Painel inicial** — atendimentos do dia, pacientes ativos e saldo do mês

Dados de saúde são sigilosos: nada é público, tudo exige login, e os anexos
ficam num bucket privado servido por link temporário (signed URL).

## Dois modos

O sistema funciona de dois jeitos, e ele decide sozinho qual usar:

- **Modo demonstração** — se as variáveis do Supabase **não** estiverem
  configuradas, o app sobe com dados fictícios (uma clínica de exemplo), sem
  login e sem gravar nada. Serve pra mostrar pro cliente.
- **Modo real** — assim que as 3 variáveis do Supabase forem preenchidas, o
  mesmo código passa a usar o banco real, com login e persistência. Não muda
  nenhuma linha; é só configurar as chaves.

### Deploy de demonstração (Vercel, sem Supabase) — rápido

1. Importe o repo na Vercel (Add New → Project).
2. **Não configure** as variáveis do Supabase (ou defina `NEXT_PUBLIC_DEMO=1`).
3. Deploy. O link que a Vercel gerar já abre direto no painel, com a clínica
   de exemplo — é esse link que você manda pro cliente.

Quando fechar com a cliente, é só adicionar as variáveis do Supabase (passos
abaixo) e fazer um novo deploy: o demo vira o sistema real.

## Como rodar localmente

1. **Crie um projeto no Supabase** (https://supabase.com).
2. **Rode as migrations** em `supabase/migrations/` na ordem (SQL Editor do
   Supabase): `0001_init.sql` e depois `0002_rls.sql`. Isso cria as tabelas,
   o RLS e o bucket `arquivos`.
3. **Variáveis de ambiente** — copie `.env.example` para `.env.local` e
   preencha com os valores de _Project Settings → API_:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Instale e rode:**

   ```bash
   npm install
   npm run dev
   ```

5. **Crie o acesso da Mariana** em `/cadastrar` (ou crie o usuário direto no
   painel do Supabase). Se a confirmação de e-mail estiver ligada no Supabase,
   confirme antes de entrar — ou desligue em _Authentication → Providers → Email_.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as três variáveis de ambiente acima.
3. Deploy. A cada `git push` na branch principal, a Vercel publica.

## Estrutura

```
app/
  (app)/            páginas autenticadas (dashboard, agenda, pacientes, financeiro)
  api/arquivo/      download de anexos via signed URL
  login, cadastrar  autenticação
lib/
  supabase/         clients (server, browser, middleware)
  types.ts          tipos do domínio
  format.ts         formatação pt-BR / fuso SP
  ui.ts             classes utilitárias compartilhadas
supabase/migrations schema + RLS + storage
```
