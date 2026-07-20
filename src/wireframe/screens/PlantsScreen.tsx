import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Stethoscope } from "lucide-react";
import { useDemo } from "../DemoState";
import type { DemoStatus } from "../types";

const statusLabels: Record<DemoStatus, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  acompanhamento: "Em acompanhamento",
  sem_diagnostico: "Sem diagnóstico",
};

const statusColors: Record<DemoStatus, string> = {
  saudavel: "bg-success-soft text-success",
  atencao: "bg-warning-soft text-warning",
  acompanhamento: "bg-leaf-soft text-leaf",
  sem_diagnostico: "bg-muted text-muted-foreground",
};

export function PlantsScreen() {
  const { state, go } = useDemo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<DemoStatus | "all">("all");
  const [showEmpty, setShowEmpty] = useState(false);

  const filtered = useMemo(() => {
    return state.plants.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.species.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.plants, q, filter]);

  const list = showEmpty ? [] : filtered;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">Minhas plantas</h1>
        <Button onClick={() => go("newPlant")}><Plus className="mr-1 h-4 w-4" /> Nova planta</Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input placeholder="Buscar por nome ou espécie" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" aria-label="Buscar plantas" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "saudavel", "atencao", "acompanhamento", "sem_diagnostico"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Todas" : statusLabels[s]}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setShowEmpty((v) => !v)}>
            {showEmpty ? "Mostrar plantas" : "Ver estado vazio"}
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <div className="text-4xl">🪴</div>
            <p className="font-medium">Nenhuma planta encontrada</p>
            <p className="text-sm text-muted-foreground">Comece adicionando sua primeira planta.</p>
            <Button onClick={() => go("newPlant")}><Plus className="mr-1 h-4 w-4" /> Nova planta</Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <article className="group rounded-2xl bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 text-left"
                  onClick={() => go("plantDetail", { id: p.id })}
                  aria-label={`Abrir ficha de ${p.name}`}
                >
                  <div className="text-4xl" aria-hidden>{p.photo}</div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.species}</p>
                    <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                    {p.nextTaskTitle && <p className="mt-1.5 text-xs text-muted-foreground">Próximo: {p.nextTaskTitle}</p>}
                  </div>
                </button>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => go("diagnosis", { plantId: p.id })}
                  >
                    <Stethoscope className="mr-1 h-4 w-4" /> Diagnosticar
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
