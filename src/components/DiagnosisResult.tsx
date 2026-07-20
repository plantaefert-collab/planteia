import type { Diagnosis } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock, Info, Ban, Search, Calendar, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const confidenceLabel = {
  baixa: "Confiança baixa",
  moderada: "Confiança moderada",
  "moderada-alta": "Confiança moderada-alta",
  alta: "Confiança alta",
} as const;

const confidenceClass = {
  baixa: "bg-muted text-muted-foreground",
  moderada: "bg-warning-soft text-warning",
  "moderada-alta": "bg-success-soft/70 text-success",
  alta: "bg-success-soft text-success",
} as const;

export function DiagnosisResult({ d }: { d: Diagnosis }) {
  return (
    <div className="space-y-6">
      {/* 1. Hipótese Principal */}
      <Card className="overflow-hidden border-none bg-card shadow-sm">
        <div className="bg-leaf p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Hipótese Principal</span>
            <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", confidenceClass[d.confidence])}>
              {confidenceLabel[d.confidence]}
            </div>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{d.mainSuspicion}</h2>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <p>Esta análise baseia-se nos sinais visuais e no histórico fornecido. Trate como uma orientação assistida.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 px-1">
        {/* 2. Por que pensamos isso? */}
        <Section title="Por que pensamos isso?" icon={<Search className="h-4 w-4" />}>
          <ul className="space-y-2">
            {d.observedSigns.map((sign, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf/40" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 3. O que fazer agora */}
        <Section title="O que fazer agora" icon={<CheckCircle2 className="h-4 w-4" />} variant="success">
          <ul className="space-y-2">
            {d.immediateActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-medium">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. O que evitar */}
        <Section title="O que evitar" icon={<XCircle className="h-4 w-4" />} variant="destructive">
          <ul className="space-y-2 text-sm">
            {d.avoid.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-bold text-destructive mr-1">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 5. O que observar nos próximos dias */}
        {d.whatToObserve && d.whatToObserve.length > 0 && (
          <Section title="O que observar" icon={<Search className="h-4 w-4" />}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {d.whatToObserve.map((item, i) => (
                <li key={i} className="flex items-start gap-2 italic">
                  <span>• {item}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 6. Sinais de melhora e 7. Sinais de alerta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-success/10 bg-success-soft/20 p-3">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
              <CheckCircle2 className="h-3 w-3" /> Melhora
            </h4>
            <ul className="mt-2 space-y-1 text-[11px] leading-tight text-success-dark">
              {d.improvementSigns?.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-3">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
              <AlertCircle className="h-3 w-3" /> Alerta
            </h4>
            <ul className="mt-2 space-y-1 text-[11px] leading-tight text-destructive">
              {d.urgencySigns.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
        </div>

        {/* 8. Linha do Tempo de Cuidado */}
        {d.careTimeline && d.careTimeline.length > 0 && (
          <Section title="Cronograma de recuperação" icon={<Calendar className="h-4 w-4" />}>
            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {d.careTimeline.map((item, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-background bg-leaf ring-1 ring-leaf/20" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-leaf">{item.when}</p>
                  <p className="text-sm font-medium leading-tight">{item.task}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Recomendamos uma nova avaliação em <span className="font-bold text-foreground">{d.reevaluateInDays} dias</span> para ajustar o plano se necessário.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ 
  title, 
  icon, 
  children, 
  variant = "default" 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  variant?: "default" | "success" | "destructive";
}) {
  const styles = {
    default: "bg-muted/30 border-border text-foreground",
    success: "bg-success-soft/30 border-success/10 text-success-dark",
    destructive: "bg-destructive/5 border-destructive/10 text-destructive",
  };

  return (
    <section className={cn("rounded-2xl border p-4", styles[variant])}>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}
