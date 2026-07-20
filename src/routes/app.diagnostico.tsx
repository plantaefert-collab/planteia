import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { diagnosisService, plantsService } from "@/lib/services";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { ProductRecommendationCard } from "@/components/ProductRecommendationCard";
import { mockProducts } from "@/lib/mock-data";
import type { Diagnosis, Plant } from "@/lib/types";
import { Sparkles, Info, Loader2, Plus, MessageCircle, RefreshCw } from "lucide-react";

type DiagnosticoSearch = { plantId?: string };

export const Route = createFileRoute("/app/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico · Plantae AI" }] }),
  validateSearch: (search: Record<string, unknown>): DiagnosticoSearch => ({
    plantId: typeof search.plantId === "string" ? search.plantId : undefined,
  }),
  component: DiagnosisPage,
});

type Step = "intro" | "select" | "photos" | "questions" | "loading" | "result";

function DiagnosisPage() {
  const { plantId } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });

  // Sync selection with ?plantId= in the URL
  useEffect(() => {
    if (!plants.data) return;
    if (!plantId) {
      if (selected) setSelected(null);
      return;
    }
    const found = plants.data.find((p) => p.id === plantId) ?? null;
    if (found && found.id !== selected?.id) {
      setSelected(found);
      setStep((prev) => (prev === "intro" || prev === "select" ? "photos" : prev));
    }
  }, [plantId, plants.data, selected]);

  const analyze = async () => {
    setStep("loading");
    const r = await diagnosisService.analyze({ plantId: selected?.id });
    setResult(r);
    setStep("result");
  };

  const pickPlant = (p: Plant) => {
    navigate({ to: "/app/diagnostico", search: { plantId: p.id } });
    setSelected(p);
    setStep("photos");
  };

  const pickNewPlant = () => {
    navigate({ to: "/app/diagnostico", search: {} });
    setSelected(null);
    setStep("photos");
  };


  return (
    <AppShell title="Diagnóstico">
      <div className="mx-auto max-w-lg space-y-5">
        {selected && step !== "intro" && step !== "select" && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img
              src={selected.photo}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selected.nickname}</p>
              <p className="truncate text-xs text-muted-foreground">
                {selected.species}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("select")}
              className="text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Trocar
            </Button>
          </div>
        )}

        {step === "intro" && (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-2xl border border-border bg-leaf-soft/50 p-4">
              <Info className="h-5 w-5 shrink-0 text-leaf" />
              <p className="text-sm text-foreground/90">
                O diagnóstico é uma <strong>hipótese assistida</strong> por IA. Ele ajuda
                você a decidir, mas não substitui inspeção presencial.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-semibold">
                Como funciona o diagnóstico
              </h2>
              <ol className="mt-3 space-y-2 text-sm text-foreground/90">
                <li>1. Selecione a planta cadastrada ou adicione uma nova.</li>
                <li>2. Envie até 4 fotos de ângulos diferentes.</li>
                <li>3. Responda algumas perguntas rápidas.</li>
                <li>4. Receba o plano com ações claras.</li>
              </ol>
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep("select")}>
              Começar diagnóstico
            </Button>
          </div>
        )}

        {step === "select" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Qual é a planta?</h2>
            <div className="space-y-2">
              {(plants.data ?? []).map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPlant(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-leaf"
                >
                  <img src={p.photo} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.nickname}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.species}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={pickNewPlant}

                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-3 text-left transition hover:border-leaf"
              >
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-leaf-soft text-leaf">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Nova planta (sem cadastro)</p>
              </button>
            </div>
          </div>
        )}

        {step === "photos" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Envie até 4 fotos</h2>
            <div className="grid grid-cols-2 gap-3">
              <PhotoUploader label="Planta inteira" />
              <PhotoUploader label="Folha afetada" />
              <PhotoUploader label="Raízes/substrato" />
              <PhotoUploader label="Verso da folha" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={() => setStep("questions")}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === "questions" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Algumas perguntas</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Quando começou o problema?</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dias">Nos últimos dias</SelectItem>
                    <SelectItem value="semanas">Há algumas semanas</SelectItem>
                    <SelectItem value="meses">Há meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Frequência de rega</Label>
                <Select
                  defaultValue={
                    selected?.wateringFrequencyDays
                      ? String(selected.wateringFrequencyDays)
                      : undefined
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="A cada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 5, 7, 10, 14].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        A cada {d} dias
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Substrato está…</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seco">Seco</SelectItem>
                    <SelectItem value="umido">Úmido</SelectItem>
                    <SelectItem value="encharcado">Encharcado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Observações (opcional)</Label>
                <Textarea placeholder="Insetos visíveis, produtos aplicados, mudanças recentes…" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("photos")}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={analyze}>
                <Sparkles className="h-4 w-4" /> Analisar
              </Button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-leaf-soft text-leaf">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">
              Analisando sua planta…
            </h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Cruzando fotos, sinais e histórico. Isso leva alguns segundos.
            </p>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-5">
            <DiagnosisResult d={result} />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Produtos que podem ajudar</h3>
              {mockProducts.map((p) => (
                <ProductRecommendationCard key={p.id} product={p} />
              ))}
              <p className="text-xs text-muted-foreground">
                Sempre respeite o rótulo do produto ao aplicar.
              </p>
            </div>

            <div className="flex flex-col gap-2 pb-4">
              <Button size="lg" className="w-full">
                Adicionar ao plano da planta
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link to="/app/jardineiro">
                  <MessageCircle className="h-4 w-4" /> Conversar com Jardineiro IA
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
