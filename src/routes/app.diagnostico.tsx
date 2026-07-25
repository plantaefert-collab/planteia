import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { diagnosisService, plantsService, carePlanService } from "@/lib/services";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import type { Diagnosis, Plant, CarePlan } from "@/lib/types";
import { diagnosisHistory, type PhotoDiagnosisHistoryEntry } from "@/lib/diagnosis-history";
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  MessageCircle, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Lightbulb,
  Camera

} from "lucide-react";
import { toast } from "sonner";

// Diagnosis components
import { DiagnosisProgress } from "@/components/diagnosis/DiagnosisProgress";
import { DiagnosisIntentSelector } from "@/components/diagnosis/DiagnosisIntentSelector";
import { SymptomSelector } from "@/components/diagnosis/SymptomSelector";
import { GuidedPhotoUploader } from "@/components/diagnosis/GuidedPhotoUploader";
import { DynamicQuestionnaire } from "@/components/diagnosis/DynamicQuestionnaire";
import { DiagnosisReview } from "@/components/diagnosis/DiagnosisReview";
import { DiagnosisFeedback } from "@/components/diagnosis/DiagnosisFeedback";

type DiagnosticoSearch = { 
  plantId?: string;
  mode?: "acompanhamento";
  direct?: string;
};

export const Route = createFileRoute("/app/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico · Plantae AI" }] }),
  validateSearch: (search: Record<string, unknown>): DiagnosticoSearch => ({
    plantId: typeof search.plantId === "string" ? search.plantId : undefined,
    mode: search.mode === "acompanhamento" ? "acompanhamento" : undefined,
    direct: typeof search.direct === "string" ? search.direct : undefined,
  }),
  loader: (ctx) => {
    return { direct: (ctx.deps as any).direct === "camera" };
  },
  loaderDeps: ({ search }) => ({ direct: search.direct }),
  component: DiagnosisPage,
});

type Step = "intro" | "select" | "objective" | "symptom" | "photos" | "questions" | "review" | "loading" | "result";

function buildHistoryTips(entry: PhotoDiagnosisHistoryEntry): { primary: string; suggestions: string[] } {
  const d = entry.diagnosis;
  const suggestions: string[] = [];
  const daysAgo = Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / 86400000);
  const photoCount = entry.photos?.length ?? 0;
  const lowConfidence = d.confidence === "baixa" || d.confidence === "moderada";

  if (photoCount < 2) {
    suggestions.push("Envie mais ângulos (folha frente/verso e raízes) para elevar a confiança.");
  }
  if (lowConfidence) {
    suggestions.push("Confiança " + d.confidence + " — refaça com luz natural e foco na área afetada.");
  }
  if (!entry.symptom) {
    suggestions.push("Descreva o sintoma principal antes de refazer para orientar a análise.");
  }
  if (daysAgo >= (d.reevaluateInDays ?? 7)) {
    suggestions.push(`Já se passaram ${daysAgo} dia(s) — hora de reavaliar e comparar a evolução.`);
  } else if (daysAgo >= 1) {
    suggestions.push(`Reavalie em ${Math.max(1, (d.reevaluateInDays ?? 7) - daysAgo)} dia(s) para medir melhora.`);
  }
  if (d.status === "atencao" && (d.urgencySigns?.length ?? 0) > 0) {
    suggestions.push("Fique atento aos sinais de urgência listados no resultado.");
  }

  const primary =
    d.status === "atencao"
      ? "Requer ação — compare com a próxima foto para ver evolução."
      : d.status === "acompanhamento"
        ? "Em observação — mantenha o cronograma e refaça se houver mudança."
        : "Quadro saudável — refaça só se surgirem novos sinais.";

  return { primary, suggestions: suggestions.slice(0, 2) };
}



