import Link from "next/link";
import type { Paciente } from "@/lib/types";
import { input, label, btnPrimary, btnOutline } from "@/lib/ui";

type Props = {
  action: (formData: FormData) => void;
  paciente?: Paciente;
  error?: string;
  cancelHref: string;
};

export function PacienteForm({ action, paciente, error, cancelHref }: Props) {
  const p = paciente;

  return (
    <form action={action} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="nome">
            Nome completo *
          </label>
          <input id="nome" name="nome" required defaultValue={p?.nome ?? ""} className={input} />
        </div>

        <div>
          <label className={label} htmlFor="data_nascimento">
            Data de nascimento
          </label>
          <input
            id="data_nascimento"
            name="data_nascimento"
            type="date"
            defaultValue={p?.data_nascimento ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="telefone">
            Telefone
          </label>
          <input id="telefone" name="telefone" defaultValue={p?.telefone ?? ""} className={input} />
        </div>

        <div>
          <label className={label} htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" defaultValue={p?.email ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="profissao">
            Profissão
          </label>
          <input id="profissao" name="profissao" defaultValue={p?.profissao ?? ""} className={input} />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="endereco">
            Endereço
          </label>
          <input id="endereco" name="endereco" defaultValue={p?.endereco ?? ""} className={input} />
        </div>

        <div>
          <label className={label} htmlFor="contato_emergencia">
            Contato de emergência
          </label>
          <input
            id="contato_emergencia"
            name="contato_emergencia"
            defaultValue={p?.contato_emergencia ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="valor_sessao">
            Valor da sessão (R$)
          </label>
          <input
            id="valor_sessao"
            name="valor_sessao"
            inputMode="decimal"
            placeholder="200,00"
            defaultValue={p?.valor_sessao != null ? String(p.valor_sessao).replace(".", ",") : ""}
            className={input}
          />
        </div>

        <div>
          <label className={label} htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={p?.status ?? "ativo"} className={input}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </fieldset>

      <div>
        <label className={label} htmlFor="queixa">
          Queixa / motivo principal
        </label>
        <textarea
          id="queixa"
          name="queixa"
          rows={2}
          defaultValue={p?.queixa ?? ""}
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="anamnese">
          Anamnese / ficha clínica
        </label>
        <textarea
          id="anamnese"
          name="anamnese"
          rows={10}
          placeholder="História clínica, histórico familiar, hipóteses, plano terapêutico…"
          defaultValue={p?.anamnese ?? ""}
          className={input}
        />
        <p className="mt-1 text-xs text-roxo-300">
          Para anexar exames ou documentos, use a área de arquivos na ficha do paciente.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="submit" className={btnPrimary}>
          Salvar
        </button>
        <Link href={cancelHref} className={btnOutline}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
