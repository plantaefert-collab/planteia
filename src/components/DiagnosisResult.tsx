import type { Diagnosis } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock, Info, Ban } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const confidenceLabel = {
  baixa: "Confiança baixa",
  moderada: "Confiança moderada",
  alta: "Confiança alta",
} as const;

const confidenceClass = {
  baixa: "bg-muted text-muted-foreground",
  moderada: "bg-warning-soft text-warning",
  alta: "bg-success-soft text-success",
} as const;

function Section({
  title,
  icon,
  children,
  tone = "default",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const toneClass = {
    default: "bg-card border-border",
    warning: "bg-warning-soft/60 border-warning/20",
    danger: "bg-destructive/5 border-destructive/20",
    success: "bg-success-soft/60 border-success/20",
  }[tone];
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-foreground/90">
      {items.map((s) => (
        <li key={s} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

export function DiagnosisResult({ d }: { d: Diagnosis }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={d.status} />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${confidenceClass[d.confidence]}`}
          >
            {confidenceLabel[d.confidence]}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          {d.mainSuspicion}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Esta é uma hipótese assistida por IA. Observe sua planta e valide com um
          especialista se necessário.
        </p>
      </div>

      <Section title="Sinais observados" icon={<Info className="h-4 w-4" />}>
        <List items={d.observedSigns} />
      </Section>

      <Section title="Ações imediatas" icon={<CheckCircle2 className="h-4 w-4" />} tone="success">
        <List items={d.immediateActions} />
      </Section>

      <Section title="O que evitar" icon={<Ban className="h-4 w-4" />} tone="warning">
        <List items={d.avoid} />
      </Section>

      <Section title="Outras possibilidades" icon={<Info className="h-4 w-4" />}>
        <List items={d.otherPossibilities} />
      </Section>

      <Section title="Sinais de urgência" icon={<AlertTriangle className="h-4 w-4" />} tone="danger">
        <List items={d.urgencySigns} />
      </Section>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0" />
        Reavalie em {d.reevaluateInDays} dias.
      </div>
    </div>
  );
}
