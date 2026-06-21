import Link from "next/link";
import { notFound } from "next/navigation";
import type { Arquivo } from "@/lib/types";
import { STATUS_PACIENTE_LABEL, STATUS_AGENDAMENTO_LABEL } from "@/lib/types";
import {
  getPaciente,
  listarSessoes,
  listarArquivos,
  proximosAgendamentos,
} from "@/lib/data";
import { formatDate, formatDateTime, idade, formatMoney, today } from "@/lib/format";
import {
  deletePaciente,
  createSessao,
  deleteSessao,
  addArquivo,
  deleteArquivo,
} from "../actions";
import { ConfirmButton } from "../../confirm-button";
import {
  card,
  input,
  label,
  badge,
  btnPrimary,
  btnOutline,
  btnGold,
  btnGhostDanger,
} from "@/lib/ui";

const statusStyle: Record<string, string> = {
  ativo: "bg-green-100 text-green-700",
  inativo: "bg-roxo-100 text-roxo-600",
  alta: "bg-dourado-200 text-dourado-600",
};

const categoriaLabel: Record<string, string> = {
  anamnese: "Anamnese",
  sessao: "Sessão",
  outro: "Outro",
};

function DadoLinha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-roxo-400">{rotulo}</dt>
      <dd className="mt-0.5 text-sm text-roxo-800">{valor || "—"}</dd>
    </div>
  );
}

