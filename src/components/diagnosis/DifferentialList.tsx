import { useEffect, useState } from "react";
import type { DifferentialHypothesis } from "@/lib/types";

/**
 * Hipóteses alternativas ranqueadas. Implementa P-003 e M-003.
 *
 * Existe para impedir a falsa certeza da hipótese única. Mostrar o que foi
 * considerado e descartado aumenta a confiança do usuário em vez de reduzir — a
 * referência é o Ada Health, registrada em `design/biblioteca-referencias.md`.
 */
export function DifferentialList({
  items,
  plain = [],
}: {
  items?: DifferentialHypothesis[];
  /**
   * Alternativas sem probabilidade — vindas de `otherPossibilities`, usadas quando o
   * diagnóstico não trouxe diferencial estruturado (cenário local, histórico antigo).
   *
   * Aparecem sem barra de propósito: inventar um número para elas seria pior que não
   * ter número nenhum. Mas some-las é pior ainda, porque aí a tela volta a mostrar
   * hipótese única, que é justamente o que P-003 proíbe.
   */
  plain?: string[];
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const ranked = items ?? [];

  if (ranked.length === 0 && plain.length === 0) return null;

  if (ranked.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
          Também pode ser
        </h3>
        <ul className="space-y-1.5">
          {plain.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-[12.5px] leading-snug">
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="space-y-2.5">
      <h3 className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
        Também considerei
      </h3>

      <ul className="space-y-2.5">
        {ranked.map((item, index) => (
          <li key={`${item.hypothesis}-${index}`} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-medium leading-tight">{item.hypothesis}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {item.probability}%
              </span>
            </div>

            <div className="h-[3px] overflow-hidden rounded-full bg-muted">
              <div
                className="motion-bar h-full rounded-full bg-muted-foreground/50"
                style={{ width: armed ? `${item.probability}%` : "0%" }}
              />
            </div>

            {item.ruledOutBy && (
              <p className="text-[11px] leading-snug text-muted-foreground">{item.ruledOutBy}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
