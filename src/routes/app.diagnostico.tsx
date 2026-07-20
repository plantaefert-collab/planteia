import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { diagnosisService, plantsService, carePlanService } from "@/lib/services";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import type { Diagnosis, Plant, CarePlan } from "@/lib/types";
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  MessageCircle, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Diagnosis components
import { DiagnosisProgress } from "@/components/diagnosis/DiagnosisProgress";
import { DiagnosisIntentSelector } from "@/components/diagnosis/DiagnosisIntentSelector";
import { SymptomSelector } from "@/components/diagnosis/SymptomSelector";
import { GuidedPhotoUploader } from "@/components/diagnosis/GuidedPhotoUploader";
import { DynamicQuestionnaire } from "@/components/diagnosis/DynamicQuestionnaire";
import { DiagnosisReview } from "@/components/diagnosis/DiagnosisReview";

type DiagnosticoSearch = { 
  plantId?: string;
  mode?: "acompanhamento";
};

export const Route = createFileRoute("/app/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico · Plantae AI" }] }),
  validateSearch: (search: Record<string, unknown>): DiagnosticoSearch => ({
    plantId: typeof search.plantId === "string" ? search.plantId : undefined,
    mode: search.mode === "acompanhamento" ? "acompanhamento" : undefined,
  }),
  component: DiagnosisPage,
});

type Step = "intro" | "select" | "objective" | "symptom" | "photos" | "questions" | "review" | "loading" | "result";

function DiagnosisPage() {
  const { plantId, mode } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<Step>("intro");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [objective, setObjective] = useState<string>("");
  const [symptom, setSymptom] = useState<string>("");
  const [photoCount, setPhotoCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [isPlanAdded, setIsPlanAdded] = useState(false);
  const [addedPlan, setAddedPlan] = useState<CarePlan | null>(null);

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

  const analyze = async () => {
    setStep("loading");
    try {
      const r = await diagnosisService.analyze({ 
        plantId: selected?.id,
        objective,
        symptom,
        answers
      });
      setResult(r);
      setStep("result");
    } catch (error) {
      setStep("review");
      toast.error("Não foi possível concluir a análise. Tente novamente.");
    }
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
      search: (prev) => ({ ...prev, plantId: p?.id }) 
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
              onPhotosChange={setPhotoCount} 
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
              onChange={(id, val) => setAnswers(prev => ({ ...prev, [id]: val }))} 

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
              onEdit={setStep}
            />

            <Button className="w-full h-12 text-base shadow-lg shadow-leaf/20" onClick={analyze}>
              <Sparkles className="h-5 w-5 mr-2" /> Analisar Planta
            </Button>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-12 text-center shadow-sm py-20">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full border-4 border-leaf/10 border-t-leaf animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-leaf" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Analisando sua planta…
            </h3>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Cruzando os sinais, fotos, respostas e histórico da planta.
            </p>
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
