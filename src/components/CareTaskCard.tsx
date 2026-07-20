import { Check, Droplets, Sprout, Scissors, Bug, Camera, Layers } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import type { CareTask, CareType } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap: Record<CareType, typeof Droplets> = {
  regar: Droplets,
  adubar: Sprout,
  podar: Scissors,
  pragas: Bug,
  fotografar: Camera,
  substrato: Layers,
};

export function CareTaskCard({
  task,
  onToggle,
}: {
  task: CareTask;
  onToggle?: (id: string) => void;
}) {
  const Icon = iconMap[task.type];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm",
        task.done && "opacity-60",
      )}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            task.done && "line-through",
          )}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(task.date), "EEE, d 'de' MMM", { locale: ptBR })}
        </p>
      </div>
      <Button
        size="sm"
        variant={task.done ? "secondary" : "outline"}
        onClick={() => onToggle?.(task.id)}
        className="shrink-0"
      >
        <Check className="h-4 w-4" />
        <span className="sr-only">Concluir</span>
      </Button>
    </div>
  );
}
