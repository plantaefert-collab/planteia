import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SYMPTOMS = [
  { id: "folhas_amarelas", title: "Folhas amareladas", icon: "🍂" },
  { id: "folhas_murchas", title: "Folhas murchas", icon: "🥀" },
  { id: "manchas", title: "Manchas nas folhas", icon: "🔘" },
  { id: "raizes_escuras", title: "Raízes escuras/moles", icon: "🪵" },
  { id: "pragas", title: "Pragas visíveis", icon: "🐜" },
  { id: "queda_flores", title: "Flores caindo", icon: "🌸" },
  { id: "pontas_secas", title: "Pontas secas", icon: "🔥" },
  { id: "outro", title: "Outro sinal", icon: "❓" },
] as const;

/** Converte ids de sintomas em um texto legível (rótulos) para enviar à IA. */
export function symptomsToText(ids: string[]): string {
  return ids
    .map((id) => SYMPTOMS.find((s) => s.id === id)?.title ?? id)
    .join(", ");
}

export function SymptomSelector({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SYMPTOMS.map((s) => {
        const isOn = selected.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(s.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition",
              isOn
                ? "border-leaf bg-leaf-soft/50 ring-2 ring-leaf/20"
                : "border-border bg-card hover:border-leaf/50",
            )}
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs font-medium leading-tight">{s.title}</span>
            {isOn && (
              <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-leaf text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
