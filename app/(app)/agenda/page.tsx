import Link from "next/link";
import { STATUS_AGENDAMENTO_LABEL } from "@/lib/types";
import { formatTime, formatDate, formatWeekday, today } from "@/lib/format";
import { getAgendaDoDia, pacientesParaSelect } from "@/lib/data";
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

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const dia = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today();

  const [agendamentos, pacientes] = await Promise.all([
    getAgendaDoDia(dia),
    pacientesParaSelect(true),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-roxo-800">Agenda</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/agenda?d=${shiftDay(dia, -1)}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            ←
          </Link>
          <form>
            <input
              type="date"
              name="d"
              defaultValue={dia}
              className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-800"
            />
          </form>
          <Link
            href={`/agenda?d=${shiftDay(dia, 1)}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            →
          </Link>
          <Link
            href={`/agenda?d=${today()}`}
            className="rounded-lg bg-roxo-100 px-3 py-1.5 text-sm font-medium text-roxo-600 hover:bg-roxo-200"
          >
            Hoje
          </Link>
        </div>
      </div>

      <p className="text-sm capitalize text-roxo-500">
        {formatWeekday(dia)}, {formatDate(dia)}
      </p>

      {sp.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {sp.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista do dia */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-roxo-100 bg-white shadow-sm">
            {!agendamentos || agendamentos.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-roxo-400">
                Nenhum horário marcado para este dia.
              </p>
            ) : (
              <ul className="divide-y divide-roxo-50">
                {agendamentos.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="w-14 shrink-0 font-heading text-lg font-bold text-roxo-700">
                      {formatTime(a.inicio)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-roxo-800">
                        {a.pacientes?.nome ?? "Paciente"}
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
                      <form action={setPresenca.bind(null, a.id, "realizado", dia)}>
                        <button
                          title="Compareceu"
                          className="rounded-md px-2.5 py-2 text-base text-green-600 hover:bg-green-50"
                        >
                          ✓
                        </button>
                      </form>
                      <form action={setPresenca.bind(null, a.id, "faltou", dia)}>
                        <button
                          title="Faltou"
                          className="rounded-md px-2.5 py-2 text-base text-red-500 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </form>
                      <form action={deleteAgendamento.bind(null, a.id, dia)}>
                        <ConfirmButton
                          message="Excluir este agendamento?"
                          className="rounded-md px-2.5 py-2 text-base text-roxo-400 hover:bg-roxo-50"
                        >
                          🗑
                        </ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
