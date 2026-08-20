import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { plantsService } from "@/lib/services";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Search, Sprout } from "lucide-react";
import type { Plant, PlantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/plantas")({
  head: () => ({ meta: [{ title: "Minhas plantas · Plantae AI" }] }),
  component: Plants,
});

const filters: { key: "todas" | PlantStatus; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "saudavel", label: "Saudáveis" },
  { key: "atencao", label: "Atenção" },
  { key: "acompanhamento", label: "Acompanhar" },
];

function Plants() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("todas");
  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });

  // Peso por urgência: a lista deve responder "o que precisa de mim agora?",
  // e não ser apenas um álbum na ordem de cadastro.
  const peso = (p: Plant) => {
    const atrasada = p.nextCare?.whenLabel?.startsWith("atrasada") ? 0 : 1;
    const porStatus = p.status === "atencao" ? 0 : p.status === "acompanhamento" ? 1 : 2;
    const hoje = p.nextCare?.whenLabel === "hoje" ? 0 : 1;
    return atrasada * 100 + porStatus * 10 + hoje;
  };

  const filtered = (plants.data ?? [])
    .filter((p) => {
      if (filter !== "todas" && p.status !== filter) return false;
      if (q && !`${p.nickname} ${p.species}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => peso(a) - peso(b));

  return (
    <AppShell
      title="Minhas plantas"
      right={
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link to="/app/plantas/nova">
            <Plus className="h-4 w-4" /> Adicionar
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou espécie"
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                filter === f.key
                  ? "border-leaf bg-leaf text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {plants.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Sprout className="h-5 w-5" />}
            title="Nada por aqui ainda"
            description="Adicione sua primeira planta para começar a acompanhar os cuidados."
            action={
              <Button asChild>
                <Link to="/app/plantas/nova">
                  <Plus className="h-4 w-4" /> Adicionar planta
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        )}

        <Button asChild size="lg" className="w-full md:hidden">
          <Link to="/app/plantas/nova">
            <Plus className="h-4 w-4" /> Adicionar planta
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
