// Camada de leitura. Cada função decide entre o banco real (Supabase) e os
// dados fictícios do modo demonstração. As páginas chamam só estas funções —
// não falam com o Supabase direto —, então plugar as chaves do Supabase faz
// tudo virar real sem tocar nas telas.

import { createClient } from "./supabase/server";
import {
  isDemo,
  demoPacientes,
  demoAgendamentos,
  demoSessoes,
  demoArquivos,
  demoPagamentos,
  demoPacienteNome,
} from "./demo";
import type { Paciente, Agendamento, Sessao, Arquivo, Pagamento } from "./types";

export type AgPaciente = Agendamento & {
  pacientes: { id: string; nome: string } | null;
};
export type PagPaciente = Pagamento & { pacientes: { nome: string } | null };

// ── Dashboard ────────────────────────────────────────────────────────────────
export async function getAgendamentosDoDia(dia: string): Promise<AgPaciente[]> {
  if (isDemo()) {
    return demoAgendamentos
      .filter((a) => a.inicio.startsWith(dia))
      .sort((x, y) => x.inicio.localeCompare(y.inicio))
      .map((a) => ({
        ...a,
        pacientes: demoPaciente(a.paciente_id),
      }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("agendamentos")
    .select("*, pacientes(id, nome)")
    .gte("inicio", `${dia}T00:00:00-03:00`)
    .lte("inicio", `${dia}T23:59:59-03:00`)
    .order("inicio", { ascending: true })
    .returns<AgPaciente[]>();
  return data ?? [];
}

export async function contarPacientesAtivos(): Promise<number> {
  if (isDemo()) {
    return demoPacientes.filter((p) => p.status === "ativo").length;
  }
  const supabase = await createClient();
  const { count } = await supabase
    .from("pacientes")
    .select("id", { count: "exact", head: true })
    .eq("status", "ativo");
  return count ?? 0;
}

export async function getPagamentosDesde(
  dataInicial: string,
): Promise<{ valor: number; tipo: string }[]> {
  if (isDemo()) {
    return demoPagamentos
      .filter((p) => p.data >= dataInicial)
      .map((p) => ({ valor: p.valor, tipo: p.tipo }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("pagamentos")
    .select("valor, tipo")
    .gte("data", dataInicial)
    .returns<{ valor: number; tipo: string }[]>();
  return data ?? [];
}

// ── Pacientes ────────────────────────────────────────────────────────────────
export async function listarPacientes(q?: string): Promise<Paciente[]> {
  if (isDemo()) {
    const termo = (q ?? "").trim().toLowerCase();
    return demoPacientes
      .filter((p) => (termo ? p.nome.toLowerCase().includes(termo) : true))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }
  const supabase = await createClient();
  let query = supabase
    .from("pacientes")
    .select("*")
    .order("nome", { ascending: true });
  if (q && q.trim()) query = query.ilike("nome", `%${q.trim()}%`);
  const { data } = await query.returns<Paciente[]>();
  return data ?? [];
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  if (isDemo()) {
    return demoPacientes.find((p) => p.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single<Paciente>();
  return data ?? null;
}

export async function listarSessoes(pacienteId: string): Promise<Sessao[]> {
  if (isDemo()) {
    return demoSessoes
      .filter((s) => s.paciente_id === pacienteId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessoes")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("data", { ascending: false })
    .returns<Sessao[]>();
  return data ?? [];
}

export async function listarArquivos(pacienteId: string): Promise<Arquivo[]> {
  if (isDemo()) {
    return demoArquivos
      .filter((a) => a.paciente_id === pacienteId)
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("arquivos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("uploaded_at", { ascending: false })
    .returns<Arquivo[]>();
  return data ?? [];
}

export async function proximosAgendamentos(
  pacienteId: string,
  limit: number,
): Promise<Agendamento[]> {
  const agora = new Date().toISOString();
  if (isDemo()) {
    return demoAgendamentos
      .filter((a) => a.paciente_id === pacienteId && a.inicio >= agora)
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .slice(0, limit);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .gte("inicio", agora)
    .order("inicio", { ascending: true })
    .limit(limit)
    .returns<Agendamento[]>();
  return data ?? [];
}

// ── Agenda ───────────────────────────────────────────────────────────────────
export async function getAgendaDoDia(dia: string): Promise<AgPaciente[]> {
  return getAgendamentosDoDia(dia);
}

// Agendamentos num intervalo de dias [inicioDia, fimDiaExclusivo) — usado na
// visão de semana. Datas em YYYY-MM-DD; o fim é exclusivo.
export async function getAgendamentosNoPeriodo(
  inicioDia: string,
  fimDiaExclusivo: string,
): Promise<AgPaciente[]> {
  const lo = `${inicioDia}T00:00:00-03:00`;
  const hi = `${fimDiaExclusivo}T00:00:00-03:00`;
  if (isDemo()) {
    return demoAgendamentos
      .filter((a) => a.inicio >= lo && a.inicio < hi)
      .sort((x, y) => x.inicio.localeCompare(y.inicio))
      .map((a) => ({ ...a, pacientes: demoPaciente(a.paciente_id) }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("agendamentos")
    .select("*, pacientes(id, nome)")
    .gte("inicio", lo)
    .lt("inicio", hi)
    .order("inicio", { ascending: true })
    .returns<AgPaciente[]>();
  return data ?? [];
}

export async function pacientesParaSelect(
  somenteAtivos: boolean,
): Promise<{ id: string; nome: string }[]> {
  if (isDemo()) {
    return demoPacientes
      .filter((p) => (somenteAtivos ? p.status !== "inativo" : true))
      .map((p) => ({ id: p.id, nome: p.nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }
  const supabase = await createClient();
  let query = supabase.from("pacientes").select("id, nome");
  if (somenteAtivos) query = query.neq("status", "inativo");
  const { data } = await query
    .order("nome", { ascending: true })
    .returns<{ id: string; nome: string }[]>();
  return data ?? [];
}

// ── Financeiro ───────────────────────────────────────────────────────────────
export async function pagamentosDoMes(
  mes: string,
  inicio: string,
  fim: string,
): Promise<PagPaciente[]> {
  if (isDemo()) {
    return demoPagamentos
      .filter((p) => p.data >= inicio && p.data < fim)
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((p) => ({
        ...p,
        pacientes: p.paciente_id ? { nome: demoPacienteNome(p.paciente_id)! } : null,
      }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("pagamentos")
    .select("*, pacientes(nome)")
    .gte("data", inicio)
    .lt("data", fim)
    .order("data", { ascending: false })
    .returns<PagPaciente[]>();
  return data ?? [];
}

function demoPaciente(id: string): { id: string; nome: string } | null {
  const p = demoPacientes.find((x) => x.id === id);
  return p ? { id: p.id, nome: p.nome } : null;
}
