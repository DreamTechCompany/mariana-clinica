"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";

// Login por usuário (não e-mail). O Supabase Auth é sempre e-mail por baixo,
// então mapeamos o usuário digitado para um e-mail sintético interno num
// domínio fixo (.local, não roteável). Ferramenta interna de um consultório;
// não há caixa de e-mail real nem recuperação por e-mail — reset é manual no
// painel do Supabase.
const AUTH_DOMAIN = "clinicamc.local";

export async function login(formData: FormData) {
  if (isDemo()) redirect("/");
  const supabase = await createClient();
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const email = `${usuario}@${AUTH_DOMAIN}`;
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "Usuário ou senha inválidos"
        : error.message;
    redirect("/login?error=" + encodeURIComponent(message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Não há cadastro público: dados de saúde (LGPD). As contas (psicóloga /
// secretária) são criadas manualmente no painel do Supabase
// (Authentication > Users), sempre com e-mail no formato
// `<usuario>@clinicamc.local` — é o usuário que a pessoa digita no login.
// Mantenha "Allow new users to sign up" DESLIGADA no Supabase para fechar o
// cadastro também no nível do banco.

export async function logout() {
  if (isDemo()) redirect("/login");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
