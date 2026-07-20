import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemo } from "../DemoState";

export function JournalScreen() {
  const { state, dispatch } = useDemo();
  const [plantFilter, setPlantFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const entries = useMemo(() => {
    return state.history.filter((h) => {
      if (plantFilter !== "all" && h.plantId !== plantFilter) return false;
      if (typeFilter !== "all" && h.type !== typeFilter) return false;
      return true;
    });
  }, [state.history, plantFilter, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">Diário</h1>
        <Button
          size="sm"
          onClick={() =>
            dispatch({
              type: "addHistory",
              entry: { id: `h-${Date.now()}`, plantId: state.plants[0]?.id ?? "p1", type: "observacao", title: "Novo registro", date: new Date().toISOString() },
            })
          }
        >
          Adicionar registro
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" variant={plantFilter === "all" ? "default" : "outline"} onClick={() => setPlantFilter("all")}>Todas</Button>
        {state.plants.map((p) => (
          <Button key={p.id} size="sm" variant={plantFilter === p.id ? "default" : "outline"} onClick={() => setPlantFilter(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["all", "rega", "adubacao", "foto", "observacao", "diagnostico"].map((t) => (
          <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)}>
            {t}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3">
          <div className="aspect-square rounded-xl bg-muted p-2 text-center text-xs">
            <div className="text-3xl">📷</div>
            <p>Antes</p>
          </div>
          <div className="aspect-square rounded-xl bg-leaf-soft p-2 text-center text-xs">
            <div className="text-3xl">🌿</div>
            <p>Depois</p>
          </div>
          <div className="hidden aspect-square rounded-xl bg-muted p-2 text-center text-xs sm:block">
            <div className="text-3xl">📷</div>
            <p>Comparativo</p>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhum registro.</CardContent></Card>
      ) : (
        <ol className="relative space-y-3 border-l border-border pl-4">
          {entries.map((h) => {
            const plant = state.plants.find((p) => p.id === h.plantId);
            return (
              <li key={h.id} className="relative">
                <span className="absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full bg-leaf" aria-hidden />
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleString("pt-BR")} · {plant?.name}
                    </p>
                    <p className="font-medium">{h.title}</p>
                    {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
