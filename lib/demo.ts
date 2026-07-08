// Modo demonstração.
//
// Quando o app sobe SEM as variáveis do Supabase (ex: deploy de vitrine na
// Vercel pra mostrar pro cliente), ele entra em modo demo: dados fictícios,
// login dispensado e nada é gravado. Assim que as chaves do Supabase forem
// configuradas, o app passa a usar o banco real sem mudar nenhuma linha.
//
// Este módulo é puro (sem APIs de Node) — pode ser importado no middleware
// (Edge), em Server Components e em Client Components.

import type {
  Paciente,
  Agendamento,
  Sessao,
  Arquivo,
  Pagamento,
} from "./types";
import { today, currentMonth } from "./format";

export function isDemo(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO === "1" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

// ── Helpers de data relativos a hoje, pra agenda/dashboard sempre terem itens ──
function dayPlus(offset: number): string {
  const d = new Date(today() + "T12:00:00");
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function at(offset: number, hhmm: string): string {
  return `${dayPlus(offset)}T${hhmm}:00-03:00`;
}

function diaDoMes(dia: number): string {
  return `${currentMonth()}-${String(dia).padStart(2, "0")}`;
}

// ── Pacientes ──────────────────────────────────────────────────────────────
const ts = "2026-01-10T10:00:00-03:00";

export const demoPacientes: Paciente[] = [
  {
    id: "p1",
    nome: "Ana Beatriz Lima",
    data_nascimento: "1992-03-14",
    telefone: "(21) 98888-1010",
    email: "ana.lima@email.com",
    endereco: "Rua das Acácias, 120 — Tijuca, RJ",
    profissao: "Arquiteta",
    contato_emergencia: "Marcos Lima (irmão) — (21) 97777-2020",
    primeira_sessao: "2026-06-05",
    queixa: "Ansiedade e dificuldade para dormir há cerca de 6 meses.",
    anamnese:
      "Paciente relata início dos sintomas após mudança de emprego. Sono fragmentado, ruminação noturna e episódios de taquicardia. Sem histórico de medicação psiquiátrica. Boa rede de apoio familiar. Hipótese inicial: transtorno de ansiedade. Plano: psicoeducação sobre ansiedade, técnicas de respiração e reestruturação cognitiva.",
    valor_sessao: 200,
    status: "ativo",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "p2",
    nome: "Carlos Eduardo Mendes",
    data_nascimento: "1985-11-02",
    telefone: "(21) 99999-3030",
    email: "carlos.mendes@email.com",
    endereco: "Av. Atlântica, 880 — Copacabana, RJ",
    profissao: "Gerente comercial",
    contato_emergencia: "Patrícia Mendes (esposa) — (21) 96666-4040",
    primeira_sessao: "2026-06-08",
    queixa: "Estresse no trabalho e conflitos no relacionamento.",
    anamnese:
      "Queixa de sobrecarga profissional e irritabilidade em casa. Relata distanciamento afetivo do casal. Pratica atividade física regular. Plano: trabalhar manejo de estresse e comunicação assertiva.",
    valor_sessao: 200,
    status: "ativo",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "p3",
    nome: "Juliana Rocha",
    data_nascimento: "1998-07-21",
    telefone: "(21) 98787-5050",
    email: "ju.rocha@email.com",
    endereco: "Rua Conde de Bonfim, 45 — Tijuca, RJ",
    profissao: "Estudante de medicina",
    contato_emergencia: "Sônia Rocha (mãe) — (21) 95555-6060",
    primeira_sessao: "2026-06-10",
    queixa: "Orientação profissional e autocobrança excessiva.",
    anamnese:
      "Paciente em processo de orientação vocacional, com perfeccionismo e medo de falhar nas provas. Bom insight. Plano: orientação profissional e manejo da autocrítica.",
    valor_sessao: 180,
    status: "ativo",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "p4",
    nome: "Pedro Henrique Alves",
    data_nascimento: "2010-05-30",
    telefone: "(21) 98123-7070",
    email: null,
    endereco: "Rua Maxwell, 200 — Vila Isabel, RJ",
    profissao: "Estudante (8º ano)",
    contato_emergencia: "Fernanda Alves (mãe) — (21) 94444-8080",
    primeira_sessao: "2026-05-20",
    queixa: "Dificuldades de comportamento na escola (infanto-juvenil).",
    anamnese:
      "Encaminhado pela escola por agitação e dificuldade de concentração. Acompanhamento conjunto com os pais. Plano: avaliação comportamental e orientação parental.",
    valor_sessao: 180,
    status: "ativo",
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "p5",
    nome: "Sofia Martins",
    data_nascimento: "1979-09-08",
    telefone: "(21) 98321-9090",
    email: "sofia.martins@email.com",
    endereco: "Rua Barão de Mesquita, 700 — Grajaú, RJ",
    profissao: "Professora",
    contato_emergencia: "Roberto Martins (marido) — (21) 93333-1011",
    primeira_sessao: "2026-02-14",
    queixa: "Processo de luto.",
    anamnese:
      "Acompanhamento de luto após perda do pai. Boa evolução nos últimos meses. Recebeu alta com retorno aberto.",
    valor_sessao: 200,
    status: "alta",
    created_at: ts,
    updated_at: ts,
  },
];

// ── Agendamentos (relativos a hoje) ──────────────────────────────────────────
export const demoAgendamentos: Agendamento[] = [
  { id: "a1", paciente_id: "p1", inicio: at(0, "09:00"), duracao_min: 50, status: "realizado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a2", paciente_id: "p2", inicio: at(0, "10:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a3", paciente_id: "p3", inicio: at(0, "14:00"), duracao_min: 50, status: "agendado", observacao: "Sessão de orientação", created_at: ts, updated_at: ts },
  { id: "a4", paciente_id: "p4", inicio: at(0, "16:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a5", paciente_id: "p1", inicio: at(7, "09:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a6", paciente_id: "p2", inicio: at(7, "10:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a7", paciente_id: "p3", inicio: at(8, "14:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
  { id: "a8", paciente_id: "p4", inicio: at(1, "16:00"), duracao_min: 50, status: "agendado", observacao: null, created_at: ts, updated_at: ts },
];

// ── Sessões ──────────────────────────────────────────────────────────────────
export const demoSessoes: Sessao[] = [
  { id: "s1", paciente_id: "p1", agendamento_id: "a1", data: today(), resumo: "Paciente trouxe melhora no sono após iniciar técnica de respiração. Trabalhamos reestruturação de pensamentos catastróficos sobre o trabalho. Para casa: registro de pensamentos.", created_at: ts, updated_at: ts },
  { id: "s2", paciente_id: "p1", agendamento_id: null, data: "2026-06-05", resumo: "Sessão inicial de psicoeducação sobre ansiedade. Mapeamos gatilhos. Boa adesão.", created_at: ts, updated_at: ts },
  { id: "s3", paciente_id: "p2", agendamento_id: null, data: "2026-06-08", resumo: "Trabalhamos comunicação assertiva no contexto do casal. Paciente reconheceu padrões de evitação.", created_at: ts, updated_at: ts },
  { id: "s4", paciente_id: "p3", agendamento_id: null, data: "2026-06-10", resumo: "Aplicado inventário de interesses. Discussão sobre autocobrança nas provas.", created_at: ts, updated_at: ts },
];

// ── Arquivos (no demo o download é desativado) ───────────────────────────────
export const demoArquivos: Arquivo[] = [
  { id: "f1", paciente_id: "p1", sessao_id: null, categoria: "anamnese", storage_path: "demo/anamnese-ana.pdf", file_name: "anamnese-ana-beatriz.pdf", uploaded_at: "2026-06-05T10:00:00-03:00" },
  { id: "f2", paciente_id: "p1", sessao_id: "s1", categoria: "sessao", storage_path: "demo/registro-pensamentos.pdf", file_name: "registro-de-pensamentos.pdf", uploaded_at: today() + "T11:00:00-03:00" },
];

// ── Pagamentos (mês atual) ───────────────────────────────────────────────────
export const demoPagamentos: Pagamento[] = [
  { id: "g1", paciente_id: "p1", agendamento_id: null, descricao: null, valor: 200, tipo: "receita", pago: true, metodo: "Pix", data: diaDoMes(3), created_at: ts },
  { id: "g2", paciente_id: "p2", agendamento_id: null, descricao: null, valor: 200, tipo: "receita", pago: true, metodo: "Cartão", data: diaDoMes(5), created_at: ts },
  { id: "g3", paciente_id: "p3", agendamento_id: null, descricao: null, valor: 180, tipo: "receita", pago: true, metodo: "Pix", data: diaDoMes(8), created_at: ts },
  { id: "g4", paciente_id: "p1", agendamento_id: null, descricao: null, valor: 200, tipo: "receita", pago: true, metodo: "Pix", data: diaDoMes(10), created_at: ts },
  { id: "g5", paciente_id: "p4", agendamento_id: null, descricao: "Sessão (a receber)", valor: 180, tipo: "receita", pago: false, metodo: null, data: diaDoMes(12), created_at: ts },
  { id: "g6", paciente_id: null, agendamento_id: null, descricao: "Aluguel da sala", valor: 1200, tipo: "despesa", pago: true, metodo: "Boleto", data: diaDoMes(5), created_at: ts },
  { id: "g7", paciente_id: null, agendamento_id: null, descricao: "Plataforma / software", valor: 90, tipo: "despesa", pago: true, metodo: "Cartão", data: diaDoMes(2), created_at: ts },
];

export function demoPacienteNome(id: string | null): string | null {
  if (!id) return null;
  return demoPacientes.find((p) => p.id === id)?.nome ?? null;
}
