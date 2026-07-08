import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo";

// Abre um anexo: checa a sessão, gera um signed URL temporário do bucket
// privado e redireciona. O middleware já barra acesso sem login.
//
// Por padrão o arquivo é servido inline (visualizar no navegador — PDFs e
// imagens abrem numa aba). Com ?dl=1 força o download (Content-Disposition:
// attachment). Servir inline é seguro porque o upload só aceita uma allowlist
// de MIME (PDF, imagem, doc, texto) — sem HTML/SVG/scripts, então não há
// conteúdo ativo pra ser executado a partir do anexo.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const forcarDownload = request.nextUrl.searchParams.get("dl") === "1";

  if (isDemo()) {
    return NextResponse.json(
      { error: "Download indisponível no modo demonstração" },
      { status: 200 },
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: arq } = await supabase
    .from("arquivos")
    .select("storage_path, file_name")
    .eq("id", id)
    .single<{ storage_path: string; file_name: string | null }>();

  if (!arq) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 },
    );
  }

  // download: true/nome → Content-Disposition: attachment (baixa). Sem a opção,
  // o Storage serve inline com o Content-Type original (visualiza no navegador).
  const { data: signed, error } = await supabase.storage
    .from("arquivos")
    .createSignedUrl(
      arq.storage_path,
      60,
      forcarDownload ? { download: arq.file_name ?? true } : undefined,
    );

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
