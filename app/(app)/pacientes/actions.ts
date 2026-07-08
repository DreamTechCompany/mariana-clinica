"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

function num(v: FormDataEntryValue | null): number | null {
  const s = str(v).replace(/\./g, "").replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type PacienteInput = {
  nome: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  profissao: string | null;
  contato_emergencia: string | null;
  primeira_sessao: string | null;
  queixa: string | null;
  anamnese: string | null;
  valor_sessao: number | null;
  status: string;
};

function readForm(formData: FormData): PacienteInput {
  return {
    nome: str(formData.get("nome")),
    data_nascimento: nullable(formData.get("data_nascimento")),
    telefone: nullable(formData.get("telefone")),
    email: nullable(formData.get("email")),
    endereco: nullable(formData.get("endereco")),
    profissao: nullable(formData.get("profissao")),
    contato_emergencia: nullable(formData.get("contato_emergencia")),
    primeira_sessao: nullable(formData.get("primeira_sessao")),
    queixa: nullable(formData.get("queixa")),
    anamnese: nullable(formData.get("anamnese")),
    valor_sessao: num(formData.get("valor_sessao")),
    status: str(formData.get("status")) || "ativo",
  };
}

export async function createPaciente(formData: FormData) {
  if (isDemo()) redirect("/pacientes?demo=1");
  const input = readForm(formData);
  if (!input.nome) {
    redirect("/pacientes/novo?error=" + encodeURIComponent("Nome é obrigatório"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    redirect("/pacientes/novo?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/pacientes");
  redirect(`/pacientes/${data.id}`);
}

export async function updatePaciente(id: string, formData: FormData) {
  if (isDemo()) redirect(`/pacientes/${id}?demo=1`);
  const input = readForm(formData);
  if (!input.nome) {
    redirect(
      `/pacientes/${id}/editar?error=` +
        encodeURIComponent("Nome é obrigatório"),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pacientes").update(input).eq("id", id);

  if (error) {
    redirect(`/pacientes/${id}/editar?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  redirect(`/pacientes/${id}`);
}

export async function deletePaciente(id: string) {
  if (isDemo()) redirect("/pacientes?demo=1");
  const supabase = await createClient();
  const { error } = await supabase.from("pacientes").delete().eq("id", id);

  if (error) {
    redirect(`/pacientes/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

// ── Sessões (resumo/evolução do caso) ──────────────────────────────────────
export async function createSessao(pacienteId: string, formData: FormData) {
  const base = `/pacientes/${pacienteId}`;
  if (isDemo()) redirect(`${base}?demo=1`);
  const supabase = await createClient();

  const data = str(formData.get("data")) || undefined;
  const resumo = nullable(formData.get("resumo"));

  const { data: sessao, error } = await supabase
    .from("sessoes")
    .insert({ paciente_id: pacienteId, data, resumo })
    .select("id")
    .single();

  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error.message));
  }

  // Anexo opcional da sessão
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const up = await uploadArquivo(supabase, {
      pacienteId,
      sessaoId: sessao.id,
      categoria: "sessao",
      file,
    });
    if (up.error) {
      revalidatePath(base);
      redirect(
        `${base}?error=` +
          encodeURIComponent(`Sessão salva, mas o anexo falhou: ${up.error}`),
      );
    }
  }

  revalidatePath(base);
  redirect(`${base}#sessoes`);
}

export async function deleteSessao(pacienteId: string, sessaoId: string) {
  if (isDemo()) redirect(`/pacientes/${pacienteId}?demo=1`);
  const supabase = await createClient();
  await supabase.from("sessoes").delete().eq("id", sessaoId);
  revalidatePath(`/pacientes/${pacienteId}`);
  redirect(`/pacientes/${pacienteId}#sessoes`);
}

// ── Arquivos (anexos no Storage) ────────────────────────────────────────────
type UploadArgs = {
  pacienteId: string;
  sessaoId: string | null;
  categoria: "anamnese" | "sessao" | "outro";
  file: File;
};

// Anexos clínicos esperados: PDFs, imagens (exames/laudos) e documentos. Tipos
// executáveis (HTML, SVG, scripts) ficam de fora — além de não fazerem sentido
// aqui, evitam que um arquivo malicioso seja servido inline pelo Storage.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// Faz o upload pro bucket privado e registra na tabela arquivos.
// Recebe o client pra reaproveitar a sessão autenticada.
async function uploadArquivo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  { pacienteId, sessaoId, categoria, file }: UploadArgs,
) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Arquivo muito grande (máximo 15 MB)" };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      error: "Tipo de arquivo não permitido (use PDF, imagem ou documento)",
    };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${pacienteId}/${crypto.randomUUID()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("arquivos")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (upErr) return { error: upErr.message };

  const { error: insErr } = await supabase.from("arquivos").insert({
    paciente_id: pacienteId,
    sessao_id: sessaoId,
    categoria,
    storage_path: path,
    file_name: file.name,
  });

  return { error: insErr?.message };
}

export async function addArquivo(pacienteId: string, formData: FormData) {
  const base = `/pacientes/${pacienteId}`;
  if (isDemo()) redirect(`${base}?demo=1`);
  const supabase = await createClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione um arquivo"));
  }

  const categoria = str(formData.get("categoria"));
  const cat =
    categoria === "anamnese" || categoria === "sessao" ? categoria : "outro";

  const { error } = await uploadArquivo(supabase, {
    pacienteId,
    sessaoId: null,
    categoria: cat,
    file: file as File,
  });

  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error));
  }

  revalidatePath(base);
  redirect(`${base}#arquivos`);
}

export async function deleteArquivo(pacienteId: string, arquivoId: string) {
  if (isDemo()) redirect(`/pacientes/${pacienteId}?demo=1`);
  const supabase = await createClient();

  const { data: arq } = await supabase
    .from("arquivos")
    .select("storage_path")
    .eq("id", arquivoId)
    .single<{ storage_path: string }>();

  if (arq) {
    await supabase.storage.from("arquivos").remove([arq.storage_path]);
    await supabase.from("arquivos").delete().eq("id", arquivoId);
  }

  revalidatePath(`/pacientes/${pacienteId}`);
  redirect(`/pacientes/${pacienteId}#arquivos`);
}
