import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemo } from "../DemoState";

export function CalendarScreen() {
  const { state, dispatch, go } = useDemo();
  const [plantFilter, setPlantFilter] = useState<string>("all");

  const tasks = useMemo(() => {
    return state.tasks
      .filter((t) => plantFilter === "all" || t.plantId === plantFilter)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [state.tasks, plantFilter]);

  const now = new Date();
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: monthDays }, (_, i) => i + 1);
  const taskByDay = new Map<number, number>();
  tasks.forEach((t) => {
    const d = new Date(t.dueDate);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      taskByDay.set(d.getDate(), (taskByDay.get(d.getDate()) ?? 0) + 1);
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Calendário</h1>

      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" variant={plantFilter === "all" ? "default" : "outline"} onClick={() => setPlantFilter("all")}>Todas</Button>
        {state.plants.map((p) => (
          <Button key={p.id} size="sm" variant={plantFilter === p.id ? "default" : "outline"} onClick={() => setPlantFilter(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="mb-2 text-sm text-muted-foreground">{now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {days.map((d) => {
              const count = taskByDay.get(d) ?? 0;
              const isToday = d === now.getDate();
              return (
                <div
                  key={d}
                  className={`min-h-11 rounded-md p-1 ${isToday ? "bg-leaf-soft font-bold text-leaf" : "bg-muted"}`}
                >
                  <div>{d}</div>
                  {count > 0 && <div className="mt-0.5 text-[10px] text-leaf">{count} ●</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 font-medium">Próximas tarefas</p>
        {tasks.length === 0 ? (
          <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Sem tarefas.</CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const plant = state.plants.find((p) => p.id === t.plantId);
              const late = !t.done && new Date(t.dueDate) < now;
              return (
                <li key={t.id}>
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => dispatch({ type: "toggleTask", id: t.id })}
                        aria-label={`Concluir ${t.title}`}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className={t.done ? "text-muted-foreground line-through" : "font-medium"}>{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {plant?.name} · {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                          {late && <span className="ml-2 rounded-full bg-warning-soft px-2 py-0.5 text-warning">Atrasada</span>}
                        </p>
                      </div>
                      {plant && (
                        <Button size="sm" variant="ghost" onClick={() => go("plantDetail", { id: plant.id })}>Abrir</Button>
                      )}
                      {t.type === "reavaliacao" && plant && (
                        <Button size="sm" variant="secondary" onClick={() => go("reassessment", { plantId: plant.id })}>Reavaliar</Button>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
