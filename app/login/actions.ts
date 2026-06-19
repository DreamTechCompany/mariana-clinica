"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
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

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (password.length < 6) {
    redirect(
      "/cadastrar?error=" +
        encodeURIComponent("A senha precisa ter ao menos 6 caracteres"),
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    const message =
      error.message === "User already registered"
        ? "Já existe uma conta com esse e-mail"
        : error.message;
    redirect("/cadastrar?error=" + encodeURIComponent(message));
  }

  // Se o projeto exige confirmação de e-mail, não há sessão ainda.
  if (!data.session) {
    redirect(
      "/login?message=" +
        encodeURIComponent(
          "Conta criada. Confirme o e-mail antes de entrar (ou desative a confirmação no painel do Supabase).",
        ),
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