export default async function PacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  const [sessoes, arquivos, agendamentos] = await Promise.all([
    listarSessoes(id),
    listarArquivos(id),
    proximosAgendamentos(id, 5),
  ]);

  const anexosPorSessao = new Map<string, Arquivo[]>();
  for (const a of arquivos ?? []) {
    if (a.sessao_id) {
      const list = anexosPorSessao.get(a.sessao_id) ?? [];
      list.push(a);
      anexosPorSessao.set(a.sessao_id, list);
    }
  }
  const arquivosGerais = (arquivos ?? []).filter((a) => !a.sessao_id);

  return (
    <div className="space-y-6">
      <Link href="/pacientes" className="text-sm text-roxo-500 hover:underline">
        ← Pacientes
      </Link>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-roxo-800">
              {paciente.nome}
            </h1>
            <span className={`${badge} ${statusStyle[paciente.status]}`}>
              {STATUS_PACIENTE_LABEL[paciente.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-roxo-400">
            {idade(paciente.data_nascimento) != null
              ? `${idade(paciente.data_nascimento)} anos · `
              : ""}
            {paciente.telefone ?? "sem telefone"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/pacientes/${id}/prontuario`} className={btnGold}>
            Baixar PDF
          </Link>
          <Link href={`/pacientes/${id}/editar`} className={btnOutline}>
            Editar
          </Link>
          <form action={deletePaciente.bind(null, id)}>
            <ConfirmButton
              className={btnGhostDanger}
              message="Excluir este paciente apaga ficha, sessões e anexos. Tem certeza?"
            >
              Excluir
            </ConfirmButton>
          </form>
        </div>
      </div>

      {/* Dados cadastrais */}
      <section className={card}>
        <h2 className="font-heading text-lg font-semibold text-roxo-700">
          Dados cadastrais
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <DadoLinha rotulo="Nascimento" valor={formatDate(paciente.data_nascimento)} />
          <DadoLinha rotulo="E-mail" valor={paciente.email} />
          <DadoLinha rotulo="Profissão" valor={paciente.profissao} />
          <DadoLinha rotulo="Endereço" valor={paciente.endereco} />
          <DadoLinha rotulo="Emergência" valor={paciente.contato_emergencia} />
          <DadoLinha
            rotulo="Valor da sessão"
            valor={paciente.valor_sessao != null ? formatMoney(paciente.valor_sessao) : null}
          />
        </dl>
      </section>

      {/* Próximos agendamentos */}
      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-roxo-700">
            Próximos agendamentos
          </h2>
          <Link href="/agenda" className="text-sm text-roxo-500 hover:underline">
            Ver agenda
          </Link>
        </div>
        {!agendamentos || agendamentos.length === 0 ? (
          <p className="mt-3 text-sm text-roxo-400">Nenhum horário marcado.</p>
        ) : (
          <ul className="mt-3 divide-y divide-roxo-50">
            {agendamentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-roxo-800">{formatDateTime(a.inicio)}</span>
                <span className={`${badge} bg-roxo-100 text-roxo-600`}>
                  {STATUS_AGENDAMENTO_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Queixa + Anamnese */}
      <section className={card}>
        <h2 className="font-heading text-lg font-semibold text-roxo-700">
          Anamnese
        </h2>
        {paciente.queixa && (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wide text-roxo-400">
              Queixa principal
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-roxo-800">
              {paciente.queixa}
            </p>
          </div>
        )}
        <div className="mt-4">
          {paciente.anamnese ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-roxo-800">
              {paciente.anamnese}
            </p>
          ) : (
            <p className="text-sm text-roxo-400">
              Anamnese ainda não preenchida.{" "}
              <Link href={`/pacientes/${id}/editar`} className="text-roxo-600 hover:underline">
                Preencher
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Arquivos / anexos */}
      <section id="arquivos" className={card}>
        <h2 className="font-heading text-lg font-semibold text-roxo-700">
          Arquivos
        </h2>

        <form
          action={addArquivo.bind(null, id)}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-roxo-50 p-4"
        >
          <div>
            <label className={label} htmlFor="categoria">
              Tipo
            </label>
            <select id="categoria" name="categoria" defaultValue="anamnese" className={input}>
              <option value="anamnese">Anamnese</option>
              <option value="sessao">Sessão</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={label} htmlFor="file">
              Arquivo
            </label>
            <input id="file" name="file" type="file" required className={input} />
          </div>
          <button type="submit" className={btnGold}>
            Anexar
          </button>
        </form>

        {arquivosGerais.length === 0 ? (
          <p className="mt-4 text-sm text-roxo-400">Nenhum arquivo anexado.</p>
        ) : (
          <ul className="mt-4 divide-y divide-roxo-50">
            {arquivosGerais.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <a
                    href={`/api/arquivo/${a.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-medium text-roxo-700 hover:underline"
                  >
                    {a.file_name ?? "arquivo"}
                  </a>
                  <span className="ml-2 text-xs text-roxo-400">
                    {categoriaLabel[a.categoria]} · {formatDate(a.uploaded_at)}
                  </span>
                </div>
                <form action={deleteArquivo.bind(null, id, a.id)}>
                  <ConfirmButton
                    className="text-xs text-red-500 hover:underline"
                    message="Excluir este arquivo?"
                  >
                    Excluir
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sessões / evolução */}
      <section id="sessoes" className={card}>
        <h2 className="font-heading text-lg font-semibold text-roxo-700">
          Sessões e evolução
        </h2>

        <form
          action={createSessao.bind(null, id)}
          className="mt-4 space-y-3 rounded-xl bg-roxo-50 p-4"
        >
          <div className="flex flex-wrap gap-3">
            <div>
              <label className={label} htmlFor="data">
                Data
              </label>
              <input id="data" name="data" type="date" defaultValue={today()} className={input} />
            </div>
            <div className="flex-1">
              <label className={label} htmlFor="file-sessao">
                Anexo (opcional)
              </label>
              <input id="file-sessao" name="file" type="file" className={input} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="resumo">
              Resumo da sessão
            </label>
            <textarea
              id="resumo"
              name="resumo"
              rows={5}
              placeholder="Como foi a sessão, evolução do caso, encaminhamentos…"
              className={input}
            />
          </div>
          <button type="submit" className={btnPrimary}>
            Registrar sessão
          </button>
        </form>

        {!sessoes || sessoes.length === 0 ? (
          <p className="mt-4 text-sm text-roxo-400">Nenhuma sessão registrada.</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {sessoes.map((s) => {
              const anexos = anexosPorSessao.get(s.id) ?? [];
              return (
                <li key={s.id} className="rounded-xl border border-roxo-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-roxo-700">{formatDate(s.data)}</p>
                    <form action={deleteSessao.bind(null, id, s.id)}>
                      <ConfirmButton
                        className="text-xs text-red-500 hover:underline"
                        message="Excluir esta sessão?"
                      >
                        Excluir
                      </ConfirmButton>
                    </form>
                  </div>
                  {s.resumo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-roxo-800">
                      {s.resumo}
                    </p>
                  )}
                  {anexos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {anexos.map((a) => (
                        <a
                          key={a.id}
                          href={`/api/arquivo/${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-roxo-50 px-3 py-1 text-xs font-medium text-roxo-600 hover:bg-roxo-100"
                        >
                          📎 {a.file_name ?? "anexo"}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
