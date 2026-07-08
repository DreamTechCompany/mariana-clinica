// Tipos do domínio — espelham as tabelas do Supabase (supabase/migrations).

export type PacienteStatus = "ativo" | "inativo" | "alta";

export type Paciente = {
  id: string;
  nome: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  profissao: string | null;
  contato_emergencia: string | null;
  primeira_sessao: string | null; // date — início do acompanhamento
  queixa: string | null;
  anamnese: string | null;
  valor_sessao: number | null;
  status: PacienteStatus;
  created_at: string;
  updated_at: string;
};

export type AgendamentoStatus =
  | "agendado"
  | "realizado"
  | "faltou"
  | "cancelado";

export type Agendamento = {
  id: string;
  paciente_id: string;
  inicio: string; // timestamptz
  duracao_min: number;
  status: AgendamentoStatus;
  observacao: string | null;
  created_at: string;
  updated_at: string;
};

export type Sessao = {
  id: string;
  paciente_id: string;
  agendamento_id: string | null;
  data: string; // date
  resumo: string | null;
  created_at: string;
  updated_at: string;
};

export type ArquivoCategoria = "anamnese" | "sessao" | "outro";

export type Arquivo = {
  id: string;
  paciente_id: string;
  sessao_id: string | null;
  categoria: ArquivoCategoria;
  storage_path: string;
  file_name: string | null;
  uploaded_at: string;
};

export type LancamentoTipo = "receita" | "despesa";

export type Pagamento = {
  id: string;
  paciente_id: string | null;
  agendamento_id: string | null;
  descricao: string | null;
  valor: number;
  tipo: LancamentoTipo;
  pago: boolean;
  metodo: string | null;
  data: string; // date
  created_at: string;
};

export const STATUS_PACIENTE_LABEL: Record<PacienteStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  alta: "Alta",
};

export const STATUS_AGENDAMENTO_LABEL: Record<AgendamentoStatus, string> = {
  agendado: "Agendado",
  realizado: "Compareceu",
  faltou: "Faltou",
  cancelado: "Cancelado",
};
