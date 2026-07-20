import { Progress } from "@/components/ui/progress";

const steps = ["select", "objective", "symptom", "photos", "questions", "review"];

export function DiagnosisProgress({ current }: { current: string }) {
  const index = steps.indexOf(current);
  if (index === -1) return null;
  
  const percentage = ((index + 1) / steps.length) * 100;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <span>Passo {index + 1} de {steps.length}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  );
}
