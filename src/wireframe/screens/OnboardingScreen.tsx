import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDemo } from "../DemoState";

const steps = [
  { title: "Qual seu objetivo principal?", options: ["Cuidar melhor", "Diagnosticar problemas", "Aprender do zero", "Manter rotina"] },
  { title: "Qual seu nível de experiência?", options: ["Iniciante", "Intermediário", "Avançado"] },
  { title: "Que tipos de plantas você cultiva?", options: ["Orquídeas", "Suculentas", "Folhagens", "Frutíferas"], multi: true },
  { title: "Como prefere receber lembretes?", options: ["Diários", "Semanais", "Somente quando necessário"] },
];

export function OnboardingScreen() {
  const { go } = useDemo();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const toggle = (opt: string) => {
    const curr = answers[step] ?? [];
    const next = current.multi
      ? curr.includes(opt) ? curr.filter((x) => x !== opt) : [...curr, opt]
      : [opt];
    setAnswers({ ...answers, [step]: next });
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Passo {step + 1} de {steps.length}</p>
        <Progress value={((step + 1) / steps.length) * 100} />
      </div>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-display text-xl">{current.title}</h2>
          <div className="grid gap-2">
            {current.options.map((opt) => {
              const active = (answers[step] ?? []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  aria-pressed={active}
                  className={`min-h-11 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                    active ? "border-leaf bg-leaf-soft text-leaf" : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Anterior</Button>
        {isLast ? (
          <Button onClick={() => go("dashboard")}>Concluir</Button>
        ) : (
          <Button onClick={() => setStep(step + 1)}>Continuar</Button>
        )}
      </div>
    </div>
  );
}
