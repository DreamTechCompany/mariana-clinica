import Link from "next/link";
import { notFound } from "next/navigation";
import { Brandmark } from "@/app/brandmark";
import { STATUS_PACIENTE_LABEL } from "@/lib/types";
import { getPaciente, listarSessoes, listarArquivos } from "@/lib/data";
import { formatDate, formatDateTime, idade, formatMoney } from "@/lib/format";
import { btnOutline } from "@/lib/ui";
import { PrintButton } from "./print-button";

const categoriaLabel: Record<string, string> = {
  anamnese: "Anamnese",
  sessao: "Sessão",
  outro: "Outro",
};

function Campo({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-roxo-400">{rotulo}</p>
      <p className="mt-0.5 text-sm text-roxo-900">{valor || "—"}</p>
    </div>
  );
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  const [sessoes, arquivos] = await Promise.all([
    listarSessoes(id),
    listarArquivos(id),
  ]);

  const geradoEm = formatDateTime(new Date().toISOString());

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de ações — não sai no PDF */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/pacientes/${id}`} className="text-sm text-roxo-500 hover:underline">
          ← Voltar ao paciente
        </Link>
        <div className="flex gap-2">
          <Link href={`/pacientes/${id}`} className={btnOutline}>
            Cancelar
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Documento */}
      <article className="rounded-2xl border border-roxo-100 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Cabeçalho do documento */}
        <header className="quebra-evitar flex items-center gap-4 border-b border-roxo-100 pb-5">
          <Brandmark size={52} />
          <div className="flex-1">
            <p className="font-heading text-lg font-bold text-roxo-800">
              Consultório MC · Mariana Consentino
            </p>
            <p className="text-xs text-roxo-400">Psicóloga Clínica</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-base font-semibold text-roxo-700">
              Prontuário psicológico
            </p>
            <p className="text-[10px] text-roxo-400">Gerado em {geradoEm}</p>
          </div>
        </header>

        {/* Identificação */}
        <section className="quebra-evitar mt-6">
          <div className="flex items-baseline justify-between">
            <h1 className="font-heading text-xl font-bold text-roxo-900">
              {paciente.nome}
            </h1>
            <span className="text-xs font-semibold text-roxo-500">
              {STATUS_PACIENTE_LABEL[paciente.status]}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Campo
              rotulo="Nascimento"
              valor={
                paciente.data_nascimento
                  ? `${formatDate(paciente.data_nascimento)}${
                      idade(paciente.data_nascimento) != null
                        ? ` (${idade(paciente.data_nascimento)} anos)`
                        : ""
                    }`
                  : null
              }
            />
            <Campo
              rotulo="Primeira sessão"
              valor={paciente.primeira_sessao ? formatDate(paciente.primeira_sessao) : null}
            />
            <Campo rotulo="Telefone" valor={paciente.telefone} />
            <Campo rotulo="E-mail" valor={paciente.email} />
            <Campo rotulo="Profissão" valor={paciente.profissao} />
            <Campo rotulo="Endereço" valor={paciente.endereco} />
            <Campo rotulo="Contato de emergência" valor={paciente.contato_emergencia} />
            <Campo
              rotulo="Valor da sessão"
              valor={
                paciente.valor_sessao != null
                  ? formatMoney(paciente.valor_sessao)
                  : null
              }
            />
          </dl>
        </section>

        {/* Anamnese */}
        <section className="quebra-evitar mt-8">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-roxo-600">
            Anamnese
          </h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-roxo-400">
                Queixa principal
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-roxo-900">
                {paciente.queixa || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-roxo-400">
                Histórico
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-roxo-900">
                {paciente.anamnese || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Sessões / evolução */}
        <section className="mt-8">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-roxo-600">
            Evolução · {sessoes.length}{" "}
            {sessoes.length === 1 ? "sessão" : "sessões"}
          </h2>
          {sessoes.length === 0 ? (
            <p className="mt-3 text-sm text-roxo-400">Nenhuma sessão registrada.</p>
          ) : (
            <ol className="mt-3 space-y-4">
              {sessoes.map((s) => (
                <li
                  key={s.id}
                  className="quebra-evitar border-l-2 border-roxo-200 pl-4"
                >
                  <p className="text-sm font-semibold text-roxo-700">
                    {formatDate(s.data)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-roxo-900">
                    {s.resumo || "—"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Anexos — referência (os arquivos em si não entram no PDF) */}
        {arquivos.length > 0 && (
          <section className="quebra-evitar mt-8">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-roxo-600">
              Arquivos anexados
            </h2>
            <ul className="mt-3 space-y-1">
              {arquivos.map((a) => (
                <li key={a.id} className="text-sm text-roxo-900">
                  {a.file_name ?? "arquivo"}
                  <span className="ml-2 text-xs text-roxo-400">
                    {categoriaLabel[a.categoria]} · {formatDate(a.uploaded_at)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rodapé — sigilo */}
        <footer className="mt-10 border-t border-roxo-100 pt-4">
          <p className="text-[10px] leading-relaxed text-roxo-400">
            Documento sigiloso. Contém dados sensíveis de saúde protegidos pela
            LGPD (Lei 13.709/2018) e pelo sigilo profissional do psicólogo
            (Código de Ética do Psicólogo). O acesso, a guarda e o
            compartilhamento são restritos à profissional responsável.
            Gerado em {geradoEm} pelo Consultório MC.
          </p>
        </footer>
      </article>
    </div>
  );
}
