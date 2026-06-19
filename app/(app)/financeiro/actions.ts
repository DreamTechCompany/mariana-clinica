"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function money(v: FormDataEntryValue | null): number | null {
  const s = str(v).replace(/\./g, "").replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createLancamento(formData: FormData) {
  if (isDemo()) redirect("/financeiro?demo=1");
  const tipo = str(formData.get("tipo")) === "despesa" ? "despesa" : "receita";
  const valor = money(formData.get("valor"));
  const descricao = str(formData.get("descricao")) || null;
  const paciente_id = str(formData.get("paciente_id")) || null;
  const metodo = str(formData.get("metodo")) || null;
  const data = str(formData.get("data")) || undefined;
  const pago = str(formData.get("pago")) === "on";

  const mes = data ? data.slice(0, 7) : "";
  const back = mes ? `/financeiro?m=${mes}` : "/financeiro";

  if (valor == null || valor <= 0) {
    redirect(`${back}&error=` + encodeURIComponent("Informe um valor válido"));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos").insert({
    tipo,
    valor,
    descricao,
    paciente_id,
    metodo,
    data,
    pago,
  });

  if (error) {
    redirect(`${back}&error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/financeiro");
  redirect(back);
}

// Quita (ou reabre) um lançamento — usado pra dar baixa em pendências.
export async function setPago(id: string, pago: boolean, mes: string) {
  if (isDemo()) redirect(`/financeiro?m=${mes}&demo=1`);
  const supabase = await createClient();
  await supabase.from("pagamentos").update({ pago }).eq("id", id);
  revalidatePath("/financeiro");
  redirect(`/financeiro?m=${mes}`);
}

export async function deleteLancamento(id: string, mes: string) {
  if (isDemo()) redirect(`/financeiro?m=${mes}&demo=1`);
  const supabase = await createClient();
  await supabase.from("pagamentos").delete().eq("id", id);
  revalidatePath("/financeiro");
  redirect(`/financeiro?m=${mes}`);
}
