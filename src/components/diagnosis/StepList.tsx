import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANALYSIS_STEPS, describeStep, type AnalysisStepId } from "@/lib/diagnosis-stream";
import type { Diagnosis } from "@/lib/types";

/**
 * Lista de passos da análise. Implementa P-001 e M-002.
 *
 * REGRA QUE NÃO PODE SER QUEBRADA: nenhum passo avança por temporizador. Cada um
 * conclui quando o campo correspondente termina de chegar do modelo. Uma checklist
 * inventada é a mesma desonestidade da barra de progresso falsa que este componente
 * substituiu, só que com mais passos.
 */
export function StepList({
  completed,
  photoCount,
  species,
  partial,
}: {
  completed: AnalysisStepId[];
  photoCount: number;
  species?: string;
  partial: Partial<Diagnosis> | null;
}) {
  const done = new Set(completed);
  // Sem foto não existe passo de envio — mostrá-lo parado em "0 fotos" seria um
  // passo que nunca conclui, exatamente o tipo de progresso mentiroso que P-001
  // proíbe.
  const steps = photoCount > 0 ? ANALYSIS_STEPS : ANALYSIS_STEPS.filter((s) => s.id !== "upload");
  const doneCount = steps.filter((step) => done.has(step.id)).length;
  const activeIndex = steps.findIndex((step) => !done.has(step.id));

  return (
    <section aria-label="Progresso da análise" className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Analisando</h2>
        <span
          className="text-[11px] tabular-nums text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {doneCount} de {steps.length}
        </span>
      </header>

      <ol className="space-y-0.5">
        {steps.map((step, index) => {
          const state = done.has(step.id) ? "done" : index === activeIndex ? "active" : "pending";
          const detail = describeStep(step.id, { photoCount, species, partial });

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-2.5 py-2 text-[13px] leading-tight transition-[opacity,color] duration-300",
                state === "pending" && "opacity-35 text-muted-foreground",
                state === "done" && "text-muted-foreground",
                state === "active" && "font-medium text-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-px grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-300",
                  state === "done" && "border-leaf bg-leaf text-background",
                  state === "active" && "animate-spin border-leaf border-t-transparent",
                  state === "pending" && "border-border",
                )}
              >
                {state === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
              </span>

              <span className="min-w-0">
                {step.label}
                {detail && (
                  <span className="block text-[11px] font-normal opacity-70">{detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
