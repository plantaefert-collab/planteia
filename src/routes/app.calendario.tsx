import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/use-auth";
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

  const qc = useQueryClient();
  const { session } = useAuth();

  const toggle = async (id: string) => {
    const base = localTasks ?? tasks.data ?? [];
    const atual = base.find((t) => t.id === id);
    if (!atual) return;
    const novoEstado = !atual.done;

    // Responde na hora; confirma no banco em seguida.
    setLocalTasks(base.map((t) => (t.id === id ? { ...t, done: novoEstado } : t)));
    try {
      const gravou = await tasksService.toggle(id, novoEstado);
      if (gravou) {
        await qc.invalidateQueries({ queryKey: ["tasks"] });
        await qc.invalidateQueries({ queryKey: ["plants"] });
        setLocalTasks(null);
      }
      toast.success(novoEstado ? "Tarefa concluída" : "Tarefa reaberta");
    } catch {
      setLocalTasks(base);
      toast.error("Não consegui salvar", { description: "Tente novamente." });
    }
  };

  // Nova tarefa manual
  const [novaAberta, setNovaAberta] = useState(false);
  const [novaPlanta, setNovaPlanta] = useState("");
  const [novoTipo, setNovoTipo] = useState<string>("regar");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData, setNovaData] = useState(() => new Date().toISOString().slice(0, 10));
  const [salvandoNova, setSalvandoNova] = useState(false);

  const criarTarefa = async () => {
    if (!novaPlanta || !novoTitulo.trim() || salvandoNova) return;
    setSalvandoNova(true);
    try {
      await tasksService.create({
        plantId: novaPlanta,
        type: novoTipo as CareTask["type"],
        title: novoTitulo.trim(),
        date: new Date(`${novaData}T09:00:00`).toISOString(),
      });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["plants"] });
      setLocalTasks(null);
      toast.success("Tarefa criada!");
      setNovaAberta(false);
      setNovoTitulo("");
    } catch (err) {
      toast.error("Não consegui criar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSalvandoNova(false);
    }
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
              onClick={() => {
                if (!session) {
                  toast.info("Entre na sua conta", {
                    description: "Assim as tarefas ficam salvas de verdade.",
                  });
                  return;
                }
                setNovaPlanta((plants.data ?? [])[0]?.id ?? "");
                setNovaAberta(true);
              }}
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
      <Dialog open={novaAberta} onOpenChange={setNovaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
            <DialogDescription>
              Um lembrete seu, além dos que o plano já cria sozinho.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Planta</Label>
              <Select value={novaPlanta} onValueChange={setNovaPlanta}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a planta" />
                </SelectTrigger>
                <SelectContent>
                  {(plants.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nickname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Cuidado</Label>
              <Select value={novoTipo} onValueChange={setNovoTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regar">Regar</SelectItem>
                  <SelectItem value="adubar">Adubar</SelectItem>
                  <SelectItem value="podar">Podar</SelectItem>
                  <SelectItem value="pragas">Checar pragas</SelectItem>
                  <SelectItem value="fotografar">Fotografar</SelectItem>
                  <SelectItem value="substrato">Substrato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tarefa-titulo">O que fazer</Label>
              <Input
                id="tarefa-titulo"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Ex.: Trocar o substrato"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tarefa-data">Quando</Label>
              <Input
                id="tarefa-data"
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaAberta(false)} disabled={salvandoNova}>
              Cancelar
            </Button>
            <Button onClick={criarTarefa} disabled={salvandoNova || !novoTitulo.trim() || !novaPlanta}>
              {salvandoNova && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
