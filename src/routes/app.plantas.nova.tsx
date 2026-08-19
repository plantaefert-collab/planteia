import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { plantsService } from "@/lib/services";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/plantas/nova")({
  head: () => ({ meta: [{ title: "Adicionar planta · Plantae AI" }] }),
  component: NewPlant,
});

const steps = ["Identificação", "Foto", "Ambiente", "Cuidados"] as const;

const especies = [
  { v: "Phalaenopsis", l: "Phalaenopsis" },
  { v: "Rosa-do-deserto", l: "Rosa-do-deserto" },
  { v: "Samambaia", l: "Samambaia" },
  { v: "Suculenta", l: "Suculenta" },
  { v: "Outra", l: "Outra" },
  { v: "Não sei", l: "Não sei" },
];

function NewPlant() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session, loading } = useAuth();

  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState("");
  const [acquiredAt, setAcquiredAt] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<"interno" | "externo">("interno");
  const [light, setLight] = useState<"baixa" | "media" | "alta" | "indireta">("indireta");
  const [wateringDays, setWateringDays] = useState<string>("");
  const [potSize, setPotSize] = useState("");

  const progress = ((step + 1) / steps.length) * 100;
  const podeAvancar = step !== 0 || nickname.trim().length > 0;

  const salvar = async () => {
    setSaving(true);
    try {
      let photoUrl: string | undefined;
      if (photo) {
        photoUrl = await plantsService.uploadPhoto(photo);
      }
      await plantsService.create({
        nickname: nickname.trim(),
        species: species || undefined,
        photo: photoUrl,
        environment,
        light,
        potSize: potSize || undefined,
        wateringFrequencyDays: wateringDays ? Number(wateringDays) : undefined,
        acquiredAt: acquiredAt || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["plants"] });
      toast.success("Planta adicionada!", { description: "Ela já está salva na sua conta." });
      navigate({ to: "/app/plantas" });
    } catch (err) {
      toast.error("Não consegui salvar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
      setSaving(false);
    }
  };

  const next = () => {
    if (step === steps.length - 1) salvar();
    else setStep(step + 1);
  };

  if (!loading && !session) {
    return (
      <AppShell title="Nova planta">
        <div className="mx-auto max-w-lg">
          <div className="flex items-start gap-3 rounded-2xl border border-leaf/20 bg-leaf-soft/40 p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
            <div className="text-sm">
              <p className="font-medium text-leaf-dark">Entre para cadastrar suas plantas</p>
              <p className="mt-1 text-muted-foreground">
                Você está na demonstração. Crie sua conta para guardar suas plantas de verdade —
                elas ficam salvas e disponíveis em qualquer aparelho.
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link to="/auth/signup">Criar conta</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/auth/login">Entrar</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

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
              <Label htmlFor="nick">Nome personalizado *</Label>
              <Input
                id="nick"
                placeholder="Ex.: Orquídea da sala"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="species">Espécie</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger id="species">
                  <SelectValue placeholder="Selecione (ou 'Não sei')" />
                </SelectTrigger>
                <SelectContent>
                  {especies.map((e) => (
                    <SelectItem key={e.v} value={e.v}>
                      {e.l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acq">Data de aquisição (opcional)</Label>
              <Input
                id="acq"
                type="date"
                value={acquiredAt}
                onChange={(e) => setAcquiredAt(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <PhotoUploader
            label="Foto da sua planta"
            hint="A luz do dia ajuda no diagnóstico"
            onUpload={(url) => setPhoto(url)}
            initialPreview={photo ?? undefined}
          />
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <RadioGroup
                value={environment}
                onValueChange={(v) => setEnvironment(v as "interno" | "externo")}
                className="grid grid-cols-2 gap-2"
              >
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
              <Label>Luminosidade</Label>
              <Select value={light} onValueChange={(v) => setLight(v as typeof light)}>
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
              <Select value={wateringDays} onValueChange={setWateringDays}>
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
              <Input
                id="pot"
                placeholder="Ex.: 12 cm"
                value={potSize}
                onChange={(e) => setPotSize(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
              disabled={saving}
            >
              Voltar
            </Button>
          )}
          <Button className="flex-1" onClick={next} disabled={saving || !podeAvancar}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === steps.length - 1 ? "Adicionar planta" : "Continuar"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
