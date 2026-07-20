import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { tasksService, plantsService } from "@/lib/services";
import { CareTaskCard } from "@/components/CareTaskCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { CareTask } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/app/calendario")({
  head: () => ({ meta: [{ title: "Calendário · Plantae AI" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [plantFilter, setPlantFilter] = useState<string>("todas");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [localTasks, setLocalTasks] = useState<CareTask[] | null>(null);

  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: tasksService.list,
  });

  const list = (localTasks ?? tasks.data ?? []).filter((t) => {
    if (plantFilter !== "todas" && t.plantId !== plantFilter) return false;
    if (typeFilter !== "todos" && t.type !== typeFilter) return false;
    return true;
  });

  const toggle = (id: string) => {
    const base = localTasks ?? tasks.data ?? [];
    setLocalTasks(base.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    toast.success("Tarefa atualizada");
  };

  return (
    <AppShell title="Calendário">
      <div className="grid gap-5 md:grid-cols-[auto_1fr]">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <CalendarUI mode="single" selected={date} onSelect={setDate} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={plantFilter} onValueChange={setPlantFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as plantas</SelectItem>
                {(plants.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos cuidados</SelectItem>
                <SelectItem value="regar">Regar</SelectItem>
                <SelectItem value="adubar">Adubar</SelectItem>
                <SelectItem value="podar">Podar</SelectItem>
                <SelectItem value="pragas">Pragas</SelectItem>
                <SelectItem value="fotografar">Fotografar</SelectItem>
                <SelectItem value="substrato">Substrato</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => toast.info("Em breve: criação de tarefa manual")}
            >
              <Plus className="h-4 w-4" /> Nova tarefa
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Próximos cuidados</h3>
            <div className="space-y-2">
              {list.map((t) => (
                <CareTaskCard key={t.id} task={t} onToggle={toggle} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
