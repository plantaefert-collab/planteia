import type { Diagnosis, PlantStatus } from "@/lib/types";
import { AlertCircle, CheckCircle2, Calendar, Eye, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConfidenceBar } from "@/components/diagnosis/ConfidenceBar";
import { DifferentialList } from "@/components/diagnosis/DifferentialList";
import { ContextPill } from "@/components/diagnosis/ContextPill";
import { PartialFailure } from "@/components/diagnosis/PartialFailure";
import { StreamBlock, staggerDelay } from "@/components/diagnosis/StreamBlock";

/**
 * Apresentação do diagnóstico. Implementa P-002, P-003, P-005 e P-006.
 *
 * Substitui a versão anterior, que empilhava oito seções abertas com o mesmo peso
 * visual. O problema não era estética: quem chega aqui está preocupado com a planta
 * e precisa de UMA ação, não de oito listas. A hierarquia agora é
 *
 *   veredito → o que fazer agora → por que penso isso → o que descartei → o resto
 *
 * e "o resto" fica recolhido. Ver `design/decisoes.md` D-001.
 *
 * Aceita `Partial<Diagnosis>` porque durante o streaming os campos chegam um a um.
 * Todo bloco decide sozinho se já tem dado suficiente para aparecer.
 */

const STATUS_META: Record<PlantStatus, { label: string; className: string }> = {
  saudavel: { label: "Saudável", className: "bg-success-soft text-success-dark" },
  acompanhamento: { label: "Em observação", className: "bg-warning-soft text-warning" },
  atencao: { label: "Requer ação", className: "bg-destructive/10 text-destructive" },
};

