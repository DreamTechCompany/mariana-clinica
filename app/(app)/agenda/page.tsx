import Link from "next/link";
import type { AgPaciente } from "@/lib/data";
import { STATUS_AGENDAMENTO_LABEL } from "@/lib/types";
import {
  formatTime,
  formatDate,
  formatWeekday,
  dateKey,
  today,
} from "@/lib/format";
import {
  getAgendaDoDia,
  getAgendamentosNoPeriodo,
  pacientesParaSelect,
} from "@/lib/data";
import {
  createAgendamento,
  setPresenca,
  deleteAgendamento,
} from "./actions";
import { ConfirmButton } from "../confirm-button";
import { card, input, label, btnPrimary, badge } from "@/lib/ui";

const statusStyle: Record<string, string> = {
  agendado: "bg-roxo-100 text-roxo-600",
  realizado: "bg-green-100 text-green-700",
  faltou: "bg-red-100 text-red-600",
  cancelado: "bg-neutral-200 text-neutral-600",
};

// Soma/subtrai dias de uma data YYYY-MM-DD sem cair em fuso.
function shiftDay(d: string, delta: number): string {
  const dt = new Date(d + "T12:00:00");
  dt.setDate(dt.getDate() + delta);
  return dt.toISOString().slice(0, 10);
}

// Segunda-feira da semana que contém a data (semana seg–dom).
function startOfWeek(d: string): string {
  const dt = new Date(d + "T12:00:00");
  const diff = (dt.getDay() + 6) % 7; // dias desde segunda
  dt.setDate(dt.getDate() - diff);
  return dt.toISOString().slice(0, 10);
}

