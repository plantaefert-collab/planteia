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
}: {
  symptom: string;
  onPhotosChange: (photos: string[]) => void;
}) {
  const requirements = requirementsBySymptom[symptom] || requirementsBySymptom.default;
  const [photos, setPhotos] = useState<Record<string, string>>({});

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
            <PhotoUploader label={req.label} onUpload={(url) => handleUpload(req.id, url)} />
            <p className="px-1 text-[10px] text-muted-foreground leading-tight">
              {req.required && <span className="text-leaf font-medium">Obrigatória: </span>}
              {req.instruction}
            </p>
          </div>
        ))}
      </div>

      {count === 0 && (
        <Alert className="bg-warning-soft/30 border-warning/20">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-xs">
            Sem fotos, a orientação será preliminar e terá confiança reduzida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