export function DiagnosisResult({
  d,
  streaming = false,
  onRetry,
}: {
  d: Partial<Diagnosis>;
  /**
   * Durante o streaming os blocos montam conforme os campos chegam, então o
   * escalonamento é produzido pelo próprio fluxo. Só fora dele aplicamos o
   * escalonamento artificial de M-001.
   */
  streaming?: boolean;
  onRetry?: () => void;
}) {
  // Índice de bloco para o escalonamento. Incrementa só nos blocos que renderizam,
  // senão um campo ausente abriria um buraco no ritmo da entrada.
  let block = 0;
  const nextDelay = () => (streaming ? 0 : staggerDelay(block++));

  const status = d.status ? STATUS_META[d.status] : null;
  const [primaryAction, ...otherActions] = d.immediateActions ?? [];
  const hasWatchlist =
    (d.improvementSigns?.length ?? 0) > 0 || (d.urgencySigns?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Veredito. Confiança e severidade são eixos SEPARADOS — ver P-003. */}
      {d.mainSuspicion && (
        <StreamBlock delayMs={nextDelay()}>
          <div className="space-y-3 rounded-2xl bg-leaf p-4 text-background">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-75">
                Provável causa
              </span>
              {status && (
                <span
                  className={cn(
                    "shrink-0 rounded-full bg-background/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                  )}
                >
                  {status.label}
                </span>
              )}
            </div>

            <h2 className="font-display text-[22px] font-semibold leading-tight">
              {d.mainSuspicion}
            </h2>

            {d.confidence && <ConfidenceBar confidence={d.confidence} tone="onLeaf" />}
          </div>
        </StreamBlock>
      )}

      {/* P-006 — o que foi lido do histórico sem perguntar. */}
      {d.contextUsed && d.contextUsed.length > 0 && (
        <StreamBlock delayMs={nextDelay()}>
          <ContextPill items={d.contextUsed} />
        </StreamBlock>
      )}

      {/* P-005 — falha parcial nomeada, antes do conteúdo que sobreviveu. */}
      {d.missingFields && d.missingFields.length > 0 && (
        <StreamBlock delayMs={nextDelay()}>
          <PartialFailure missingFields={d.missingFields} onRetry={onRetry} />
        </StreamBlock>
      )}

      {/* Uma ação em destaque. As demais ficam abaixo, sem competir com ela. */}
      {primaryAction && (
        <StreamBlock delayMs={nextDelay()}>
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              Faça agora
            </h3>
            <div className="flex items-start gap-2.5 rounded-2xl border border-leaf/15 bg-leaf-soft/40 p-3.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-leaf"
                aria-hidden="true"
              />
              <p className="text-[13px] font-semibold leading-snug">{primaryAction}</p>
            </div>

            {otherActions.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {otherActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
                    <span
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-leaf/50"
                      aria-hidden="true"
                    />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </StreamBlock>
      )}

      {/* Por que penso isso. Ancorado no que foi observado, não em teoria. */}
      {d.observedSigns && d.observedSigns.length > 0 && (
        <StreamBlock delayMs={nextDelay()}>
          <section className="space-y-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              O que eu vi na sua planta
            </h3>
            <ul className="space-y-1.5">
              {d.observedSigns.map((sign, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
                  <span
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </section>
        </StreamBlock>
      )}

      {/* P-003 — o que foi considerado e descartado. Cai para `otherPossibilities`
          quando não há diferencial estruturado, para que nenhum caminho do app
          termine mostrando uma hipótese única. */}
      {((d.differential?.length ?? 0) > 0 || (d.otherPossibilities?.length ?? 0) > 0) && (
        <StreamBlock delayMs={nextDelay()}>
          <DifferentialList items={d.differential} plain={d.otherPossibilities ?? []} />
        </StreamBlock>
      )}

      {/* O resto fica recolhido: existe para quem procurar, não pesa em quem não. */}
      {(d.avoid?.length || d.whatToObserve?.length || hasWatchlist || d.careTimeline?.length) && (
        <StreamBlock delayMs={nextDelay()}>
          <Accordion type="single" collapsible className="rounded-2xl border border-border">
            {d.avoid && d.avoid.length > 0 && (
              <Panel value="avoid" icon={<XCircle className="h-3.5 w-3.5" />} title="O que evitar">
                <ul className="space-y-1.5">
                  {d.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
                      <span className="mt-px shrink-0 font-bold text-destructive" aria-hidden="true">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {hasWatchlist && (
              <Panel
                value="signs"
                icon={<AlertCircle className="h-3.5 w-3.5" />}
                title="Como saber se está melhorando"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <SignBox
                    tone="success"
                    title="Sinal de melhora"
                    items={d.improvementSigns ?? []}
                  />
                  <SignBox tone="destructive" title="Sinal de alerta" items={d.urgencySigns ?? []} />
                </div>
              </Panel>
            )}

            {d.whatToObserve && d.whatToObserve.length > 0 && (
              <Panel
                value="observe"
                icon={<Eye className="h-3.5 w-3.5" />}
                title="O que observar nos próximos dias"
              >
                <ul className="space-y-1.5">
                  {d.whatToObserve.map((item, i) => (
                    <li key={i} className="text-[12.5px] leading-snug text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {d.careTimeline && d.careTimeline.length > 0 && (
              <Panel
                value="timeline"
                icon={<Calendar className="h-3.5 w-3.5" />}
                title="Cronograma de recuperação"
                last
              >
                <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
                  {d.careTimeline.map((item, i) => (
                    <li key={i} className="relative pl-6">
                      <span
                        className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-leaf"
                        aria-hidden="true"
                      />
                      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-leaf">
                        {item.when}
                      </p>
                      <p className="text-[12.5px] font-medium leading-snug">{item.task}</p>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}
          </Accordion>
        </StreamBlock>
      )}

      {d.reevaluateInDays && (
        <StreamBlock delayMs={nextDelay()}>
          <p className="rounded-2xl bg-muted/40 p-3.5 text-center text-[12px] leading-relaxed text-muted-foreground">
            Vale reavaliar em{" "}
            <strong className="font-semibold text-foreground">
              {d.reevaluateInDays} dias
            </strong>{" "}
            para comparar a evolução.
          </p>
        </StreamBlock>
      )}
    </div>
  );
}

function Panel({
  value,
  icon,
  title,
  children,
  last = false,
}: {
  value: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <AccordionItem value={value} className={cn(last && "border-b-0")}>
      <AccordionTrigger className="px-3.5 py-3 text-[12.5px] font-semibold hover:no-underline">
        <span className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-foreground">{title}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3.5 pb-3.5">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SignBox({
  tone,
  title,
  items,
}: {
  tone: "success" | "destructive";
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5",
        tone === "success"
          ? "border-success/15 bg-success-soft/25"
          : "border-destructive/15 bg-destructive/5",
      )}
    >
      <h4
        className={cn(
          "flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em]",
          tone === "success" ? "text-success-dark" : "text-destructive",
        )}
      >
        {tone === "success" ? (
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
        )}
        {title}
      </h4>
      <ul className="mt-1.5 space-y-1 text-[11.5px] leading-snug">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
