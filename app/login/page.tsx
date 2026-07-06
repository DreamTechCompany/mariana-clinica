import { login } from "./actions";
import { Brandmark } from "../brandmark";
import { input, label, btnGold } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="bg-marca flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Brandmark size={64} />
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-wide text-white">
            Mariana Consentino
          </h1>
          <p className="text-sm text-roxo-100">Psicóloga Clínica · Consultório</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-7 shadow-xl">
          {message && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </p>
          )}

          <form action={login} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div>
              <label className={label} htmlFor="usuario">
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                autoComplete="username"
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
                autoComplete="current-password"
                className={input}
              />
            </div>
            <button type="submit" className={`${btnGold} w-full`}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
