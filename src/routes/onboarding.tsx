import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const steps = ["Nome", "Experiência", "Plantas", "Local", "Objetivo"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plantTypes, setPlantTypes] = useState<string[]>(["Orquídeas"]);
  const progress = ((step + 1) / steps.length) * 100;

  const next = () => {
    if (step === steps.length - 1) navigate({ to: "/app/inicio" });
    else setStep(step + 1);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <header className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-leaf text-primary-foreground">
          <Leaf className="h-4 w-4" />
        </div>
        <span className="font-display text-base font-semibold">Plantae AI</span>
      </header>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground">
          Passo {step + 1} de {steps.length}
        </p>
        <Progress value={progress} className="mt-2 h-1.5" />
      </div>

      <div className="mt-8 flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Como posso te chamar?</h2>
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" placeholder="Ex.: Maria" defaultValue="Maria" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Qual seu nível?</h2>
            <RadioGroup defaultValue="iniciante" className="space-y-2">
              {[
                { v: "iniciante", l: "Iniciante — estou aprendendo" },
                { v: "intermediario", l: "Intermediário — já cuido há um tempo" },
                { v: "avancado", l: "Avançado — cultivo com técnica" },
              ].map((o) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-leaf"
                >
                  <RadioGroupItem value={o.v} />
                  <span className="text-sm">{o.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">O que você cultiva?</h2>
            <p className="text-sm text-muted-foreground">Selecione tudo que se aplica.</p>
            <div className="space-y-2">
              {["Orquídeas", "Suculentas", "Folhagens", "Rosa-do-deserto", "Ervas", "Outras"].map(
                (t) => {
                  const active = plantTypes.includes(t);
                  return (
                    <label
                      key={t}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-leaf"
                    >
                      <Checkbox
                        checked={active}
                        onCheckedChange={(v) => {
                          setPlantTypes((prev) =>
                            v ? [...prev, t] : prev.filter((p) => p !== t),
                          );
                        }}
                      />
                      <span className="text-sm">{t}</span>
                    </label>
                  );
                },
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Onde você mora?</h2>
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade / região</Label>
              <Input id="city" placeholder="Ex.: São Paulo, SP" />
            </div>
            <p className="text-xs text-muted-foreground">
              Usaremos para adaptar rega e adubação ao seu clima.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Qual seu objetivo?</h2>
            <RadioGroup defaultValue="organizar" className="space-y-2">
              {[
                { v: "recuperar", l: "🌱 Recuperar uma planta" },
                { v: "florescer", l: "🌸 Melhorar a floração" },
                { v: "organizar", l: "📅 Organizar meus cuidados" },
                { v: "aprender", l: "📖 Aprender mais" },
              ].map((o) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-leaf"
                >
                  <RadioGroupItem value={o.v} />
                  <span className="text-sm">{o.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        )}
        <Button className="flex-1" onClick={next}>
          {step === steps.length - 1 ? "Ir para o app" : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
