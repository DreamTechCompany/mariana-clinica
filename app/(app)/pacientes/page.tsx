import Link from "next/link";
import { STATUS_PACIENTE_LABEL } from "@/lib/types";
import { idade, formatMoney } from "@/lib/format";
import { listarPacientes } from "@/lib/data";
import { btnPrimary, badge, input } from "@/lib/ui";

const statusStyle: Record<string, string> = {
  ativo: "bg-green-100 text-green-700",
  inativo: "bg-roxo-100 text-roxo-600",
  alta: "bg-dourado-200 text-dourado-600",
};

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const pacientes = await listarPacientes(q);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-roxo-800">
          Pacientes
        </h1>
        <Link href="/pacientes/novo" className={btnPrimary}>
          + Novo paciente
        </Link>
      </div>

      <form className="mt-5 max-w-sm">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome…"
          className={input}
        />
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-roxo-100 bg-white shadow-sm">
        {!pacientes || pacientes.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-roxo-400">
            {q ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado ainda."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-roxo-50 text-left text-xs uppercase tracking-wide text-roxo-500">
              <tr>
                <th className="px-4 py-3 font-semibold sm:px-6">Nome</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">Idade</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Telefone</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">Sessão</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roxo-50">
              {pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-roxo-50/50">
                  <td className="px-4 py-3 sm:px-6">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="font-medium text-roxo-700 hover:underline"
                    >
                      {p.nome}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-roxo-500 sm:table-cell sm:px-6">
                    {idade(p.data_nascimento) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-roxo-500 sm:px-6">{p.telefone ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-roxo-500 sm:table-cell sm:px-6">
                    {p.valor_sessao != null ? formatMoney(p.valor_sessao) : "—"}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span className={`${badge} ${statusStyle[p.status]}`}>
                      {STATUS_PACIENTE_LABEL[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
