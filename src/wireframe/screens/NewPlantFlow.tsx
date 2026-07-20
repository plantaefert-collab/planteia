import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useDemo } from "../DemoState";

const steps = ["Foto", "Nome", "Espécie", "Ambiente", "Luminosidade", "Rega", "Vaso", "Revisão"];

export function NewPlantFlow() {
  const { dispatch, go } = useDemo();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    species: "",
    environment: "Sala",
    light: "Indireta",
    waterFreq: "A cada 7 dias",
    pot: "Vaso com drenagem",
    photo: "🌱",
  });

  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData({ ...data, [k]: v });

  const confirm = () => {
    const id = `p-${Date.now()}`;
    dispatch({
      type: "addPlant",
      plant: {
        id,
        name: data.name || "Nova planta",
        species: data.species || "Espécie não identificada",
        status: "sem_diagnostico",
        photo: data.photo,
        environment: data.environment,
        light: data.light,
        waterFreq: data.waterFreq,
        pot: data.pot,
        hasPlan: false,
      },
    });
    go("plantDetail", { id });
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Passo {step + 1} de {steps.length} — {steps[step]}</p>
        <Progress value={((step + 1) / steps.length) * 100} />
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Escolha uma foto ilustrativa</Label>
              <div className="grid grid-cols-6 gap-2">
                {["🌱", "🌸", "🌵", "🌿", "🌺", "🪴"].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => set("photo", e)}
                    aria-pressed={data.photo === e}
                    className={`min-h-11 rounded-xl border p-2 text-3xl ${data.photo === e ? "border-leaf bg-leaf-soft" : "border-border"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Upload real desativado nesta demonstração.</p>
            </div>
          )}
          {step === 1 && <Field label="Nome personalizado" value={data.name} onChange={(v) => set("name", v)} placeholder="Ex.: Íris" />}
          {step === 2 && <Field label="Espécie" value={data.species} onChange={(v) => set("species", v)} placeholder="Ex.: Orquídea Phalaenopsis" />}
          {step === 3 && <Choice label="Ambiente" value={data.environment} onChange={(v) => set("environment", v)} options={["Sala", "Quarto", "Cozinha", "Varanda", "Escritório"]} />}
          {step === 4 && <Choice label="Luminosidade" value={data.light} onChange={(v) => set("light", v)} options={["Baixa", "Indireta", "Indireta forte", "Sol pleno"]} />}
          {step === 5 && <Choice label="Frequência de rega" value={data.waterFreq} onChange={(v) => set("waterFreq", v)} options={["A cada 3 dias", "A cada 7 dias", "A cada 10 dias", "Quando o substrato secar"]} />}
          {step === 6 && <Choice label="Vaso e drenagem" value={data.pot} onChange={(v) => set("pot", v)} options={["Vaso com drenagem", "Cerâmica com drenagem", "Vaso transparente", "Plástico sem drenagem"]} />}
          {step === 7 && (
            <div className="space-y-2 text-sm">
              <p className="font-medium">Revisão</p>
              {Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border py-1.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Anterior</Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Continuar</Button>
        ) : (
          <Button onClick={confirm}>Confirmar e adicionar</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${value === o ? "border-leaf bg-leaf-soft" : "border-border"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
