import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { plantsService, tasksService, timelineService } from "@/lib/services";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareTaskCard } from "@/components/CareTaskCard";
import {
  ArrowLeft,
  Camera,
  Droplets,
  Home,
  MessageCircle,
  Sprout,
  Sun,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Plant, PlantStatus } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/plantas/$id")({
  head: () => ({ meta: [{ title: `Planta · Plantae AI` }] }),
  component: PlantDetail,
  notFoundComponent: PlantNotFound,
});

function mainAction(status: PlantStatus): { label: string; tone: "leaf" | "warning" | "danger" } {
  switch (status) {
    case "saudavel":
      return { label: "Ver plano de cuidados", tone: "leaf" };
    case "atencao":
      return { label: "Atualizar diagnóstico", tone: "warning" };
    case "acompanhamento":
      return { label: "Acompanhar evolução", tone: "leaf" };
    default:
      return { label: "Fazer primeiro diagnóstico", tone: "leaf" };
  }
}

function PlantDetail() {
  const { id } = Route.useParams();
  const plant = useQuery({
    queryKey: ["plant", id],
    queryFn: () => plantsService.get(id),
  });
  const tasks = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => tasksService.listByPlant(id),
  });
  const timeline = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => timelineService.listByPlant(id),
  });

  if (plant.isSuccess && !plant.data) throw notFound();

  if (plant.isLoading || !plant.data) {
    return (
      <AppShell title="Planta">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const p: Plant = plant.data;
  const action = mainAction(p.status);
  const actionToneClass =
    action.tone === "warning"
      ? "bg-warning text-warning-foreground hover:bg-warning/90"
      : action.tone === "danger"
        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        : "";

  return (
    <AppShell
      title={p.nickname}
      right={
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/plantas" aria-label="Voltar para Minhas Plantas">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="aspect-[16/10] bg-muted">
            <img src={p.photo} alt={p.nickname} className="h-full w-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={p.status} />
              <span className="text-xs text-muted-foreground">
                {p.scientific ?? p.species}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold">{p.nickname}</h1>
            {p.lastWatered && (
              <p className="mt-1 text-xs text-muted-foreground">
                Última atualização: {fmt(p.lastWatered)}
              </p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Info label="Última rega" value={fmt(p.lastWatered)} icon={<Droplets className="h-4 w-4" />} />
              <Info label="Última adubação" value={fmt(p.lastFertilized)} icon={<Sprout className="h-4 w-4" />} />
              <Info label="Luz" value={p.light ?? "-"} icon={<Sun className="h-4 w-4" />} />
            </div>
            {p.nextCare && (
              <div className="mt-4 rounded-2xl bg-leaf-soft p-3 text-sm text-leaf">
                Próximo cuidado: <strong>{p.nextCare.label}</strong> · {p.nextCare.whenLabel}
              </div>
            )}

            <Button asChild size="lg" className={`mt-4 w-full ${actionToneClass}`}>
              <Link to="/app/diagnostico" search={{ plantId: p.id }}>
                {action.label}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline">
            <Droplets className="h-4 w-4" /> Registrar
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/diagnostico" search={{ plantId: p.id }}>
              <Camera className="h-4 w-4" /> Diagnóstico
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/jardineiro">
              <MessageCircle className="h-4 w-4" /> IA
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="visao">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao">Visão</TabsTrigger>
            <TabsTrigger value="diag">Diagnósticos</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="hist">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-4 space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="text-muted-foreground">
                Sua {p.nickname} está em ambiente <strong>{p.environment}</strong>, com luz{" "}
                <strong>{p.light}</strong>. Rega recomendada: a cada{" "}
                <strong>{p.wateringFrequencyDays} dias</strong>.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <h3 className="font-semibold">Resumo da saúde</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Principal atenção: possível excesso de umidade</li>
                <li>Confiança: moderada</li>
                <li>Última análise: há 4 dias</li>
                <li>Próxima verificação: amanhã</li>
              </ul>
              <p className="mt-2 text-xs italic">
                Diagnóstico é uma hipótese assistida.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="diag" className="mt-4 space-y-2">
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">Excesso de umidade nas raízes</p>
                <span className="text-xs text-muted-foreground">há 4 dias</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Confiança moderada · status atenção
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/diagnostico" search={{ plantId: p.id }}>
                    Atualizar diagnóstico
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plano" className="mt-4 space-y-2">
            {(tasks.data ?? []).map((t) => (
              <CareTaskCard key={t.id} task={t} />
            ))}
            {(tasks.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa no plano ainda.
              </p>
            )}
          </TabsContent>

          <TabsContent value="hist" className="mt-4">
            <ol className="relative space-y-3 border-l border-border pl-4">
              {(timeline.data ?? []).map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-leaf" />
                  <div className="rounded-2xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.date), "d 'de' MMM", { locale: ptBR })} ·{" "}
                      {e.type}
                    </p>
                    {e.note && <p className="text-sm">{e.note}</p>}
                    {e.photo && (
                      <img
                        src={e.photo}
                        alt=""
                        className="mt-2 h-24 w-24 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="mx-auto flex h-6 w-6 items-center justify-center text-leaf">{icon}</div>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "-";
  return format(new Date(iso), "d 'de' MMM", { locale: ptBR });
}

function PlantNotFound() {
  return (
    <AppShell title="Planta não encontrada">
      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning-soft text-warning">
          <Sprout className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold">Planta não encontrada</h2>
        <p className="text-sm text-muted-foreground">
          Essa planta não existe mais ou o link está incorreto.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/app/plantas">
              <ArrowLeft className="h-4 w-4" /> Voltar para Minhas Plantas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/inicio">
              <Home className="h-4 w-4" /> Ir para o início
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
