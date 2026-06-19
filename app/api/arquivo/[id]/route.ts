import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Baixa um anexo: checa a sessão, gera um signed URL temporário do bucket
// privado e redireciona. O middleware já barra acesso sem login.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: arq } = await supabase
    .from("arquivos")
    .select("storage_path")
    .eq("id", id)
    .single<{ storage_path: string }>();

  if (!arq) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 },
    );
  }

  const { data: signed, error } = await supabase.storage
    .from("arquivos")
    .createSignedUrl(arq.storage_path, 60);

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
