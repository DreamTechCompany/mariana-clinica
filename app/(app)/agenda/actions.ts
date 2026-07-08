"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";
import type { AgendamentoStatus } from "@/lib/types";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

// Soma dias a uma data YYYY-MM-DD sem cair em fuso (meio-dia local).
function shiftDay(d: string, delta: number): string {
  const dt = new Date(d + "T12:00:00");
  dt.setDate(dt.getDate() + delta);
  return dt.toISOString().slice(0, 10);
}

// Datas de um agendamento semanal: da data inicial até "ate" (inclusive),
// de 7 em 7 dias. Teto de 104 semanas (~2 anos) por segurança.
function datasSemanais(inicio: string, ate: string): string[] {
  const datas: string[] = [];
  let d = inicio;
  for (let i = 0; i < 104 && d <= ate; i++) {
    datas.push(d);
    d = shiftDay(d, 7);
  }
  return datas;
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
  const semanal = str(formData.get("repetir")) === "semanal";
  const repetirAte = str(formData.get("repetir_ate")); // YYYY-MM-DD
  const view = viewSuffix(str(formData.get("view")));
  const back = (data ? `/agenda?d=${data}` : "/agenda?d=") + view;

  if (!paciente_id || !data || !hora) {
    redirect(`${back}&error=` + encodeURIComponent("Paciente, data e hora são obrigatórios"));
  }

  if (semanal && (!repetirAte || repetirAte < data)) {
    redirect(`${back}&error=` + encodeURIComponent("Informe uma data final igual ou posterior para a repetição"));
  }

  // Uma data (só esta) ou várias (uma por semana, mesmo horário, até o limite).
  // Timestamp no fuso de São Paulo (-03:00, sem horário de verão atual).
  const datas = semanal ? datasSemanais(data, repetirAte) : [data];
  const linhas = datas.map((dia) => ({
    paciente_id,
    inicio: `${dia}T${hora}:00-03:00`,
    duracao_min,
    observacao,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("agendamentos").insert(linhas);

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
