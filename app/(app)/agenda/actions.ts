"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";
import type { AgendamentoStatus } from "@/lib/types";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

// Sufixo &view=semana quando a tela estiver na visão de semana, pra não cair
// de volta na visão de dia depois de uma ação.
function viewSuffix(v: string): string {
  return v === "semana" ? "&view=semana" : "";
}

export async function createAgendamento(formData: FormData) {
  if (isDemo()) redirect("/agenda?demo=1");
  const paciente_id = str(formData.get("paciente_id"));
  const data = str(formData.get("data")); // YYYY-MM-DD
  const hora = str(formData.get("hora")); // HH:MM
  const duracao_min = Number(str(formData.get("duracao_min"))) || 50;
  const observacao = str(formData.get("observacao")) || null;
  const view = viewSuffix(str(formData.get("view")));
  const back = (data ? `/agenda?d=${data}` : "/agenda?d=") + view;

  if (!paciente_id || !data || !hora) {
    redirect(`${back}&error=` + encodeURIComponent("Paciente, data e hora são obrigatórios"));
  }

  // Monta o timestamp no fuso de São Paulo (-03:00, sem horário de verão atual).
  const inicio = `${data}T${hora}:00-03:00`;

  const supabase = await createClient();
  const { error } = await supabase.from("agendamentos").insert({
    paciente_id,
    inicio,
    duracao_min,
    observacao,
  });

  if (error) {
    redirect(`${back}&error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/agenda");
  redirect(back);
}

export async function setPresenca(
  id: string,
  status: AgendamentoStatus,
  dia: string,
  view = "dia",
) {
  if (isDemo()) redirect(`/agenda?d=${dia}&demo=1`);
  const supabase = await createClient();
  await supabase.from("agendamentos").update({ status }).eq("id", id);
  revalidatePath("/agenda");
  redirect(`/agenda?d=${dia}${viewSuffix(view)}`);
}

export async function deleteAgendamento(id: string, dia: string, view = "dia") {
  if (isDemo()) redirect(`/agenda?d=${dia}&demo=1`);
  const supabase = await createClient();
  await supabase.from("agendamentos").delete().eq("id", id);
  revalidatePath("/agenda");
  redirect(`/agenda?d=${dia}${viewSuffix(view)}`);
}
