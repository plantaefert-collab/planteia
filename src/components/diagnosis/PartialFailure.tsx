import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Falha parcial nomeada. Implementa P-005.
 *
 * Substitui a tela genérica de "Falha na análise". Quando o modelo entrega parte do
 * diagnóstico, o usuário fica com essa parte e é informado especificamente do que
 * faltou — nunca perde o que já foi obtido.
 *
 * Erro de rede é outra coisa: ali não há resultado parcial e a interface trata como
 * erro de verdade. A distinção é o padrão Tool Disentanglement.
 */

/** Nome do campo → como o usuário chamaria aquilo. */
const FIELD_LABEL: Record<string, string> = {
  observedSigns: "os sinais visíveis",
  mainSuspicion: "a hipótese principal",
  confidence: "o nível de confiança",
  differential: "as hipóteses alternativas",
  status: "o estado geral da planta",
  immediateActions: "o que fazer agora",
  avoid: "o que evitar",
  urgencySigns: "os sinais de alerta",
  whatToObserve: "o que observar",
  improvementSigns: "os sinais de melhora",
  careTimeline: "o cronograma de cuidado",
  reevaluateInDays: "o prazo de reavaliação",
};

function describeMissing(fields: string[]): string {
  const labels = fields.map((f) => FIELD_LABEL[f] ?? f).filter(Boolean);
  if (labels.length === 0) return "parte da análise";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} e ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function PartialFailure({
  missingFields,
  onRetry,
}: {
  missingFields: string[];
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-warning/20 bg-warning-soft/30 p-4">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-[13px] font-semibold leading-tight text-foreground">
            Consegui parte da análise
          </p>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Não deu para determinar {describeMissing(missingFields)} com esta foto. O que está
            abaixo continua válido — completei o restante com orientação conservadora.
          </p>
        </div>
      </div>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 w-full gap-1.5 border-warning/30 bg-transparent text-[12px] hover:bg-warning-soft/50"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Refazer com uma foto mais nítida
        </Button>
      )}
    </div>
  );
}
