import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { plantsService, tasksService, timelineService } from "@/lib/services";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareTaskCard } from "@/components/CareTaskCard";
import { Camera, Droplets, MessageCircle, Sprout, Sun } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/plantas/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Planta · Plantae AI` }],
  }),
  component: PlantDetail,
});

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
  const p = plant.data;

  return (
    <AppShell title={p?.nickname ?? "Planta"}>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="aspect-[16/10] bg-muted">
            {p && <img src={p.photo} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {p && <StatusBadge status={p.status} />}
              <span className="text-xs text-muted-foreground">
                {p?.scientific ?? p?.species}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              {p?.nickname}
            </h1>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Info label="Última rega" value={fmt(p?.lastWatered)} icon={<Droplets className="h-4 w-4" />} />
              <Info label="Última adubação" value={fmt(p?.lastFertilized)} icon={<Sprout className="h-4 w-4" />} />
              <Info label="Luz" value={p?.light ?? "-"} icon={<Sun className="h-4 w-4" />} />
            </div>
            {p?.nextCare && (
              <div className="mt-4 rounded-2xl bg-leaf-soft p-3 text-sm text-leaf">
                Próximo cuidado: <strong>{p.nextCare.label}</strong> · {p.nextCare.whenLabel}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline">
            <Droplets className="h-4 w-4" /> Registrar
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/diagnostico">
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
            <TabsTrigger value="hist">Histórico</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-4 space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="text-muted-foreground">
                Sua {p?.nickname} está em ambiente <strong>{p?.environment}</strong>, com luz{" "}
                <strong>{p?.light}</strong>. Rega recomendada: a cada{" "}
                <strong>{p?.wateringFrequencyDays} dias</strong>.
              </p>
            </div>
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

          <TabsContent value="plano" className="mt-4 space-y-2">
            {(tasks.data ?? []).map((t) => (
              <CareTaskCard key={t.id} task={t} />
            ))}
          </TabsContent>

          <TabsContent value="fotos" className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {p && (
                <>
                  <img src={p.photo} alt="" className="aspect-square rounded-xl object-cover" />
                  <img src={p.photo} alt="" className="aspect-square rounded-xl object-cover opacity-80" />
                  <img src={p.photo} alt="" className="aspect-square rounded-xl object-cover opacity-60" />
                </>
              )}
            </div>
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
