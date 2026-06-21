"use client";

import { btnPrimary } from "@/lib/ui";

// Aciona o diálogo de impressão do navegador. O usuário escolhe "Salvar como
// PDF" como destino — gera o arquivo do prontuário sem dependência externa.
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={btnPrimary}>
      Baixar PDF
    </button>
  );
}
