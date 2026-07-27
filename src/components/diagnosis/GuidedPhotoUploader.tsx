import { useState } from "react";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface PhotoRequirement {
  id: string;
  label: string;
  instruction: string;
  required?: boolean;
}

const requirementsBySymptom: Record<string, PhotoRequirement[]> = {
  folhas_amarelas: [
    { id: "inteira", label: "Planta inteira", instruction: "Recomendada para ver o porte", required: true },
    { id: "perto", label: "Folha de perto", instruction: "Foque na parte amarela", required: true },
    { id: "raizes", label: "Raízes ou substrato", instruction: "Se possível, mostre a base" },
    { id: "extra", label: "Complementar", instruction: "Qualquer outro detalhe" },
  ],
  manchas: [
    { id: "inteira", label: "Planta inteira", instruction: "Visão geral", required: true },
    { id: "mancha", label: "Mancha aproximada", instruction: "Foque no centro da mancha", required: true },
    { id: "verso", label: "Verso da folha", instruction: "Verifique se há fungos" },
    { id: "outra", label: "Outra folha", instruction: "Comparação" },
  ],
  default: [
    { id: "inteira", label: "Planta inteira", instruction: "Visão geral", required: true },
    { id: "detalhe", label: "Detalhe do sinal", instruction: "Foque no problema", required: true },
    { id: "base", label: "Base/Substrato", instruction: "Mostre o vaso" },
    { id: "extra", label: "Opcional", instruction: "Foto extra" },
  ],
};

export function GuidedPhotoUploader({
  symptom,
  onPhotosChange,
  initialPhotos = [],
}: {
  symptom: string;
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
}) {
  const requirements = requirementsBySymptom[symptom] || requirementsBySymptom.default;
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    // We map initialPhotos to the available slots.
    // The user suggested they could be "complementary" photos or the first one.
    // Here we fill the slots in order of requirements.
    const initialMap: Record<string, string> = {};
    initialPhotos.forEach((photo, index) => {
      if (requirements[index]) {
        initialMap[requirements[index].id] = photo;
      }
    });
    return initialMap;
  });

  const handleUpload = (id: string, dataUrl: string) => {
    const next = { ...photos, [id]: dataUrl };
    setPhotos(next);
    onPhotosChange(Object.values(next));
  };

  const count = Object.keys(photos).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {requirements.map((req) => (
          <div key={req.id} className="space-y-1">
            <PhotoUploader label={req.label} onUpload={(url) => handleUpload(req.id, url)} initialPreview={photos[req.id]} />
            <p className="px-1 text-[10px] text-muted-foreground leading-tight">
              {req.required && <span className="text-leaf font-medium">Obrigatória: </span>}
              {req.instruction}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">
            {count}/3 fotos {count >= 3 ? "✓" : ""}
          </span>
          <span className="text-muted-foreground">Quanto mais ângulos, maior a confiança</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-leaf transition-all duration-300"
            style={{ width: `${Math.min(100, (count / 3) * 100)}%` }}
          />
        </div>
      </div>

      {count === 0 ? (
        <Alert className="bg-warning-soft/30 border-warning/20">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-xs">
            Sem fotos, a orientação será preliminar e terá confiança reduzida. O ideal são 3 fotos
            (planta inteira, detalhe do sinal e base/raízes) — mas você pode analisar mesmo assim.
          </AlertDescription>
        </Alert>
      ) : count < 3 ? (
        <Alert className="bg-leaf-soft/30 border-leaf/20">
          <Info className="h-4 w-4 text-leaf" />
          <AlertDescription className="text-xs">
            Boa! Adicione mais {3 - count} foto(s) de outro ângulo para um diagnóstico mais confiável —
            ou siga para a análise se preferir.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
