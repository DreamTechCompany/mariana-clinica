import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";
import { logout } from "@/app/login/actions";
import { Brandmark } from "../brandmark";
import { NavLink } from "./nav-link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemo();
  let email = "Demonstração";

  if (!demo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    email = user.email ?? "";
  }

  return (
    <div className="min-h-screen">
      {demo && (
        <div className="bg-dourado-400 px-6 py-1.5 text-center text-xs font-semibold text-roxo-900">
          Modo demonstração · dados fictícios — as alterações não são salvas
        </div>
      )}
      <header className="bg-marca text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Brandmark size={36} />
            <span className="font-heading text-lg font-bold tracking-wide">
              Consultório MC
            </span>
          </Link>
          {/* No celular vai pra direita da 1ª linha; no desktop fica no fim */}
          <div className="order-2 ml-auto flex items-center gap-4 sm:order-3">
            <span className="hidden text-sm text-roxo-100 sm:inline">
              {email}
            </span>
            <form action={logout}>
              <button className="text-sm text-roxo-100 hover:text-white">
                Sair
              </button>
            </form>
          </div>
          {/* No celular quebra pra 2ª linha e rola na horizontal; no desktop fica inline */}
          <nav className="order-3 -mx-4 flex w-full items-center gap-1 overflow-x-auto px-4 pb-0.5 sm:order-2 sm:mx-0 sm:w-auto sm:px-0 sm:pb-0">
            <NavLink href="/">Início</NavLink>
            <NavLink href="/agenda">Agenda</NavLink>
            <NavLink href="/pacientes">Pacientes</NavLink>
            <NavLink href="/financeiro">Financeiro</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
