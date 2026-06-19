import Link from "next/link";
import { createPaciente } from "../actions";
import { PacienteForm } from "../paciente-form";
import { card } from "@/lib/ui";

export default async function NovoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pacientes" className="text-sm text-roxo-500 hover:underline">
        ← Pacientes
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-bold text-roxo-800">
        Novo paciente
      </h1>

      <div className={`${card} mt-6`}>
        <PacienteForm
          action={createPaciente}
          error={error}
          cancelHref="/pacientes"
        />
      </div>
    </div>
  );
}
