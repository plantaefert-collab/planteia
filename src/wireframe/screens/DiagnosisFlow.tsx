import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Check, Camera, X } from "lucide-react";
import { useDemo } from "../DemoState";
import { symptomOptions } from "../mockData";

type Step = "plant" | "objective" | "symptom" | "photos" | "questions" | "review" | "loading" | "result" | "error";

const questionSets: Record<string, string[]> = {
  default: ["Com que frequência você tem regado?", "O substrato está seco na superfície?", "Como está a luminosidade?", "Alguma mudança recente?"],
};

export function DiagnosisFlow() {
  const { state, nav, dispatch, go, buildScenarioDiagnosis, buildTasksFromDiagnosis } = useDemo();
  const [step, setStep] = useState<Step>("plant");
  const [plantId, setPlantId] = useState<string | undefined>(nav.params.plantId ?? nav.params.id);
  const [noPlant, setNoPlant] = useState(false);
  const [objective, setObjective] = useState<string>("");
  const [symptom, setSymptom] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedDiag, setSavedDiag] = useState(false);

  const diagnosis = useMemo(() => {
    if (step !== "result" && step !== "loading") return null;
    return buildScenarioDiagnosis(plantId ?? "temp", symptom ? [symptom] : []);
  }, [step, plantId, symptom, buildScenarioDiagnosis]);

  const questions = questionSets.default;

  const requiredPhotos = objective === "completa" ? 2 : objective === "acompanhar" ? 1 : 0;
  const canProceedPhotos = photos.length >= requiredPhotos;

  const startAnalysis = () => {
    setStep("loading");
    setTimeout(() => setStep("result"), 1200);
  };

  const addToPlan = () => {
    if (!diagnosis || !plantId) return;
    const tasks = buildTasksFromDiagnosis(diagnosis);
    dispatch({ type: "addDiagnosis", diagnosis, tasks });
    setSavedDiag(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="space-y-1">
        <h1 className="font-display text-2xl">Diagnóstico guiado</h1>
        <StepProgress step={step} />
      </header>

      {step === "plant" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">Selecione uma planta</p>
            <div className="grid gap-2">
              {state.plants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPlantId(p.id); setNoPlant(false); }}
                  aria-pressed={plantId === p.id && !noPlant}
                  className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left ${plantId === p.id && !noPlant ? "border-leaf bg-leaf-soft" : "border-border"}`}
                >
                  <span className="text-2xl">{p.photo}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.species}</span>
                  </span>
                </button>
              ))}
              <button
                onClick={() => { setNoPlant(true); setPlantId(undefined); }}
                aria-pressed={noPlant}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left ${noPlant ? "border-leaf bg-leaf-soft" : "border-border"}`}
              >
                Avaliar sem cadastrar planta
              </button>
            </div>
            <Button className="w-full" disabled={!plantId && !noPlant} onClick={() => setStep("objective")}>Continuar</Button>
          </CardContent>
        </Card>
      )}

      {step === "objective" && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <p className="font-medium">Qual seu objetivo?</p>
            {[
              { k: "problema", label: "Identificar um problema" },
              { k: "completa", label: "Fazer avaliação completa" },
              { k: "acompanhar", label: "Acompanhar diagnóstico anterior" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setObjective(o.k)}
                aria-pressed={objective === o.k}
                className={`min-h-11 w-full rounded-xl border px-3 py-2 text-left ${objective === o.k ? "border-leaf bg-leaf-soft" : "border-border"}`}
              >
                {o.label}
              </button>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep("plant")}>Voltar</Button>
              <Button disabled={!objective} onClick={() => setStep("symptom")}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "symptom" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">Qual sinal você observou?</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {symptomOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymptom(s)}
                  aria-pressed={symptom === s}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-xs ${symptom === s ? "border-leaf bg-leaf-soft" : "border-border"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep("objective")}>Voltar</Button>
              <Button disabled={!symptom} onClick={() => setStep("photos")}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "photos" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">Fotos guiadas</p>
            <p className="text-sm text-muted-foreground">
              Recomendado: planta inteira, área afetada, raízes/substrato e foto complementar.
              {requiredPhotos > 0 && ` Este objetivo exige ${requiredPhotos} foto(s).`}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border bg-muted">
                  {photos[i] ? (
                    <div className="relative h-full w-full">
                      <div className="flex h-full w-full items-center justify-center text-3xl">{photos[i]}</div>
                      <button
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        aria-label="Remover foto"
                        className="absolute right-1 top-1 rounded-full bg-card p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPhotos([...photos, "📷"])}
                      className="flex h-full w-full min-h-11 items-center justify-center text-muted-foreground"
                      aria-label={`Adicionar foto ${i + 1}`}
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {photos.length < requiredPhotos && (
              <p role="status" aria-live="polite" className="rounded-lg bg-warning-soft p-2 text-xs text-warning">
                Faltam fotos para este objetivo — a confiança pode ficar reduzida.
              </p>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep("symptom")}>Voltar</Button>
              <Button onClick={() => setStep("questions")} disabled={requiredPhotos > 0 && !canProceedPhotos}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "questions" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">Perguntas rápidas</p>
            {questions.map((q, i) => (
              <div key={i} className="space-y-1">
                <label htmlFor={`q-${i}`} className="text-sm">{q}</label>
                <Textarea id={`q-${i}`} value={answers[i] ?? ""} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })} rows={2} />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep("photos")}>Voltar</Button>
              <Button onClick={() => setStep("review")}>Revisar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardContent className="space-y-2 pt-6 text-sm">
            <p className="font-medium">Revisão</p>
            <Row label="Planta" value={noPlant ? "Sem cadastro" : state.plants.find((p) => p.id === plantId)?.name ?? "—"} />
            <Row label="Objetivo" value={objective} />
            <Row label="Sintoma" value={symptom} />
            <Row label="Fotos" value={String(photos.length)} />
            <Row label="Respostas" value={String(Object.keys(answers).length)} />
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep("questions")}>Editar</Button>
              <Button onClick={startAnalysis}>Analisar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "loading" && (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <div className="text-4xl">🌿</div>
            <p className="font-medium">Analisando (demonstração)</p>
            <p className="text-sm text-muted-foreground">Isso não usa IA real.</p>
            <Progress value={70} />
            <Button variant="ghost" size="sm" onClick={() => setStep("error")}>Simular erro</Button>
          </CardContent>
        </Card>
      )}

      {step === "error" && (
        <Card className="border-destructive/40">
          <CardContent className="space-y-3 py-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" aria-hidden />
            <p className="font-medium">Falha simulada na análise</p>
            <Button onClick={startAnalysis}>Tentar novamente</Button>
          </CardContent>
        </Card>
      )}

      {step === "result" && diagnosis && (
        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-xl">{diagnosis.hypothesis}</p>
                <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-xs text-leaf">{diagnosis.confidence} confiança</span>
              </div>
              <p className="text-xs text-muted-foreground">Prioridade: {diagnosis.priority}</p>
              <p className="text-sm">{diagnosis.reasoning}</p>
            </CardContent>
          </Card>

          <ResultSection title="O que fazer agora" items={diagnosis.doNow} tone="success" />
          <ResultSection title="O que evitar" items={diagnosis.avoid} tone="warning" />
          <ResultSection title="O que observar" items={diagnosis.observe} />
          <ResultSection title="Sinais de melhora" items={diagnosis.improvementSigns} tone="success" />
          <ResultSection title="Sinais de alerta" items={diagnosis.alertSigns} tone="warning" />

          <Card>
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
              <TimelineBox title="Hoje" items={diagnosis.timeline.today} />
              <TimelineBox title="Em 3 dias" items={diagnosis.timeline.day3} />
              <TimelineBox title="Em 7 dias" items={diagnosis.timeline.day7} />
            </CardContent>
          </Card>

          {!savedDiag ? (
            <div className="flex flex-wrap gap-2">
              {plantId && <Button onClick={addToPlan}><Check className="mr-1 h-4 w-4" /> Adicionar ao plano da planta</Button>}
              <Button variant="ghost" onClick={() => go("dashboard")}>Continuar lendo</Button>
            </div>
          ) : (
            <Card className="border-success/40 bg-success-soft">
              <CardContent className="space-y-2 pt-6" role="status" aria-live="polite">
                <p className="font-medium text-success">Diagnóstico e tarefas adicionados ao plano.</p>
                <div className="flex flex-wrap gap-2">
                  {plantId && <Button size="sm" onClick={() => go("plantDetail", { id: plantId, tab: "plano" })}>Ver plano da planta</Button>}
                  <Button size="sm" variant="ghost" onClick={() => go("dashboard")}>Continuar lendo</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StepProgress({ step }: { step: Step }) {
  const order: Step[] = ["plant", "objective", "symptom", "photos", "questions", "review", "loading", "result"];
  const idx = Math.max(0, order.indexOf(step));
  return <Progress value={((idx + 1) / order.length) * 100} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ResultSection({ title, items, tone }: { title: string; items: string[]; tone?: "success" | "warning" }) {
  const cls = tone === "success" ? "bg-success-soft" : tone === "warning" ? "bg-warning-soft" : "bg-muted";
  return (
    <Card>
      <CardContent className={`space-y-1 pt-6`}>
        <p className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{title}</p>
        <ul className="list-inside list-disc text-sm text-foreground">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

function TimelineBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="list-inside list-disc text-sm">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
