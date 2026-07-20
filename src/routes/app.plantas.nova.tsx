import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/app/plantas/nova")({
  head: () => ({ meta: [{ title: "Adicionar planta · Plantae AI" }] }),
  component: NewPlant,
});

const steps = ["Identificação", "Foto", "Ambiente", "Cuidados"] as const;

function NewPlant() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const progress = ((step + 1) / steps.length) * 100;

  const next = () => {
    if (step === steps.length - 1) {
      toast.success("Planta adicionada!", {
        description: "Um plano inicial foi sugerido para ela.",
      });
      navigate({ to: "/app/plantas" });
    } else setStep(step + 1);
  };

  return (
    <AppShell title="Nova planta">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="text-xs text-muted-foreground">
            Passo {step + 1} de {steps.length} · {steps[step]}
          </p>
          <Progress value={progress} className="mt-2 h-1.5" />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nick">Nome personalizado</Label>
              <Input id="nick" placeholder="Ex.: Orquídea da sala" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="species">Espécie</Label>
              <Select>
                <SelectTrigger id="species">
                  <SelectValue placeholder="Selecione (ou 'Não sei')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phalaenopsis">Phalaenopsis</SelectItem>
                  <SelectItem value="adenium">Rosa-do-deserto</SelectItem>
                  <SelectItem value="samambaia">Samambaia</SelectItem>
                  <SelectItem value="outro">Outra</SelectItem>
                  <SelectItem value="nao_sei">Não sei</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acq">Data de aquisição (opcional)</Label>
              <Input id="acq" type="date" />
            </div>
          </div>
        )}

        {step === 1 && (
          <PhotoUploader
            label="Foto da sua planta"
            hint="A luz do dia ajuda no diagnóstico"
          />
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <RadioGroup defaultValue="interno" className="grid grid-cols-2 gap-2">
                {[
                  { v: "interno", l: "Interno" },
                  { v: "externo", l: "Externo" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card p-3"
                  >
                    <RadioGroupItem value={o.v} />
                    <span className="text-sm">{o.l}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Suporte</Label>
              <RadioGroup defaultValue="vaso" className="grid grid-cols-3 gap-2">
                {[
                  { v: "vaso", l: "Vaso" },
                  { v: "canteiro", l: "Canteiro" },
                  { v: "solo", l: "Solo" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card p-3"
                  >
                    <RadioGroupItem value={o.v} />
                    <span className="text-sm">{o.l}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Luminosidade</Label>
              <Select defaultValue="indireta">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="indireta">Indireta clara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="freq">Frequência de rega atual</Label>
              <Select>
                <SelectTrigger id="freq">
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
              <Label htmlFor="pot">Tamanho do vaso</Label>
              <Input id="pot" placeholder="Ex.: 12 cm" />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          <Button className="flex-1" onClick={next}>
            {step === steps.length - 1 ? "Adicionar planta" : "Continuar"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
