import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar, Leaf, MessageCircle, Stethoscope } from "lucide-react";
import { useDemo } from "../DemoState";

export function DashboardScreen() {
  const { state, go } = useDemo();
  const attention = state.plants.find((p) => p.status === "atencao");
  const nextTask = state.tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const plantForTask = nextTask ? state.plants.find((p) => p.id === nextTask.plantId) : undefined;
  const active = state.plants.find((p) => p.hasPlan);
  const total = state.tasks.filter((t) => active && t.plantId === active.id).length;
  const done = state.tasks.filter((t) => active && t.plantId === active.id && t.done).length;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Bom dia,</p>
        <h1 className="font-display text-2xl">Cuide bem hoje 🌱</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard title="Plantas" value={String(state.plants.length)} sub="no seu jardim" onClick={() => go("plants")} />
        <SummaryCard
          title="Tarefas hoje"
          value={String(state.tasks.filter((t) => !t.done && t.dueDate.slice(0, 10) <= new Date().toISOString().slice(0, 10)).length)}
          sub="pendentes"
          onClick={() => go("calendar")}
        />
      </div>

      {nextTask && plantForTask && (
        <Card onClick={() => go("plantDetail", { id: plantForTask.id })} className="cursor-pointer">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="text-3xl">{plantForTask.photo}</div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Próxima tarefa</p>
              <p className="font-medium">{nextTask.title}</p>
              <p className="text-xs text-muted-foreground">{plantForTask.name}</p>
            </div>
            <Button size="sm" variant="secondary">Abrir</Button>
          </CardContent>
        </Card>
      )}

      {attention && (
        <Card className="border-warning/40 bg-warning-soft" onClick={() => go("plantDetail", { id: attention.id })}>
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-6 w-6 text-warning" aria-hidden />
            <div className="flex-1">
              <p className="font-medium">{attention.name} precisa de atenção</p>
              <p className="text-xs text-muted-foreground">{attention.nextTaskTitle}</p>
            </div>
            <Button size="sm">Ver</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Shortcut icon={Stethoscope} label="Diagnóstico" onClick={() => go("diagnosis")} />
        <Shortcut icon={Leaf} label="Minhas plantas" onClick={() => go("plants")} />
        <Shortcut icon={Calendar} label="Calendário" onClick={() => go("calendar")} />
        <Shortcut icon={MessageCircle} label="Jardineiro IA" onClick={() => go("gardener")} />
      </div>

      {active && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">Plano atual — {active.name}</p>
              <span className="text-xs text-muted-foreground">{done}/{total} tarefas</span>
            </div>
            <Progress value={total ? (done / total) * 100 : 0} />
            <Button size="sm" variant="link" className="px-0" onClick={() => go("plantDetail", { id: active.id })}>
              Ver plano completo
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2 pt-6">
          <p className="font-medium">O que observar hoje</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Firmeza das folhas em plantas em recuperação</li>
            <li>Umidade do substrato antes de regar</li>
            <li>Sinais novos que não apareciam ontem</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, sub, onClick }: { title: string; value: string; sub: string; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="cursor-pointer">
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="font-display text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function Shortcut({ icon: Icon, label, onClick }: { icon: typeof Leaf; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl bg-card p-3 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-5 w-5 text-leaf" aria-hidden />
      {label}
    </button>
  );
}
