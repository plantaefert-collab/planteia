import { Check } from "lucide-react";
import type { DiagnosisContextUsed } from "@/lib/types";

/**
 * Revelação do contexto lido do histórico. Implementa P-006.
 *
 * A revelação é OBRIGATÓRIA, não opcional. Usar o diário do usuário sem dizer que
 * usou é a armadilha do sistema de memória oculto: a pessoa percebe que o app sabe
 * algo que ela não contou, e a confiança cai em vez de subir. Se o dado entrou no
 * prompt, ele aparece aqui.
 */
export function ContextPill({ items }: { items: DiagnosisContextUsed[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <li
          key={`${item.source}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success"
        >
          <Check className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
