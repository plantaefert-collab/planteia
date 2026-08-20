import { Check, Droplets, Sprout, Scissors, Bug, Camera, Layers } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
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
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-all",
        task.done && "opacity-60 bg-muted/30",
        task.priority === "alta" && !task.done && "border-warning/30 bg-warning-soft/10",
        task.priority === "critica" && !task.done && "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
        task.priority === "alta" ? "bg-warning-soft text-warning" : 
        task.priority === "critica" ? "bg-destructive/10 text-destructive" :
        "bg-leaf-soft text-leaf"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium text-foreground",
              task.done && "line-through",
            )}
          >
            {task.title}
          </p>
          {task.priority === "alta" && !task.done && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
          {task.priority === "critica" && !task.done && <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          <span>{format(new Date(task.date), "EEE, d 'de' MMM", { locale: ptBR })}</span>
          {task.origin === "diagnostico" && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-leaf">Via Diagnóstico</span>
            </>
          )}
        </div>
      </div>
      {/* Reavaliação não se "marca como feita": ela se faz. O atalho leva direto
          ao diagnóstico da planta, que é o que a tarefa está pedindo. */}
      {task.type === "fotografar" && !task.done && (
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link
            to="/app/diagnostico"
            search={{ plantId: task.plantId, mode: "acompanhamento" }}
          >
            Reavaliar
          </Link>
        </Button>
      )}
      <Button
        size="sm"
        variant={task.done ? "ghost" : "outline"}
        onClick={() => onToggle?.(task.id)}
        className={cn(
          // 36x36 é menor que o mínimo tocável (44px). tap-safe-square expande só a
          // área do dedo, sem mexer no tamanho visual do botão.
          "tap-safe-square shrink-0 h-9 w-9 p-0 rounded-full transition-all",
          task.done ? "text-success bg-success-soft/30 hover:bg-success-soft/50" : "hover:border-leaf hover:text-leaf"
        )}
      >
        <Check className={cn("h-4 w-4 transition-transform", task.done && "scale-110")} />
        <span className="sr-only">Concluir</span>
      </Button>
    </div>
  );
}
