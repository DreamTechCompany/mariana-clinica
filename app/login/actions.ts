"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";

export async function login(formData: FormData) {
  if (isDemo()) redirect("/");
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "E-mail ou senha inválidos"
        : error.message;
    redirect("/login?error=" + encodeURIComponent(message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Não há cadastro público: dados de saúde (LGPD). As contas (psicóloga /
// secretária) são criadas manualmente no painel do Supabase
// (Authentication > Users). Mantenha a opção "Allow new users to sign up"
// DESLIGADA no Supabase para fechar o cadastro também no nível do banco.

export async function logout() {
  if (isDemo()) redirect("/login");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
