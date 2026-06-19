import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePaciente } from "../../actions";
import { PacienteForm } from "../../paciente-form";
import type { Paciente } from "@/lib/types";
import { card } from "@/lib/ui";

export default async function EditarPacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single<Paciente>();

  if (!paciente) notFound();

  const action = updatePaciente.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/pacientes/${id}`}
        className="text-sm text-roxo-500 hover:underline"
      >
        ← {paciente.nome}
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-bold text-roxo-800">
        Editar paciente
      </h1>

      <div className={`${card} mt-6`}>
        <PacienteForm
          action={action}
          paciente={paciente}
          error={error}
          cancelHref={`/pacientes/${id}`}
        />
      </div>
    </div>
  );
}
