import Link from "next/link";
import { signup } from "../login/actions";
import { Brandmark } from "../brandmark";
import { input, label, btnGold } from "@/lib/ui";

export default async function CadastrarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="bg-marca flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Brandmark size={64} />
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-wide text-white">
            Mariana Consentino
          </h1>
          <p className="text-sm text-roxo-100">Criar acesso ao consultório</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-7 shadow-xl">
          <form action={signup} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div>
              <label className={label} htmlFor="full_name">
                Nome
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                className={input}
              />
            </div>
            <div>
              <label className={label} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={input}
              />
            </div>
            <div>
              <label className={label} htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={input}
              />
              <p className="mt-1 text-xs text-roxo-300">Mínimo 6 caracteres.</p>
            </div>
            <button type="submit" className={`${btnGold} w-full`}>
              Criar conta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-roxo-400">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-roxo-600 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
