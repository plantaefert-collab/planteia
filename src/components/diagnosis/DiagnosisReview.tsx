import { Button } from "@/components/ui/button";
import { Edit2, Camera, Info, Stethoscope } from "lucide-react";

export function DiagnosisReview({ 
  plant, 
  objective, 
  symptom, 
  photoCount, 
  answers,
  onEdit 
}: { 
  plant?: any; 
  objective: string; 
  symptom: string; 
  photoCount: number; 
  answers: any;
  onEdit: (step: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Revisar informações</h2>
      
      <div className="space-y-3">
        <ReviewItem 
          label="Planta" 
          value={plant?.nickname || "Sem cadastro"} 
          onClick={() => onEdit("select")} 
        />
        <ReviewItem 
          label="Objetivo" 
          value={objective === "identificar" ? "Identificar problema" : "Avaliação completa"} 
          onClick={() => onEdit("objective")} 
        />
        <ReviewItem 
          label="Sinal" 
          value={symptom.replace("_", " ")} 
          onClick={() => onEdit("symptom")} 
        />
        <ReviewItem 
          label="Fotos" 
          value={`${photoCount} fotos enviadas`} 
          onClick={() => onEdit("photos")} 
        />
      </div>

      <div className="rounded-2xl bg-muted/30 p-4 border border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Respostas principais</h4>
        <div className="space-y-2">
          {Object.entries(answers).map(([key, val]: [string, any]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 items-center rounded-2xl bg-leaf-soft/30 border border-leaf/10 p-4 text-xs text-leaf italic">
        <Stethoscope className="h-4 w-4 shrink-0" />
        {photoCount > 0 
          ? "As fotos e respostas serão combinadas para definir o nível de confiança."
          : "Esta orientação será preliminar e terá confiança reduzida (sem fotos)."}
      </div>
    </div>
  );
}

function ReviewItem({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="min-w-0 flex-1 px-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClick} className="h-8 w-8 p-0 text-muted-foreground">
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
