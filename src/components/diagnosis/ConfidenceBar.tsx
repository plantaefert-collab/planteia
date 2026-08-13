import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/types";

/**
 * Confiança como barra contínua acompanhada do rótulo. Implementa P-003 e M-003.
 *
 * O rótulo sozinho ("moderada") não comunica magnitude — o leitor não sabe se
 * moderada está perto de alta ou de baixa. A barra resolve isso. Por outro lado a
 * barra sozinha sugere uma precisão numérica que o modelo não tem, por isso as duas
 * andam sempre juntas.
 */

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  baixa: "Confiança baixa",
  moderada: "Confiança moderada",
  "moderada-alta": "Confiança moderada-alta",
  alta: "Confiança alta",
};

/**
 * Posições deliberadamente conservadoras: mesmo "alta" não chega perto de 100%,
 * porque diagnóstico por foto nunca é certeza. Ver P-003.
 */
const CONFIDENCE_PERCENT: Record<Confidence, number> = {
  baixa: 28,
  moderada: 52,
  "moderada-alta": 70,
  alta: 88,
};

export function ConfidenceBar({
  confidence,
  tone = "onLeaf",
}: {
  confidence: Confidence;
  /** `onLeaf` para uso sobre o card verde; `onCard` sobre fundo claro. */
  tone?: "onLeaf" | "onCard";
}) {
  const target = CONFIDENCE_PERCENT[confidence] ?? CONFIDENCE_PERCENT.baixa;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="space-y-1">
      <span
        className={cn(
          "text-[9px] font-bold uppercase tracking-[0.13em]",
          tone === "onLeaf" ? "opacity-75" : "text-muted-foreground",
        )}
      >
        {CONFIDENCE_LABEL[confidence]}
      </span>
      <div
        role="meter"
        aria-valuenow={target}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={CONFIDENCE_LABEL[confidence]}
        className={cn(
          "h-[3px] overflow-hidden rounded-full",
          tone === "onLeaf" ? "bg-white/25" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "motion-bar h-full rounded-full",
            tone === "onLeaf" ? "bg-white" : "bg-leaf",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
