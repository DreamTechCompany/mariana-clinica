"use client";

import { useState } from "react";
import { input, label } from "@/lib/ui";

// Controles de recorrência do "Novo horário". Por padrão marca só a data
// escolhida; em "Toda semana" revela o campo "Repetir até" e o server cria um
// agendamento por semana, no mesmo horário, até a data limite.
export function RecorrenciaFields({ atePadrao }: { atePadrao: string }) {
  const [semanal, setSemanal] = useState(false);

  return (
    <>
      <div>
        <label className={label} htmlFor="repetir">
          Repetição
        </label>
        <select
          id="repetir"
          name="repetir"
          className={input}
          defaultValue="nao"
          onChange={(e) => setSemanal(e.target.value === "semanal")}
        >
          <option value="nao">Somente esta data</option>
          <option value="semanal">Toda semana neste horário</option>
        </select>
      </div>
      {semanal && (
        <div>
          <label className={label} htmlFor="repetir_ate">
            Repetir até
          </label>
          <input
            id="repetir_ate"
            name="repetir_ate"
            type="date"
            defaultValue={atePadrao}
            className={input}
          />
          <p className="mt-1 text-xs text-roxo-400">
            Cria um horário por semana até esta data.
          </p>
        </div>
      )}
    </>
  );
}
