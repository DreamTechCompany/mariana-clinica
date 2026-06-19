// Helpers de formatação — pt-BR, fuso de São Paulo.

const TZ = "America/Sao_Paulo";

export function formatMoney(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  // Datas puras (YYYY-MM-DD) não têm fuso: monta no horário local do meio-dia
  // pra evitar voltar um dia.
  const d = iso.length === 10 ? new Date(iso + "T12:00:00") : new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: TZ });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWeekday(iso: string): string {
  const d = iso.length === 10 ? new Date(iso + "T12:00:00") : new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: TZ, weekday: "long" });
}

// Idade a partir da data de nascimento (YYYY-MM-DD).
export function idade(nascimento: string | null): number | null {
  if (!nascimento) return null;
  const nasc = new Date(nascimento + "T12:00:00");
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return anos;
}

// "2026-06" -> "Junho de 2026"
export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Mês atual no formato YYYY-MM (fuso SP).
export function currentMonth(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  });
  return fmt.format(new Date()); // "2026-06"
}

// Data de hoje no formato YYYY-MM-DD (fuso SP).
export function today(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // "2026-06-18"
}
