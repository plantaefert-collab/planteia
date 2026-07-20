import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { plantsService, tasksService } from "@/lib/services";
import { CareTaskCard } from "@/components/CareTaskCard";
import { PlantCard } from "@/components/PlantCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Camera, Sparkles, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/inicio")({
  head: () => ({ meta: [{ title: "Início · Plantae AI" }] }),
  component: Home,
});

function Home() {
  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksService.list });

  const todayTasks = (tasks.data ?? []).filter((t) => !t.done).slice(0, 3);
  const alertPlant = (plants.data ?? []).find((p) => p.status === "atencao");

  return (
    <AppShell title="Início">
      <div className="space-y-6">
        <section>
          <p className="text-sm text-muted-foreground">Olá, Maria 👋</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Vamos cuidar do seu jardim?
          </h2>
        </section>

        {alertPlant && (
          <Link
            to="/app/plantas/$id"
            params={{ id: alertPlant.id }}
            className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 shadow-sm"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warning/20 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{alertPlant.nickname}</p>
                <StatusBadge status={alertPlant.status} />
              </div>
              <p className="truncate text-xs text-foreground/80">
                {alertPlant.nextCare?.label} · {alertPlant.nextCare?.whenLabel}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Cuidados de hoje</h3>
            <Link to="/app/calendario" className="text-xs font-medium text-leaf">
              Ver tudo
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            {todayTasks.map((t) => (
              <CareTaskCard key={t.id} task={t} />
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/app/diagnostico"
            className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-leaf-soft to-card p-4 shadow-sm"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf text-primary-foreground">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Diagnóstico rápido</p>
              <p className="text-xs text-muted-foreground">Envie fotos e receba um plano.</p>
            </div>
          </Link>
          <Link
            to="/app/jardineiro"
            className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-bloom-soft to-card p-4 shadow-sm"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Jardineiro IA</p>
              <p className="text-xs text-muted-foreground">Tire suas dúvidas por chat.</p>
            </div>
          </Link>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Suas plantas</h3>
            <Link to="/app/plantas" className="text-xs font-medium text-leaf">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plants.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            {(plants.data ?? []).slice(0, 3).map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-leaf">
            Dica do dia
          </p>
          <p className="mt-1 text-sm text-foreground/90">
            Orquídeas Phalaenopsis gostam de luz indireta clara. Se as folhas
            estiverem muito verdes e alongadas, pode estar faltando luz.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
