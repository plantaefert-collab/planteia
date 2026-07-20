import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplet, Camera, StickyNote, Sparkles, Stethoscope } from "lucide-react";
import { useDemo } from "../DemoState";

const tabs = ["visao", "diagnosticos", "plano", "historico"] as const;
type Tab = (typeof tabs)[number];
const tabLabels: Record<Tab, string> = {
  visao: "Visão geral",
  diagnosticos: "Diagnósticos",
  plano: "Plano",
  historico: "Histórico",
};

export function PlantDetailScreen() {
  const { state, nav, go, dispatch } = useDemo();
  const id = nav.params.id ?? state.plants[0]?.id;
  const plant = state.plants.find((p) => p.id === id);
  const [tab, setTab] = useState<Tab>((nav.params.tab as Tab) ?? "visao");

  if (!plant) {
    return (
      <div className="mx-auto max-w-md space-y-3 py-10 text-center">
        <p className="text-4xl">🪴</p>
        <p className="font-medium">Planta não encontrada</p>
        <p className="text-sm text-muted-foreground">Esta planta não existe na demonstração.</p>
        <Button onClick={() => go("plants")}>Voltar para plantas</Button>
      </div>
    );
  }

  const plantTasks = state.tasks.filter((t) => t.plantId === plant.id);
  const plantDiags = state.diagnoses.filter((d) => d.plantId === plant.id);
  const plantHistory = state.history.filter((h) => h.plantId === plant.id);
  const done = plantTasks.filter((t) => t.done).length;
  const total = plantTasks.length;

  const ctaLabel = plant.status === "acompanhamento"
    ? "Reavaliar planta"
    : plant.status === "atencao"
      ? "Diagnosticar problema"
      : plantDiags.length === 0
        ? "Fazer primeiro diagnóstico"
        : "Registrar cuidado";
  const ctaAction = () => {
    if (plant.status === "acompanhamento") go("reassessment", { plantId: plant.id });
    else go("diagnosis", { plantId: plant.id });
  };

  const quickAction = (kind: "rega" | "adubacao" | "foto" | "observacao") => {
    const now = new Date().toISOString();
    const titles = { rega: "Rega registrada", adubacao: "Adubação registrada", foto: "Foto adicionada", observacao: "Observação registrada" } as const;
    dispatch({ type: "addHistory", entry: { id: `h-${Date.now()}`, plantId: plant.id, type: kind, title: titles[kind], date: now } });
    if (kind === "rega") dispatch({ type: "updatePlant", id: plant.id, patch: { lastWatering: now } });
    if (kind === "adubacao") dispatch({ type: "updatePlant", id: plant.id, patch: { lastFertilizing: now } });
  };

  return (
    <div className="space-y-4">
      <button onClick={() => go("plants")} className="inline-flex items-center gap-1 text-sm text-leaf">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="text-5xl" aria-hidden>{plant.photo}</div>
          <div className="flex-1">
            <h1 className="font-display text-2xl">{plant.name}</h1>
            <p className="text-sm text-muted-foreground">{plant.species}</p>
            <p className="mt-1 text-xs text-muted-foreground">Status: {plant.status}</p>
          </div>
          <Button onClick={ctaAction}>
            <Stethoscope className="mr-1 h-4 w-4" /> {ctaLabel}
          </Button>
        </CardContent>
      </Card>

      <div role="tablist" aria-label="Seções da planta" className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t ? "bg-leaf text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === "visao" && (
        <div className="space-y-3">
          <Card>
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <Info label="Ambiente" value={plant.environment} />
              <Info label="Luz" value={plant.light} />
              <Info label="Rega" value={plant.waterFreq} />
              <Info label="Vaso" value={plant.pot} />
              <Info label="Última rega" value={fmt(plant.lastWatering)} />
              <Info label="Última adubação" value={fmt(plant.lastFertilizing)} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-6">
              <p className="font-medium">Ações rápidas</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <QuickBtn icon={Droplet} label="Rega" onClick={() => quickAction("rega")} />
                <QuickBtn icon={Sparkles} label="Adubação" onClick={() => quickAction("adubacao")} />
                <QuickBtn icon={Camera} label="Foto" onClick={() => quickAction("foto")} />
                <QuickBtn icon={StickyNote} label="Observação" onClick={() => quickAction("observacao")} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "diagnosticos" && (
        <div className="space-y-3">
          {plantDiags.length === 0 ? (
            <EmptyBlock title="Nenhum diagnóstico" hint="Faça um diagnóstico para ver hipóteses e orientação.">
              <Button onClick={() => go("diagnosis", { plantId: plant.id })}>Fazer diagnóstico</Button>
            </EmptyBlock>
          ) : (
            plantDiags.map((d) => (
              <Card key={d.id}>
                <CardContent className="space-y-2 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{d.hypothesis}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{d.confidence} confiança</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Prioridade: {d.priority} · {fmt(d.date)}</p>
                  <p className="text-sm text-muted-foreground">{d.reasoning}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => go("reassessment", { plantId: plant.id })}>Atualizar diagnóstico</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "plano" && (
        <div className="space-y-3">
          {!plant.hasPlan || plantTasks.length === 0 ? (
            <EmptyBlock title="Sem plano ativo" hint="Faça um diagnóstico para gerar um plano.">
              <Button onClick={() => go("diagnosis", { plantId: plant.id })}>Iniciar diagnóstico</Button>
            </EmptyBlock>
          ) : (
            <>
              <Card>
                <CardContent className="space-y-2 pt-6">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Progresso do plano</p>
                    <span className="text-xs text-muted-foreground">{done}/{total}</span>
                  </div>
                  <Progress value={total ? (done / total) * 100 : 0} />
                  {done === total && (
                    <p role="status" aria-live="polite" className="rounded-lg bg-success-soft p-2 text-sm text-success">
                      Plano concluído. Considere reavaliar.
                    </p>
                  )}
                </CardContent>
              </Card>
              <ul className="space-y-2">
                {plantTasks.map((t) => {
                  const late = !t.done && new Date(t.dueDate) < new Date();
                  return (
                    <li key={t.id}>
                      <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => dispatch({ type: "toggleTask", id: t.id })}
                            aria-label={`Marcar ${t.title}`}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <p className={t.done ? "text-muted-foreground line-through" : "font-medium"}>{t.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {fmt(t.dueDate)} · {t.origin === "diagnostico" ? "via diagnóstico" : "manual"}
                              {late && <span className="ml-2 rounded-full bg-warning-soft px-2 py-0.5 text-warning">Atrasada</span>}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
              <Card>
                <CardContent className="space-y-1 pt-6 text-sm">
                  <p className="font-medium">Itens a evitar</p>
                  <ul className="list-inside list-disc text-muted-foreground">
                    <li>Adubar durante recuperação</li>
                    <li>Mudanças bruscas de local</li>
                  </ul>
                  <p className="pt-2 text-xs text-muted-foreground">Próxima reavaliação: em breve</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "historico" && (
        <div className="space-y-2">
          {plantHistory.length === 0 ? (
            <EmptyBlock title="Sem histórico" hint="Ações registradas aparecerão aqui." />
          ) : (
            plantHistory.map((h) => (
              <Card key={h.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{fmt(h.date)}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{h.type}</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function QuickBtn({ icon: Icon, label, onClick }: { icon: typeof Droplet; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl bg-muted p-2 text-xs font-medium hover:bg-leaf-soft"
    >
      <Icon className="h-4 w-4 text-leaf" aria-hidden />
      {label}
    </button>
  );
}

function EmptyBlock({ title, hint, children }: { title: string; hint: string; children?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-2 py-10 text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
        {children}
      </CardContent>
    </Card>
  );
}