function DiagnosisPage() {
  const { plantId, mode } = Route.useSearch();
  const { direct } = Route.useLoaderData() as { direct: boolean };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<Step>("intro");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [objective, setObjective] = useState<string>("");
  const [symptom, setSymptom] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const photoCount = photos.length;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [isPlanAdded, setIsPlanAdded] = useState(false);
  const [addedPlan, setAddedPlan] = useState<CarePlan | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<"upload" | "analyzing" | "finalizing" | "error">("upload");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [history, setHistory] = useState<PhotoDiagnosisHistoryEntry[]>([]);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Trigger camera on landing if direct=camera is present
  useEffect(() => {
    if (direct && step === "intro" && !photos.length) {
      cameraInputRef.current?.click();
    }
  }, [direct, step, photos.length]);


  const handleQuickCapture = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      setPhotos((prev) => [...prev, dataUrl]);
      if (!objective) setObjective("identificar");
      setStep(selected ? "symptom" : "select");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setHistory(diagnosisHistory.list());
    
    // Permission check
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        if (result.state === "denied") setCameraPermissionDenied(true);
        result.onchange = () => setCameraPermissionDenied(result.state === "denied");
      }).catch(() => {});
    }

  }, []);

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
    }
  }, [plantId, plants.data, selected]);

  const analyze = async (override?: {
    plant?: Plant | null;
    objective?: string;
    symptom?: string;
    photos?: string[];
    answers?: Record<string, any>;
  }) => {
    const _plant = override?.plant !== undefined ? override.plant : selected;
    const _objective = override?.objective ?? objective;
    const _symptom = override?.symptom ?? symptom;
    const _photos = override?.photos ?? photos;
    const _answers = override?.answers ?? answers;

    setStep("loading");
    setAnalysisError(null);
    setAnalysisProgress(0);
    setAnalysisPhase(_photos.length > 0 ? "upload" : "analyzing");

    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed < 800 && _photos.length > 0) {
        setAnalysisProgress((p) => Math.min(25, p + 5));
      } else {
        setAnalysisPhase((prev) => (prev === "upload" ? "analyzing" : prev));
        setAnalysisProgress((p) => Math.min(90, p + 3));
      }
    }, 200);

    try {
      const r = await diagnosisService.analyze({
        plantId: _plant?.id,
        plantSpecies: _plant?.species,
        objective: _objective,
        symptom: _symptom,
        photos: _photos,
        answers: _answers,
      });
      clearInterval(timer);
      setAnalysisPhase("finalizing");
      setAnalysisProgress(100);
      setResult(r);
      if (photos.length > 0) {
        try {
          diagnosisHistory.add({
            plantId: selected?.id,
            plantNickname: selected?.nickname,
            plantSpecies: selected?.species,
            symptom,
            objective,
            answers,
            photos,
            diagnosis: r,
          });
          setHistory(diagnosisHistory.list());
        } catch { /* ignore storage errors */ }
      }
      setTimeout(() => setStep("result"), 300);
    } catch (error) {
      clearInterval(timer);
      setAnalysisPhase("error");
      const code = (error as { code?: string })?.code;
      const friendly =
        code === "schema_mismatch"
          ? "A IA não conseguiu estruturar um diagnóstico confiável desta foto. Tente reenviar com uma imagem mais nítida, bem iluminada e focando a região afetada (folha, raiz ou pseudobulbo)."
          : error instanceof Error
          ? error.message
          : "Erro desconhecido";
      setAnalysisError(friendly);
      toast.error("Não foi possível concluir a análise.");
    }
  };

  const viewHistoryEntry = (entry: PhotoDiagnosisHistoryEntry) => {
    const plant = plants.data?.find((p) => p.id === entry.plantId) ?? null;
    setSelected(plant);
    setObjective(entry.objective ?? "");
    setSymptom(entry.symptom ?? "");
    setPhotos(entry.photos);
    setAnswers((entry.answers as Record<string, any>) ?? {});
    setResult(entry.diagnosis);
    setIsPlanAdded(false);
    setStep("result");
  };

  const rerunHistoryEntry = async (entry: PhotoDiagnosisHistoryEntry) => {
    const plant = plants.data?.find((p) => p.id === entry.plantId) ?? null;
    setSelected(plant);
    setObjective(entry.objective ?? "");
    setSymptom(entry.symptom ?? "");
    setPhotos(entry.photos);
    setAnswers((entry.answers as Record<string, any>) ?? {});
    await analyze({
      plant,
      objective: entry.objective ?? "",
      symptom: entry.symptom ?? "",
      photos: entry.photos,
      answers: (entry.answers as Record<string, any>) ?? {},
    });
  };

  const removeHistoryEntry = (id: string) => {
    diagnosisHistory.remove(id);
    setHistory(diagnosisHistory.list());
    toast.success("Diagnóstico removido do histórico.");
  };

  const addToPlan = async () => {
    if (!selected || !result) {
      toast.error("Para salvar o plano, a planta precisa estar cadastrada.");
      return;
    }
    
    try {
      const plan = await carePlanService.createFromDiagnosis(selected.id, result);
      setAddedPlan(plan);
      setIsPlanAdded(true);
      toast.success("Plano adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar o plano.");
    }
  };

  const handlePlantSelect = (p: Plant | null) => {
    setSelected(p);
    navigate({ 
      to: "/app/diagnostico", 
      search: (prev: any) => ({ ...prev, plantId: p?.id }) 
    });
    setStep("objective");
  };

  const nextStep = () => {
    const steps: Step[] = ["intro", "select", "objective", "symptom", "photos", "questions", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["intro", "select", "objective", "symptom", "photos", "questions", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return (
    <AppShell 
      title="Diagnóstico"
      left={step !== "intro" && step !== "result" && step !== "loading" ? (
        <Button variant="ghost" size="icon" onClick={prevStep}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ) : undefined}
    >
      <div className="mx-auto max-w-lg space-y-6 pb-20">
        <DiagnosisProgress current={step} />

        {selected && step !== "select" && step !== "loading" && step !== "result" && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <img
              src={selected.photo}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
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
              className="text-xs h-8 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Trocar
            </Button>
          </div>
        )}

        {step === "intro" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-leaf-dark">
                O que você deseja fazer hoje?
              </h2>
              <p className="text-muted-foreground">
                O assistente inteligente ajuda você a tomar a melhor decisão para o cuidado das suas plantas.
              </p>
            </div>

            {cameraPermissionDenied ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-semibold text-sm">Câmera bloqueada</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para diagnosticar por foto, você precisa permitir o acesso à câmera nas configurações do seu navegador ou dispositivo. Caso a câmera não funcione, você pode selecionar uma foto da sua galeria.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      setCameraPermissionDenied(false);
                      cameraInputRef.current?.click();
                    }}
                  >
                    Tentar abrir câmera
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-8 underline"
                    onClick={() => {
                      toast.info("Geralmente fica no ícone de 'cadeado' ou 'ajustes' na barra de endereços do seu navegador.", {
                        duration: 7000,
                      });
                    }}
                  >
                    Como ajustar?
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex w-full items-center gap-4 rounded-2xl border-2 border-leaf bg-leaf p-4 text-left text-leaf-foreground shadow-sm transition hover:bg-leaf-dark focus:outline-none focus:ring-2 focus:ring-leaf/40"
                >
                  <div className="rounded-xl bg-white/15 p-2.5">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Tirar foto agora</h3>
                    <p className="text-xs opacity-90">Abre a câmera direto — o questionário vem depois. Você poderá adicionar mais fotos durante o processo.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-80" />
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    handleQuickCapture(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  onError={() => setCameraPermissionDenied(true)}
                />
              </>
            )}


            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">ou</span>
              </div>
            </div>

            <DiagnosisIntentSelector onSelect={(id) => {
              setObjective(id);
              if (plantId && selected) {
                setStep("symptom");
              } else {
                setStep("select");
              }
            }} />


            <div className="flex gap-3 rounded-2xl border border-leaf/10 bg-leaf-soft/40 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-leaf" />
              <p className="text-xs text-leaf-dark leading-relaxed">
                Este diagnóstico é uma <strong>hipótese assistida</strong>. Ele ajuda na decisão, mas não substitui a observação constante.
              </p>
            </div>

            {history.length > 0 && (
              <section className="space-y-3" aria-label="Diagnósticos recentes">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-leaf" />
                    Últimos diagnósticos por foto
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      diagnosisHistory.clear();
                      setHistory([]);
                      toast.success("Histórico limpo.");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
                <ul className="space-y-2">
                  {history.map((entry) => {
                    const when = new Date(entry.createdAt);
                    const dateLabel = when.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const { primary, suggestions } = buildHistoryTips(entry);
                    return (
                      <li
                        key={entry.id}
                        className="rounded-2xl border border-border bg-card p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {entry.thumbnail ? (
                            <img
                              src={entry.thumbnail}
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-leaf-soft text-leaf">
                              <Sparkles className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {entry.diagnosis.mainSuspicion ?? "Diagnóstico"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {entry.plantNickname ?? entry.plantSpecies ?? "Sem planta cadastrada"} · {dateLabel}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Ver diagnóstico"
                              onClick={() => viewHistoryEntry(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Refazer diagnóstico"
                              onClick={() => rerunHistoryEntry(entry)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remover do histórico"
                              onClick={() => removeHistoryEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl bg-leaf-soft/40 p-2.5">
                          <p className="flex items-start gap-1.5 text-xs font-medium text-foreground">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" aria-hidden />
                            <span>{primary}</span>
                          </p>
                          {suggestions.length > 0 && (
                            <ul className="mt-1.5 space-y-1 pl-5 text-xs text-muted-foreground">
                              {suggestions.map((s, i) => (
                                <li key={i} className="list-disc marker:text-leaf">{s}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}

        {step === "select" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-semibold">Escolha a planta</h2>
            <div className="grid gap-3">
              {(plants.data ?? []).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlantSelect(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-leaf shadow-sm"
                >
                  <img src={p.photo} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.nickname}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.species}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </button>
              ))}
              <button
                onClick={() => handlePlantSelect(null)}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-left transition hover:border-leaf group"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-soft text-leaf group-hover:bg-leaf group-hover:text-white transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Avaliar sem cadastro</p>
                  <p className="text-[11px] text-muted-foreground">O resultado não será salvo automaticamente</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "objective" && (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-leaf-soft flex items-center justify-center text-leaf mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-semibold">Planta selecionada!</h2>
            <p className="text-sm text-muted-foreground px-4">
              Agora, escolha o objetivo desta avaliação para {selected?.nickname || "sua planta"}.
            </p>
            <div className="mt-4 pt-4">
              <DiagnosisIntentSelector onSelect={(id) => {
                setObjective(id);
                setStep("symptom");
              }} />
            </div>
          </div>
        )}

        {step === "symptom" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold">O que você está observando?</h2>
              <p className="text-sm text-muted-foreground">
                Selecione o sinal mais evidente no momento.
              </p>
            </div>
            
            <SymptomSelector 
              selected={symptom} 
              onSelect={(id) => {
                setSymptom(id);
                nextStep();
              }} 
            />
          </div>
        )}

        {step === "photos" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold">Fotos guiadas</h2>
              <p className="text-sm text-muted-foreground">
                As fotos ajudam a IA a identificar sinais que você pode não ter notado.
              </p>
            </div>
            
            <GuidedPhotoUploader
              symptom={symptom}
              onPhotosChange={setPhotos}
              initialPhotos={photos}
            />

            <Button className="w-full h-12 text-base" onClick={nextStep}>
              Continuar
            </Button>
          </div>
        )}

        {step === "questions" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold">Perguntas rápidas</h2>
              <p className="text-sm text-muted-foreground">
                Ajude-nos a entender o ambiente da sua planta.
              </p>
            </div>
            
            <DynamicQuestionnaire 
              symptom={symptom} 
              answers={answers} 
              onChange={(id, val) => setAnswers((prev: Record<string, any>) => ({ ...prev, [id]: val }))} 

            />

            <Button className="w-full h-12 text-base" onClick={nextStep}>
              Revisar e Analisar
            </Button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6">
            <DiagnosisReview 
              plant={selected}
              objective={objective}
              symptom={symptom}
              photoCount={photoCount}
              answers={answers}
              onEdit={(s) => setStep(s as Step)}
            />

            <Button className="w-full h-12 text-base shadow-lg shadow-leaf/20" onClick={() => analyze()}>
              <Sparkles className="h-5 w-5 mr-2" /> Analisar Planta
            </Button>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-sm py-12">
            {analysisPhase === "error" ? (
              <>
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Falha na análise
                </h3>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
                  {analysisError ?? "Não foi possível concluir. Verifique a conexão e tente novamente."}
                </p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                  <Button onClick={() => analyze()}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
                  </Button>
                  <Button variant="ghost" onClick={() => setStep("review")}>
                    Voltar à revisão
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-4 border-leaf/10 border-t-leaf animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-leaf" />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  {analysisPhase === "upload"
                    ? "Enviando fotos…"
                    : analysisPhase === "analyzing"
                    ? "Analisando sua planta…"
                    : "Finalizando diagnóstico…"}
                </h3>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
                  {analysisPhase === "upload"
                    ? "Preparando as imagens para a IA."
                    : analysisPhase === "analyzing"
                    ? "A IA está cruzando sinais visuais, sintomas e respostas."
                    : "Organizando hipóteses e plano de cuidados."}
                </p>

                <div className="mt-6 w-full max-w-xs">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-leaf transition-all duration-300 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                    {analysisProgress}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isPlanAdded ? (
              <div className="rounded-3xl border border-success/20 bg-success-soft/30 p-6 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 bg-success-soft rounded-full flex items-center justify-center text-success mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Plano adicionado com sucesso!</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Criamos {addedPlan?.tasks.length} cuidados e uma reavaliação para daqui a 7 dias.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button size="lg" className="w-full" asChild>
                    <Link to="/app/plantas/$id" params={{ id: selected?.id || "p1" }} search={{ tab: "plano" }}>
                      Ver plano da planta
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setIsPlanAdded(false)}>
                    Continuar lendo o diagnóstico
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DiagnosisResult d={result} />

                <DiagnosisFeedback diagnosisId={result.id} />

                
                <div className="flex flex-col gap-3 pb-4">
                  <Button size="lg" className="w-full shadow-lg shadow-leaf/20" onClick={addToPlan}>
                    <Plus className="h-5 w-5 mr-2" /> Adicionar ao plano da planta
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/app/jardineiro">
                      <MessageCircle className="h-5 w-5 mr-2" /> Conversar com Jardineiro IA
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setStep("intro")} className="text-muted-foreground">
                    Refazer diagnóstico
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
