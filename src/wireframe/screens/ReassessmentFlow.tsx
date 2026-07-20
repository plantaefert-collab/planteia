import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { useDemo } from "../DemoState";

export function ReassessmentFlow() {
  const { state, nav, dispatch, go } = useDemo();
  const plantId = nav.params.plantId ?? state.plants.find((p) => p.hasPlan)?.id;
  const plant = state.plants.find((p) => p.id === plantId);
  const previous = plant ? state.diagnoses.filter((d) => d.plantId === plant.id).slice(-1)[0] : undefined;

  const [progress, setProgress] = useState<"melhorou" | "igual" | "piorou" | "">("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(false);
  const [done, setDone] = useState(false);

  if (!plant) {
    return (
      <Card><CardContent className="space-y-2 py-8 text-center">
        <p className="font-medium">Nenhuma planta em acompanhamento</p>
        <Button onClick={() => go("plants")}>Voltar</Button>
      </CardContent></Card>
    );
  }

  const finalize = () => {
    const now = new Date().toISOString();
    dispatch({
      type: "addHistory",
      entry: { id: `h-${Date.now()}`, plantId: plant.id, type: "diagnostico", title: `Reavaliação: ${progress}`, date: now, note },
    });
    dispatch({
      type: "updatePlant",
      id: plant.id,
      patch: { status: progress === "melhorou" ? "saudavel" : progress === "piorou" ? "atencao" : "acompanhamento" },
    });
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl">Reavaliar {plant.name}</h1>

      {previous && (
        <Card>
          <CardContent className="space-y-1 pt-6 text-sm">
            <p className="font-medium">Diagnóstico anterior</p>
            <p>{previous.hypothesis}</p>
            <p className="text-xs text-muted-foreground">Orientação: {previous.doNow.slice(0, 2).join(" · ")}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="font-medium">Nova foto</p>
          <button
            onClick={() => setPhoto(true)}
            className="flex min-h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted"
          >
            <Camera className="h-5 w-5" aria-hidden /> {photo ? "Foto adicionada" : "Adicionar foto"}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <p className="font-medium">Como está evoluindo?</p>
          {(["melhorou", "igual", "piorou"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setProgress(k)}
              aria-pressed={progress === k}
              className={`min-h-11 w-full rounded-xl border px-3 py-2 text-left capitalize ${progress === k ? "border-leaf bg-leaf-soft" : "border-border"}`}
            >
              {k}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <label htmlFor="what" className="font-medium">O que você realizou?</label>
          <Textarea id="what" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      {!done ? (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => go("plantDetail", { id: plant.id })}>Cancelar</Button>
          <Button disabled={!progress} onClick={finalize}>Registrar reavaliação</Button>
        </div>
      ) : (
        <Card className="border-success/40 bg-success-soft">
          <CardContent className="space-y-2 pt-6" role="status" aria-live="polite">
            <p className="font-medium text-success">
              {progress === "melhorou" ? "Ótima evolução! Plano ajustado." : progress === "piorou" ? "Recomendamos novo diagnóstico." : "Estabilidade — mantenha os cuidados."}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => go("plantDetail", { id: plant.id })}>Ver planta</Button>
              {progress === "piorou" && <Button size="sm" variant="secondary" onClick={() => go("diagnosis", { plantId: plant.id })}>Novo diagnóstico</Button>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