// Uma linha de agendamento (reaproveitada na visão de dia e de semana).
function AgendamentoRow({
  a,
  dia,
  view,
}: {
  a: AgPaciente;
  dia: string;
  view: "dia" | "semana";
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
      <div className="w-14 shrink-0 font-heading text-lg font-bold text-roxo-700">
        {formatTime(a.inicio)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-roxo-800">
          {a.pacientes ? (
            <Link
              href={`/pacientes/${a.pacientes.id}`}
              className="hover:underline"
            >
              {a.pacientes.nome}
            </Link>
          ) : (
            "Paciente"
          )}
        </p>
        <p className="text-xs text-roxo-400">
          {a.duracao_min} min
          {a.observacao ? ` · ${a.observacao}` : ""}
        </p>
      </div>
      <span className={`${badge} ${statusStyle[a.status]}`}>
        {STATUS_AGENDAMENTO_LABEL[a.status]}
      </span>
      <div className="flex items-center gap-1">
        <form action={setPresenca.bind(null, a.id, "realizado", dia, view)}>
          <button
            title="Compareceu"
            className="rounded-md px-2.5 py-2 text-base text-green-600 hover:bg-green-50"
          >
            ✓
          </button>
        </form>
        <form action={setPresenca.bind(null, a.id, "faltou", dia, view)}>
          <button
            title="Faltou"
            className="rounded-md px-2.5 py-2 text-base text-red-500 hover:bg-red-50"
          >
            ✕
          </button>
        </form>
        <form action={deleteAgendamento.bind(null, a.id, dia, view)}>
          <ConfirmButton
            message="Excluir este agendamento?"
            className="rounded-md px-2.5 py-2 text-base text-roxo-400 hover:bg-roxo-50"
          >
            🗑
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; view?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const dia = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today();
  const view: "dia" | "semana" = sp.view === "semana" ? "semana" : "dia";
  const step = view === "semana" ? 7 : 1;

  const semanaInicio = startOfWeek(dia);
  const semanaFim = shiftDay(semanaInicio, 7); // exclusivo
  const diasDaSemana = Array.from({ length: 7 }, (_, i) =>
    shiftDay(semanaInicio, i),
  );

  const [agendamentos, pacientes] = await Promise.all([
    view === "semana"
      ? getAgendamentosNoPeriodo(semanaInicio, semanaFim)
      : getAgendaDoDia(dia),
    pacientesParaSelect(true),
  ]);

  // Agrupa por dia (só usado na visão de semana).
  const porDia = new Map<string, AgPaciente[]>();
  if (view === "semana") {
    for (const a of agendamentos) {
      const k = dateKey(a.inicio);
      const lista = porDia.get(k) ?? [];
      lista.push(a);
      porDia.set(k, lista);
    }
  }

  // Preserva a visão atual nos links de navegação.
  const vq = view === "semana" ? "&view=semana" : "";
  const tabBase = "rounded-lg px-3 py-1.5 text-sm font-medium transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-roxo-800">Agenda</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Dia / Semana */}
          <div className="flex rounded-lg border border-roxo-200 p-0.5">
            <Link
              href={`/agenda?d=${dia}`}
              className={`${tabBase} ${
                view === "dia"
                  ? "bg-roxo-600 text-white"
                  : "text-roxo-600 hover:bg-roxo-50"
              }`}
            >
              Dia
            </Link>
            <Link
              href={`/agenda?d=${dia}&view=semana`}
              className={`${tabBase} ${
                view === "semana"
                  ? "bg-roxo-600 text-white"
                  : "text-roxo-600 hover:bg-roxo-50"
              }`}
            >
              Semana
            </Link>
          </div>
          <Link
            href={`/agenda?d=${shiftDay(dia, -step)}${vq}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            ←
          </Link>
          <Link
            href={`/agenda?d=${shiftDay(dia, step)}${vq}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            →
          </Link>
          <Link
            href={`/agenda?d=${today()}${vq}`}
            className="rounded-lg bg-roxo-100 px-3 py-1.5 text-sm font-medium text-roxo-600 hover:bg-roxo-200"
          >
            Hoje
          </Link>
        </div>
      </div>

      <p className="text-sm capitalize text-roxo-500">
        {view === "semana"
          ? `Semana de ${formatDate(semanaInicio)} a ${formatDate(
              shiftDay(semanaFim, -1),
            )}`
          : `${formatWeekday(dia)}, ${formatDate(dia)}`}
      </p>

      {sp.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {sp.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista (dia ou semana) */}
        <div className="lg:col-span-2">
          {view === "semana" ? (
            <div className="space-y-4">
              {diasDaSemana.map((d) => {
                const itens = porDia.get(d) ?? [];
                const ehHoje = d === today();
                return (
                  <div
                    key={d}
                    className="overflow-hidden rounded-2xl border border-roxo-100 bg-white shadow-sm"
                  >
                    <div
                      className={`flex items-center justify-between px-4 py-2 sm:px-5 ${
                        ehHoje ? "bg-roxo-100" : "bg-roxo-50"
                      }`}
                    >
                      <p className="text-sm font-semibold capitalize text-roxo-700">
                        {formatWeekday(d)}{" "}
                        <span className="font-normal text-roxo-400">
                          · {formatDate(d)}
                        </span>
                      </p>
                      <Link
                        href={`/agenda?d=${d}`}
                        className="text-xs text-roxo-500 hover:underline"
                      >
                        Ver dia
                      </Link>
                    </div>
                    {itens.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-roxo-300 sm:px-5">
                        Sem horários.
                      </p>
                    ) : (
                      <ul className="divide-y divide-roxo-50">
                        {itens.map((a) => (
                          <AgendamentoRow
                            key={a.id}
                            a={a}
                            dia={dia}
                            view="semana"
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-roxo-100 bg-white shadow-sm">
              {agendamentos.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-roxo-400">
                  Nenhum horário marcado para este dia.
                </p>
              ) : (
                <ul className="divide-y divide-roxo-50">
                  {agendamentos.map((a) => (
                    <AgendamentoRow key={a.id} a={a} dia={dia} view="dia" />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Novo agendamento */}
        <div className={card}>
          <h2 className="font-heading text-lg font-semibold text-roxo-700">
            Novo horário
          </h2>
          {!pacientes || pacientes.length === 0 ? (
            <p className="mt-3 text-sm text-roxo-400">
              Cadastre um paciente primeiro.{" "}
              <Link href="/pacientes/novo" className="text-roxo-600 hover:underline">
                Cadastrar
              </Link>
            </p>
          ) : (
            <form action={createAgendamento} className="mt-4 space-y-3">
              <input type="hidden" name="view" value={view} />
              <div>
                <label className={label} htmlFor="paciente_id">
                  Paciente
                </label>
                <select id="paciente_id" name="paciente_id" required className={input}>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={label} htmlFor="data">
                    Data
                  </label>
                  <input id="data" name="data" type="date" defaultValue={dia} required className={input} />
                </div>
                <div>
                  <label className={label} htmlFor="hora">
                    Hora
                  </label>
                  <input id="hora" name="hora" type="time" required className={input} />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="duracao_min">
                  Duração (min)
                </label>
                <input
                  id="duracao_min"
                  name="duracao_min"
                  type="number"
                  defaultValue={50}
                  min={10}
                  step={5}
                  className={input}
                />
              </div>
              <div>
                <label className={label} htmlFor="observacao">
                  Observação
                </label>
                <input id="observacao" name="observacao" className={input} />
              </div>
              <button type="submit" className={`${btnPrimary} w-full`}>
                Agendar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
