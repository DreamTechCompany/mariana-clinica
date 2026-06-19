import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Agendamento } from "@/lib/types";
import { STATUS_AGENDAMENTO_LABEL } from "@/lib/types";
import { formatTime, formatMoney, formatMonthLabel, currentMonth, today } from "@/lib/format";
import { card, badge, btnPrimary } from "@/lib/ui";

type Row = Agendamento & { pacientes: { nome: string; id: string } | null };

const statusStyle: Record<string, string> = {
  agendado: "bg-roxo-100 text-roxo-600",
  realizado: "bg-green-100 text-green-700",
  faltou: "bg-red-100 text-red-600",
  cancelado: "bg-neutral-200 text-neutral-600",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const dia = today();
  const mes = currentMonth();

  const [
    { data: hoje },
    { count: ativos },
    { data: doMes },
  ] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("*, pacientes(id, nome)")
      .gte("inicio", `${dia}T00:00:00-03:00`)
      .lte("inicio", `${dia}T23:59:59-03:00`)
      .order("inicio", { ascending: true })
      .returns<Row[]>(),
    supabase
      .from("pacientes")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),
    supabase
      .from("pagamentos")
      .select("valor, tipo")
      .gte("data", `${mes}-01`)
      .returns<{ valor: number; tipo: string }[]>(),
  ]);

  const receitas = (doMes ?? [])
    .filter((r) => r.tipo === "receita")
    .reduce((s, r) => s + Number(r.valor), 0);
  const despesas = (doMes ?? [])
    .filter((r) => r.tipo === "despesa")
    .reduce((s, r) => s + Number(r.valor), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-roxo-800">
          Bem-vinda, Mariana
        </h1>
        <p className="mt-1 text-sm text-roxo-400">
          Visão geral do consultório
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">
            Pacientes ativos
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-roxo-700">
            {ativos ?? 0}
          </p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">
            Atendimentos hoje
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-roxo-700">
            {hoje?.length ?? 0}
          </p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">
            Saldo · {formatMonthLabel(mes)}
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-roxo-700">
            {formatMoney(receitas - despesas)}
          </p>
        </div>
      </div>

      {/* Agenda de hoje */}
      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-roxo-700">
            Hoje
          </h2>
          <Link href="/agenda" className="text-sm text-roxo-500 hover:underline">
            Abrir agenda
          </Link>
        </div>

        {!hoje || hoje.length === 0 ? (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-roxo-50 px-4 py-6">
            <p className="text-sm text-roxo-400">
              Nenhum atendimento marcado para hoje.
            </p>
            <Link href="/agenda" className={btnPrimary}>
              Agendar
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-roxo-50">
            {hoje.map((a) => (
              <li key={a.id} className="flex items-center gap-4 py-3">
                <span className="w-14 font-heading text-lg font-bold text-roxo-700">
                  {formatTime(a.inicio)}
                </span>
                <span className="flex-1">
                  {a.pacientes ? (
                    <Link
                      href={`/pacientes/${a.pacientes.id}`}
                      className="font-medium text-roxo-800 hover:underline"
                    >
                      {a.pacientes.nome}
                    </Link>
                  ) : (
                    <span className="text-roxo-800">Paciente</span>
                  )}
                </span>
                <span className={`${badge} ${statusStyle[a.status]}`}>
                  {STATUS_AGENDAMENTO_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
