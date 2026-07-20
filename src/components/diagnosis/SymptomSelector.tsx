import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const symptoms = [
  { id: "folhas_amarelas", title: "Folhas amareladas", icon: "🍂" },
  { id: "folhas_murchas", title: "Folhas murchas", icon: "🥀" },
  { id: "manchas", title: "Manchas nas folhas", icon: "🔘" },
  { id: "raizes_escuras", title: "Raízes escuras/moles", icon: "🪵" },
  { id: "pragas", title: "Pragas visíveis", icon: "🐜" },
  { id: "queda_flores", title: "Flores caindo", icon: "🌸" },
  { id: "pontas_secas", title: "Pontas secas", icon: "🔥" },
  { id: "outro", title: "Outro sinal", icon: "❓" },
];

export function SymptomSelector({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {symptoms.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition",
            selected === s.id 
              ? "border-leaf bg-leaf-soft/50 ring-2 ring-leaf/20" 
              : "border-border bg-card hover:border-leaf/50"
          )}
        >
          <span className="text-2xl">{s.icon}</span>
          <span className="text-xs font-medium leading-tight">{s.title}</span>
          {selected === s.id && <Check className="absolute top-2 right-2 h-4 w-4 text-leaf" />}
        </button>
      ))}
    </div>
  );
}
