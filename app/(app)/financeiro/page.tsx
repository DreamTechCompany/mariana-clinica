import Link from "next/link";
import { formatMoney, formatDate, formatMonthLabel, currentMonth, today } from "@/lib/format";
import { pagamentosDoMes, pacientesParaSelect } from "@/lib/data";
import { createLancamento, deleteLancamento } from "./actions";
import { ConfirmButton } from "../confirm-button";
import { card, input, label, btnPrimary, badge } from "@/lib/ui";

// Primeiro dia do mês seguinte a "YYYY-MM".
function nextMonthFirst(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo, 1); // mês 0-based: mo já é o próximo
  return d.toISOString().slice(0, 10);
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const mes = sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : currentMonth();

  const inicio = `${mes}-01`;
  const fim = nextMonthFirst(mes);

  const [rows, pacientes] = await Promise.all([
    pagamentosDoMes(mes, inicio, fim),
    pacientesParaSelect(false),
  ]);
  const receitas = rows
    .filter((r) => r.tipo === "receita")
    .reduce((s, r) => s + Number(r.valor), 0);
  const despesas = rows
    .filter((r) => r.tipo === "despesa")
    .reduce((s, r) => s + Number(r.valor), 0);
  const aReceber = rows
    .filter((r) => r.tipo === "receita" && !r.pago)
    .reduce((s, r) => s + Number(r.valor), 0);
  const saldo = receitas - despesas;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-roxo-800">
          Financeiro
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/financeiro?m=${shiftMonth(mes, -1)}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            ←
          </Link>
          <span className="min-w-40 text-center text-sm font-medium text-roxo-700">
            {formatMonthLabel(mes)}
          </span>
          <Link
            href={`/financeiro?m=${shiftMonth(mes, 1)}`}
            className="rounded-lg border border-roxo-200 px-3 py-1.5 text-sm text-roxo-600 hover:bg-roxo-50"
          >
            →
          </Link>
        </div>
      </div>

      {sp.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {sp.error}
        </p>
      )}

      {/* Balancete do mês */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">Receitas</p>
          <p className="mt-1 font-heading text-2xl font-bold text-green-600">
            {formatMoney(receitas)}
          </p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">Despesas</p>
          <p className="mt-1 font-heading text-2xl font-bold text-red-500">
            {formatMoney(despesas)}
          </p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">Saldo</p>
          <p
            className={`mt-1 font-heading text-2xl font-bold ${
              saldo >= 0 ? "text-roxo-700" : "text-red-500"
            }`}
          >
            {formatMoney(saldo)}
          </p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-wide text-roxo-400">A receber</p>
          <p className="mt-1 font-heading text-2xl font-bold text-dourado-500">
            {formatMoney(aReceber)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lançamentos do mês */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-roxo-100 bg-white shadow-sm">
            {rows.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-roxo-400">
                Nenhum lançamento neste mês.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-roxo-50 text-left text-xs uppercase tracking-wide text-roxo-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Data</th>
                    <th className="px-5 py-3 font-semibold">Descrição</th>
                    <th className="px-5 py-3 text-right font-semibold">Valor</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-roxo-50">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-roxo-50/50">
                      <td className="px-5 py-3 text-roxo-500">{formatDate(r.data)}</td>
                      <td className="px-5 py-3">
                        <span className="text-roxo-800">
                          {r.descricao ?? (r.pacientes?.nome ? `Sessão · ${r.pacientes.nome}` : "Lançamento")}
                        </span>
                        {r.pacientes?.nome && r.descricao && (
                          <span className="ml-2 text-xs text-roxo-400">{r.pacientes.nome}</span>
                        )}
                        {!r.pago && (
                          <span className={`${badge} ml-2 bg-dourado-200 text-dourado-600`}>
                            pendente
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${
                          r.tipo === "receita" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {r.tipo === "receita" ? "+" : "−"} {formatMoney(Number(r.valor))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <form action={deleteLancamento.bind(null, r.id, mes)}>
                          <ConfirmButton
                            message="Excluir este lançamento?"
                            className="text-xs text-red-500 hover:underline"
                          >
                            Excluir
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Novo lançamento */}
        <div className={card}>
          <h2 className="font-heading text-lg font-semibold text-roxo-700">
            Novo lançamento
          </h2>
          <form action={createLancamento} className="mt-4 space-y-3">
            <div>
              <label className={label} htmlFor="tipo">
                Tipo
              </label>
              <select id="tipo" name="tipo" defaultValue="receita" className={input}>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="valor">
                Valor (R$)
              </label>
              <input
                id="valor"
                name="valor"
                inputMode="decimal"
                placeholder="200,00"
                required
                className={input}
              />
            </div>
            <div>
              <label className={label} htmlFor="descricao">
                Descrição
              </label>
              <input id="descricao" name="descricao" placeholder="Ex: aluguel, sessão…" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="paciente_id">
                Paciente (opcional)
              </label>
              <select id="paciente_id" name="paciente_id" defaultValue="" className={input}>
                <option value="">—</option>
                {(pacientes ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={label} htmlFor="metodo">
                  Forma
                </label>
                <input id="metodo" name="metodo" placeholder="Pix, dinheiro…" className={input} />
              </div>
              <div className="flex-1">
                <label className={label} htmlFor="data">
                  Data
                </label>
                <input id="data" name="data" type="date" defaultValue={today()} className={input} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-roxo-700">
              <input type="checkbox" name="pago" defaultChecked className="h-4 w-4 rounded" />
              Já pago
            </label>
            <button type="submit" className={`${btnPrimary} w-full`}>
              Lançar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
