import type { Diagnosis } from "./types";
import { parsePartialJson, hasContent } from "./partial-json";

/**
 * Protocolo do fluxo de diagnóstico, compartilhado entre servidor e cliente.
 *
 * O corpo da resposta é:
 *
 *     <texto bruto do modelo, em pedaços>  U+001F  <JSON final autoritativo>
 *
 * O cliente renderiza o texto bruto progressivamente (P-002) e, ao encontrar o
 * separador, descarta o parcial e passa a usar o objeto que o servidor validou,
 * normalizou e — em caso de falha — substituiu pelo fallback.
 *
 * U+001F (unit separator) não aparece em saída de modelo de linguagem.
 */
export const FINAL_SENTINEL = "\u001F";

/**
 * Passos exibidos durante a análise (P-001).
 *
 * Cada passo termina quando o campo correspondente termina de chegar do modelo —
 * nunca por temporizador. É isso que torna a lista honesta. A ordem depende da
 * ordem das chaves em `DiagnosisSchema`; mudar uma sem a outra quebra a semântica.
 */
export const ANALYSIS_STEPS = [
  {
    id: "upload",
    label: "Enviando suas fotos",
    /** Concluído pelo cliente, que sabe quando o corpo terminou de subir. */
    field: null,
  },
  {
    id: "signs",
    label: "Lendo os sinais na foto",
    field: "observedSigns",
  },
  {
    id: "hypothesis",
    label: "Formando a hipótese",
    field: "mainSuspicion",
  },
  {
    id: "differential",
    label: "Considerando alternativas",
    field: "differential",
  },
  {
    id: "plan",
    label: "Montando o plano de cuidado",
    field: "careTimeline",
  },
] as const;

export type AnalysisStepId = (typeof ANALYSIS_STEPS)[number]["id"];

/** Detalhe do passo, quando há informação real para qualificá-lo. Ver P-001. */
export function describeStep(
  id: AnalysisStepId,
  ctx: { photoCount: number; species?: string; partial: Partial<Diagnosis> | null },
): string | undefined {
  switch (id) {
    case "upload":
      return ctx.photoCount === 1 ? "1 foto" : `${ctx.photoCount} fotos`;
    case "signs": {
      const n = ctx.partial?.observedSigns?.length ?? 0;
      return n > 0 ? (n === 1 ? "1 sinal anotado" : `${n} sinais anotados`) : undefined;
    }
    case "hypothesis":
      return ctx.species ? `comparando com ${ctx.species}` : undefined;
    case "differential": {
      const n = ctx.partial?.differential?.length ?? 0;
      return n > 0 ? `${n} alternativa(s) avaliada(s)` : undefined;
    }
    case "plan":
      return undefined;
  }
}

export type StreamState = {
  /** Objeto montado até agora. Parcial enquanto o fluxo não terminou. */
  diagnosis: Partial<Diagnosis> | null;
  /** Passos já concluídos, na ordem de `ANALYSIS_STEPS`. */
  completed: AnalysisStepId[];
  /** `true` depois que o objeto final autoritativo chegou. */
  settled: boolean;
};

/** Quais passos já podem ser considerados concluídos, dado o objeto parcial. */
export function completedSteps(
  partial: Partial<Diagnosis> | null,
  uploaded: boolean,
): AnalysisStepId[] {
  const done: AnalysisStepId[] = [];
  if (uploaded) done.push("upload");
  if (!partial) return done;

  for (const step of ANALYSIS_STEPS) {
    if (!step.field) continue;
    if (hasContent((partial as Record<string, unknown>)[step.field])) {
      done.push(step.id);
    }
  }
  return done;
}

/**
 * Consome o corpo da resposta de `/api/diagnose-photo`.
 *
 * Chama `onPartial` a cada pedaço com o que já dá para renderizar, e resolve com o
 * objeto final autoritativo. Nunca rejeita por conteúdo — só por falha de rede,
 * que é o único erro que a interface deve tratar como erro (P-005).
 */
export async function consumeDiagnosisStream(
  response: Response,
  onPartial: (partial: Partial<Diagnosis>, completed: AnalysisStepId[]) => void,
): Promise<Diagnosis> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Resposta sem corpo legível.");

  const decoder = new TextDecoder();
  let buffer = "";
  // Depois que o separador aparece, tudo que chega é o JSON final: para de tentar
  // parsear parcial, senão o partial parser passaria a ler o objeto autoritativo
  // como se fosse continuação do texto do modelo.
  let reachedSentinel = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    if (reachedSentinel) continue;

    if (buffer.includes(FINAL_SENTINEL)) {
      reachedSentinel = true;
      continue;
    }

    const partial = parsePartialJson<Partial<Diagnosis>>(buffer);
    if (partial) onPartial(partial, completedSteps(partial, true));
  }

  buffer += decoder.decode();

  const cut = buffer.indexOf(FINAL_SENTINEL);
  if (cut === -1) {
    // O servidor sempre emite o separador. Chegar aqui significa conexão cortada no
    // meio — o parcial é o melhor que temos, e o chamador aplica o fallback local.
    throw new Error("stream_truncated");
  }

  return JSON.parse(buffer.slice(cut + FINAL_SENTINEL.length)) as Diagnosis;
}
