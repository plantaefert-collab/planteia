import { cn } from "@/lib/utils";

/**
 * Envelope de entrada para blocos de conteúdo gerado por IA. Implementa M-001.
 *
 * Durante o streaming, cada bloco monta quando o campo correspondente chega — o
 * escalonamento é produzido pelo próprio fluxo, então `delayMs` fica em 0. Ao
 * renderizar um diagnóstico já completo (histórico, fallback imediato), tudo monta
 * de uma vez e aí sim o escalonamento artificial evita o "estouro" de tela.
 *
 * Nunca passe `delayMs` durante o streaming: seria escalonar duas vezes e faria o
 * resultado parecer mais lento do que é, anulando o ganho de P-002.
 */
export function StreamBlock({
  children,
  delayMs = 0,
  className,
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("motion-stream-in", className)}
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** Escalonamento padrão de M-001, limitado para a cauda não ficar lenta. */
export function staggerDelay(index: number): number {
  return Math.min(index, 6) * 380;
}
