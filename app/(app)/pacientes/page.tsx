import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Paciente } from "@/lib/types";
import { STATUS_PACIENTE_LABEL } from "@/lib/types";
import { idade, formatMoney } from "@/lib/format";
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
  const supabase = await createClient();

  let query = supabase
    .from("pacientes")
    .select("*")
    .order("nome", { ascending: true });

  if (q && q.trim()) {
    query = query.ilike("nome", `%${q.trim()}%`);
  }

  const { data: pacientes } = await query.returns<Paciente[]>();

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

      <div className="mt-5 overflow-hidden rounded-2xl border border-roxo-100 bg-white shadow-sm">
        {!pacientes || pacientes.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-roxo-400">
            {q ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado ainda."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-roxo-50 text-left text-xs uppercase tracking-wide text-roxo-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Nome</th>
                <th className="px-6 py-3 font-semibold">Idade</th>
                <th className="px-6 py-3 font-semibold">Telefone</th>
                <th className="px-6 py-3 font-semibold">Sessão</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roxo-50">
              {pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-roxo-50/50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="font-medium text-roxo-700 hover:underline"
                    >
                      {p.nome}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-roxo-500">
                    {idade(p.data_nascimento) ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-roxo-500">{p.telefone ?? "—"}</td>
                  <td className="px-6 py-3 text-roxo-500">
                    {p.valor_sessao != null ? formatMoney(p.valor_sessao) : "—"}
                  </td>
                  <td className="px-6 py-3">
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
