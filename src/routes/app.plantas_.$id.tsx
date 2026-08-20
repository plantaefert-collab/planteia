import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  diagnosisService,
  plantsService,
  tasksService,
  timelineService,
} from "@/lib/services";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CareTaskCard } from "@/components/CareTaskCard";
import { EmptyState } from "@/components/EmptyState";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Droplets,
  FileText,
  Home,
  MessageCircle,
  Sprout,
  Stethoscope,
  Sun,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CareTask, Diagnosis, Plant, TimelineEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/plantas_/$id")({
  head: () => ({ meta: [{ title: `Planta · Plantae AI` }] }),
  component: PlantDetail,
  notFoundComponent: PlantNotFound,
  errorComponent: PlantError,
});

type TabKey = "visao" | "diag" | "plano" | "hist";
type ActionKind = "diagnostico" | "plano" | "historico";
interface MainAction {
  label: string;
  tone: "leaf" | "warning" | "danger";
  kind: ActionKind;
}

function decideMainAction(
  plant: Plant,
  diagnosis: Diagnosis | null,
): MainAction {
  if (!diagnosis) {
    return {
      label: "Avaliar saúde agora",
      tone: plant.status === "atencao" ? "warning" : "leaf",
      kind: "diagnostico",
    };
  }

  // Priority logic
  if (diagnosis.status === "atencao") {
    if (diagnosis.reevaluateInDays <= 3) {
      return { label: "Urgente: Reavaliar", tone: "danger", kind: "diagnostico" };
    }
    return {
      label: "Ver Plano de Cuidados",
      tone: "warning",
      kind: "plano",
    };
  }

  if (diagnosis.status === "acompanhamento") {
    return { label: "Acompanhar evolução", tone: "leaf", kind: "historico" };
  }

  return { label: "Ver Plano de Cuidados", tone: "leaf", kind: "plano" };
}

function PlantDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("visao");
  const [taskOverrides, setTaskOverrides] = useState<Record<string, boolean>>({});
  const [extraTimeline, setExtraTimeline] = useState<TimelineEntry[]>([]);
  const [dialog, setDialog] = useState<null | "rega" | "adubacao" | "foto" | "obs">(
    null,
  );
  const [note, setNote] = useState("");

  const plant = useQuery({
    queryKey: ["plant", id],
    queryFn: () => plantsService.get(id),
    retry: 1,
  });
  const tasks = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => tasksService.listByPlant(id),
    enabled: !!plant.data,
  });
  const timeline = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => timelineService.listByPlant(id),
    enabled: !!plant.data,
  });
  const diagnosis = useQuery({
    queryKey: ["diagnosis", id],
    queryFn: () => diagnosisService.getByPlant(id),
    enabled: !!plant.data,
  });

  const mergedTasks: CareTask[] = useMemo(() => {
    return (tasks.data ?? []).map((t) =>
      t.id in taskOverrides ? { ...t, done: taskOverrides[t.id] } : t,
    );
  }, [tasks.data, taskOverrides]);

  const completed = mergedTasks.filter((t) => t.done).length;
  const total = mergedTasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const combinedTimeline = useMemo(
    () =>
      [...extraTimeline, ...(timeline.data ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [timeline.data, extraTimeline],
  );

  if (plant.isSuccess && !plant.data) throw notFound();

  if (plant.isError) {
    return (
      <PlantLoadError
        onRetry={() => plant.refetch()}
      />
    );
  }

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
  const dx = diagnosis.data ?? null;
  const action = decideMainAction(p, dx);
  const actionToneClass =
    action.tone === "warning"
      ? "bg-warning text-warning-foreground hover:bg-warning/90"
      : action.tone === "danger"
        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        : "";

  const runAction = () => {
    if (action.kind === "diagnostico") {
      navigate({ to: "/app/diagnostico", search: { plantId: p.id } });
    } else if (action.kind === "plano") {
      setTab("plano");
    } else {
      setTab("hist");
    }
  };

  const toggleTask = (taskId: string) => {
    const current = mergedTasks.find((t) => t.id === taskId);
    if (!current) return;
    setTaskOverrides((prev) => ({ ...prev, [taskId]: !current.done }));
    toast.success(!current.done ? "Tarefa concluída" : "Tarefa reaberta");
  };

  const addTimeline = (type: TimelineEntry["type"], noteText?: string) => {
    const entry: TimelineEntry = {
      id: `local-${Date.now()}`,
      plantId: p.id,
      type,
      date: new Date().toISOString(),
      note: noteText,
    };
    setExtraTimeline((prev) => [entry, ...prev]);
  };

  const confirmQuickAction = () => {
    if (!dialog) return;
    if (dialog === "rega") {
      addTimeline("rega", note || "Rega registrada");
      toast.success("Rega registrada");
    } else if (dialog === "adubacao") {
      addTimeline("adubacao", note || "Adubação registrada");
      toast.success("Adubação registrada");
    } else if (dialog === "foto") {
      addTimeline("foto", note || "Foto adicionada (demonstrativo)");
      toast.success("Foto adicionada");
    } else if (dialog === "obs") {
      addTimeline("diagnostico", note || "Observação registrada");
      toast.success("Observação registrada");
    }
    setNote("");
    setDialog(null);
  };

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

            <Button
              size="lg"
              onClick={runAction}
              className={`mt-4 w-full ${actionToneClass}`}
            >
              {action.label}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline" onClick={() => setDialog("rega")}>
            <Droplets className="h-4 w-4" /> Rega
          </Button>
          <Button variant="outline" onClick={() => setDialog("adubacao")}>
            <Sprout className="h-4 w-4" /> Adubação
          </Button>
          <Button variant="outline" onClick={() => setDialog("foto")}>
            <Camera className="h-4 w-4" /> Foto
          </Button>
          <Button variant="outline" onClick={() => setDialog("obs")}>
            <FileText className="h-4 w-4" /> Observação
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao">Visão</TabsTrigger>
            <TabsTrigger value="diag">Diagnósticos</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="hist">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Ambiente</h3>
                <p className="text-sm font-medium">{p.environment === "interno" ? "Interno" : "Externo"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Luz {p.light}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Frequência</h3>
                <p className="text-sm font-medium">
                  {p.wateringFrequencyDays
                    ? `Cuidado a cada ${p.wateringFrequencyDays} dias`
                    : "Frequência ainda não definida"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Conforme espécie</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Resumo da saúde</h3>
              {dx ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Principal suspeita:</span>
                    <span className="font-semibold text-leaf-dark">{dx.mainSuspicion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Confiança da IA:</span>
                    <span className="font-medium text-xs rounded-full px-2 py-0.5 bg-leaf-soft text-leaf">{dx.confidence}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Próxima revisão:</span>
                    <span className="font-medium">Em {dx.reevaluateInDays} dias</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground mb-3">Ainda não há diagnósticos registrados.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/diagnostico" search={{ plantId: p.id }}>Começar agora</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="diag" className="mt-4 space-y-2">
            {dx ? (
              <div className="space-y-4">
                <DiagnosisResult d={dx} />
                <div className="flex gap-2 p-1">
                  <Button asChild className="flex-1" variant="outline">
                    <Link to="/app/diagnostico" search={{ plantId: p.id }}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Nova avaliação
                    </Link>
                  </Button>
                  <Button asChild className="flex-1" variant="outline">
                    <Link to="/app/jardineiro">
                      <MessageCircle className="h-4 w-4 mr-2" /> IA Concierge
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Stethoscope className="h-5 w-5" />}
                title="Sem diagnósticos ainda"
                description="Faça o primeiro diagnóstico para receber um plano de cuidados personalizado."
                action={
                  <Button asChild>
                    <Link to="/app/diagnostico" search={{ plantId: p.id }}>
                      Fazer primeiro diagnóstico
                    </Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="plano" className="mt-4 space-y-3">
            {total > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {completed} de {total} cuidados concluídos
                  </span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            {mergedTasks.map((t) => (
              <CareTaskCard key={t.id} task={t} onToggle={toggleTask} />
            ))}
            {total === 0 && (
              <EmptyState
                icon={<Sprout className="h-5 w-5" />}
                title="Nenhuma tarefa no plano"
                description="As tarefas aparecem aqui após um diagnóstico ou quando você registra cuidados."
              />
            )}
          </TabsContent>

          <TabsContent value="hist" className="mt-4">
            {combinedTimeline.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-5 w-5" />}
                title="Sem registros no histórico"
                description="Registre uma rega, adubação ou foto para começar a montar a linha do tempo."
              />
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-4">
                {combinedTimeline.map((e) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "rega" && "Registrar rega"}
              {dialog === "adubacao" && "Registrar adubação"}
              {dialog === "foto" && "Adicionar foto"}
              {dialog === "obs" && "Registrar observação"}
            </DialogTitle>
            <DialogDescription>
              Este registro é adicionado ao histórico desta planta (modo demonstrativo).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="quick-note">Observação (opcional)</Label>
            <Textarea
              id="quick-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalhes deste registro..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmQuickAction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex justify-center pb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/jardineiro">
            <MessageCircle className="h-4 w-4" /> Falar com Jardineiro IA
          </Link>
        </Button>
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

function fmtRelative(iso: string) {
  const days = Math.round(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
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

function PlantError({ reset }: { error: Error; reset: () => void }) {
  return <PlantLoadError onRetry={reset} />;
}

function PlantLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <AppShell title="Erro ao carregar">
      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold">
          Não foi possível carregar esta planta
        </h2>
        <p className="text-sm text-muted-foreground">
          Verifique sua conexão e tente novamente.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={onRetry}>Tentar novamente</Button>
          <Button asChild variant="outline">
            <Link to="/app/plantas">
              <ArrowLeft className="h-4 w-4" /> Voltar para Minhas Plantas
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
