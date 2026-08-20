import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { DIAGNOSIS_SYSTEM_PROMPT } from "@/lib/ai-persona";
// O separador entre o texto do modelo e o objeto final autoritativo mora em lib
// para que cliente e servidor compartilhem a mesma definição - duplicar a
// constante aqui seria a forma mais fácil de o protocolo divergir em silêncio.
import { FINAL_SENTINEL } from "@/lib/diagnosis-stream";

const SYSTEM_PROMPT = DIAGNOSIS_SYSTEM_PROMPT;

/**
 * Sem a data, a calibragem de estação do prompt fica inerte: o modelo não sabe
 * em que mês estamos e não tem como inverter as estações para o Brasil.
 */
function blocoDeEpoca(): string {
  const agora = new Date();
  const mes = agora.getMonth(); // 0 = janeiro
  const estacao =
    mes === 11 || mes <= 1
      ? "verão (calor e chuva na maior parte do país)"
      : mes <= 4
        ? "outono (transição, chuvas diminuindo)"
        : mes <= 7
          ? "inverno (seco na maior parte do país; frio real só no Sul)"
          : "primavera (calor voltando, chuvas retornando)";
  const data = agora.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return `# Época do ano (hemisfério SUL)
Hoje é ${data}. No Brasil estamos no ${estacao}.
Ajuste rega e adubação a esta estação — e lembre que ela é o oposto do que a maior parte do conteúdo de jardinagem assume.`;
}

const DifferentialSchema = z.object({
  hypothesis: z.string(),
  probability: z.number(),
  ruledOutBy: z.string().optional(),
});

/**
 * A ORDEM DOS CAMPOS É DECISÃO DE UX, NÃO DE ESTILO.
 *
 * O modelo gera na ordem em que os campos aparecem aqui e na instrução de JSON.
 * Campos baratos de identificação vêm primeiro para que a lista de passos do
 * P-001 avance com trabalho real: cada passo transiciona quando o campo
 * correspondente termina de chegar, não por temporizador.
 *
 * Reordenar isto quebra a semântica dos passos em `StepList`.
 */
const DiagnosisSchema = z.object({
  // 1. o que se vê        → passo "Lendo os sinais na foto"
  observedSigns: z.array(z.string()),
  // 2. a conclusão        → passo "Formando a hipótese"
  mainSuspicion: z.string(),
  confidence: z.enum(["baixa", "moderada", "moderada-alta", "alta"]),
  // 3. o que foi descartado → passo "Considerando alternativas"
  differential: z.array(DifferentialSchema),
  // 4. o plano             → passo "Montando o plano"
  status: z.enum(["saudavel", "atencao", "acompanhamento"]),
  immediateActions: z.array(z.string()),
  avoid: z.array(z.string()),
  urgencySigns: z.array(z.string()),
  whatToObserve: z.array(z.string()),
  improvementSigns: z.array(z.string()),
  careTimeline: z.array(z.object({ when: z.string(), task: z.string() })),
  reevaluateInDays: z.number().int().min(3).max(14),
  // derivado no servidor a partir de `differential`, para consumidores antigos
  otherPossibilities: z.array(z.string()).optional(),
});

type DiagnosisPayload = z.infer<typeof DiagnosisSchema> & {
  otherPossibilities: string[];
  missingFields?: string[];
};

type Body = {
  photos?: string[];
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  plantSpecies?: string;
};

const DEFAULT_DIAGNOSIS: DiagnosisPayload = {
  observedSigns: [
    "Foto recebida para análise visual",
    "Detalhes clínicos podem exigir novo enquadramento",
    "Contexto informado pelo usuário foi considerado",
  ],
  mainSuspicion: "Análise preliminar por foto",
  confidence: "baixa",
  differential: [
    { hypothesis: "Estresse ambiental por luz, rega ou ventilação", probability: 30 },
    { hypothesis: "Alteração natural de folhas antigas", probability: 20 },
    { hypothesis: "Início de problema ainda pouco evidente na imagem", probability: 15 },
  ],
  status: "acompanhamento",
  immediateActions: [
    "Observe a região afetada sob luz natural indireta",
    "Verifique se o substrato está úmido antes de regar novamente",
    "Mantenha a planta ventilada e sem sol direto forte",
  ],
  avoid: [
    "Aplicar defensivos sem confirmar sinais de pragas",
    "Regar por rotina se o substrato ainda estiver úmido",
    "Cortar folhas ou raízes sem sinal claro de necrose",
  ],
  urgencySigns: [
    "Manchas aumentando rapidamente",
    "Mau cheiro no substrato ou raízes escurecidas",
    "Murcha intensa mesmo com substrato adequado",
  ],
  whatToObserve: [
    "Cor e textura das folhas nos próximos dias",
    "Umidade do substrato antes da próxima rega",
    "Presença de pontos, teias ou insetos no verso das folhas",
  ],
  improvementSigns: [
    "Folhas firmes e sem avanço das manchas",
    "Substrato secando em ritmo normal",
    "Novas raízes ou brotos saudáveis",
  ],
  careTimeline: [
    { when: "Agora", task: "Comparar a foto com a planta em luz natural" },
    { when: "Em 2 dias", task: "Revisar umidade do substrato e evolução das manchas" },
    { when: "Em 7 dias", task: "Refazer foto no mesmo ângulo para comparação" },
  ],
  reevaluateInDays: 7,
  otherPossibilities: [
    "Estresse ambiental por luz, rega ou ventilação",
    "Alteração natural de folhas antigas",
    "Início de problema ainda pouco evidente na imagem",
  ],
};

function clampReevaluationDays(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_DIAGNOSIS.reevaluateInDays;
  return Math.min(14, Math.max(3, Math.round(value)));
}

function normalizeList(value: string[] | undefined, fallback: string[]) {
  const items = Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : [];
  return items.length > 0 ? items.slice(0, 6) : fallback;
}

function normalizeDifferential(
  value: z.infer<typeof DifferentialSchema>[] | undefined,
): DiagnosisPayload["differential"] {
  const items = Array.isArray(value)
    ? value
        .filter((item) => item?.hypothesis?.trim())
        .map((item) => ({
          hypothesis: item.hypothesis.trim(),
          probability: Math.min(95, Math.max(1, Math.round(item.probability ?? 10))),
          ruledOutBy: item.ruledOutBy?.trim() || undefined,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 4)
    : [];
  return items.length > 0 ? items : DEFAULT_DIAGNOSIS.differential;
}

function normalizeDiagnosis(value: z.infer<typeof DiagnosisSchema>): DiagnosisPayload {
  const differential = normalizeDifferential(value.differential);
  return {
    observedSigns: normalizeList(value.observedSigns, DEFAULT_DIAGNOSIS.observedSigns),
    mainSuspicion: value.mainSuspicion?.trim() || DEFAULT_DIAGNOSIS.mainSuspicion,
    confidence: value.confidence ?? DEFAULT_DIAGNOSIS.confidence,
    differential,
    status: value.status ?? DEFAULT_DIAGNOSIS.status,
    immediateActions: normalizeList(value.immediateActions, DEFAULT_DIAGNOSIS.immediateActions),
    avoid: normalizeList(value.avoid, DEFAULT_DIAGNOSIS.avoid),
    urgencySigns: normalizeList(value.urgencySigns, DEFAULT_DIAGNOSIS.urgencySigns),
    whatToObserve: normalizeList(value.whatToObserve, DEFAULT_DIAGNOSIS.whatToObserve),
    improvementSigns: normalizeList(value.improvementSigns, DEFAULT_DIAGNOSIS.improvementSigns),
    careTimeline:
      value.careTimeline?.length > 0
        ? value.careTimeline
            .filter((item) => item.when.trim() && item.task.trim())
            .slice(0, 6)
        : DEFAULT_DIAGNOSIS.careTimeline,
    reevaluateInDays: clampReevaluationDays(value.reevaluateInDays),
    // Derivado, não pedido ao modelo: menos campos para ele errar.
    otherPossibilities: differential.map((d) => d.hypothesis),
  };
}

/**
 * P-005 — falha parcial nomeada. `missingFields` diz à interface exatamente o que
 * não veio, para que ela possa mostrar "não consegui avaliar X" em vez de uma tela
 * genérica de erro.
 */
function buildFallbackDiagnosis(
  body: Body,
  reason: "model_error" | "schema_mismatch" | "no_photo",
  missingFields: string[] = [],
): DiagnosisPayload {
  const symptomLabel = body.symptom?.replace(/_/g, " ").trim();
  const speciesLabel = body.plantSpecies?.trim();
  const suspicion = symptomLabel
    ? `Análise preliminar: ${symptomLabel}`
    : speciesLabel
      ? `Análise preliminar de ${speciesLabel}`
      : DEFAULT_DIAGNOSIS.mainSuspicion;

  const observedReason =
    reason === "schema_mismatch"
      ? "A IA analisou a foto, mas a resposta precisou ser normalizada para segurança"
      : reason === "model_error"
        ? "A análise automática ficou indisponível e foi aplicado um protocolo conservador"
        : "Nenhuma foto válida chegou ao servidor";

  return {
    ...DEFAULT_DIAGNOSIS,
    mainSuspicion: suspicion,
    observedSigns: [observedReason, ...DEFAULT_DIAGNOSIS.observedSigns.slice(0, 2)],
    missingFields: missingFields.length > 0 ? missingFields : undefined,
  };
}

// Instrução explícita de saída JSON — substitui o "structured output"
// (generateObject/streamObject), que não é honrado pelo AI Gateway com este
// provider/modelo e fazia todo diagnóstico cair no fallback genérico. Aqui o modelo
// devolve JSON como texto, transmitido em fluxo, e nós parseamos — parcialmente no
// cliente para renderização progressiva, e integralmente aqui para validar.
//
// A ORDEM DAS CHAVES espelha `DiagnosisSchema` de propósito. Ver o comentário lá.
const JSON_INSTRUCTION = `Responda EXCLUSIVAMENTE com um objeto JSON válido — sem markdown, sem cercas de código, sem qualquer texto antes ou depois. Gere as chaves EXATAMENTE nesta ordem:
{
  "observedSigns": ["sinais que você realmente vê NESTA foto"],
  "mainSuspicion": "hipótese principal específica desta planta",
  "confidence": "baixa" | "moderada" | "moderada-alta" | "alta",
  "differential": [
    { "hypothesis": "hipótese alternativa", "probability": 25, "ruledOutBy": "por que ficou abaixo da principal" }
  ],
  "status": "saudavel" | "atencao" | "acompanhamento",
  "immediateActions": ["ações imediatas"],
  "avoid": ["o que evitar"],
  "urgencySigns": ["sinais de urgência"],
  "whatToObserve": ["o que observar nos próximos dias"],
  "improvementSigns": ["sinais de melhora"],
  "careTimeline": [{ "when": "quando", "task": "tarefa" }],
  "reevaluateInDays": 7
}
Regras do JSON:
- A ordem das chaves acima é obrigatória. A interface revela o resultado conforme cada chave chega.
- Cada lista com 3 a 6 itens curtos e acionáveis.
- "differential" traz 2 ou 3 alternativas reais que você considerou e descartou, com "probability" inteiro entre 1 e 95. Nunca repita a hipótese principal ali.
- "reevaluateInDays" é um inteiro entre 3 e 14.
- Baseie "observedSigns" e "mainSuspicion" no que é visível NESTA imagem específica — não repita respostas genéricas.
- Se a foto não permitir avaliar algum aspecto (raiz, verso da folha, substrato), diga isso explicitamente em "observedSigns" em vez de inventar.`;

/** Extrai um objeto JSON de uma resposta em texto (tolera cercas e texto ao redor). */
function extractJson(text: string): unknown {
  if (!text) return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

/** Resposta que é só o objeto final, sem texto do modelo antes. */
function immediateFinal(diagnosis: DiagnosisPayload) {
  return new Response(FINAL_SENTINEL + JSON.stringify(diagnosis), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/diagnose-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "invalid_json", message: "Requisição inválida." }, { status: 400 });
        }

        const photos = Array.isArray(body.photos)
          ? body.photos.filter((p) => typeof p === "string" && p.startsWith("data:image/"))
          : [];

        if (photos.length === 0) {
          return immediateFinal(buildFallbackDiagnosis(body, "no_photo"));
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3.6-flash");

        const contextText = [
          body.plantSpecies ? `Espécie: ${body.plantSpecies}` : null,
          body.objective ? `Objetivo: ${body.objective}` : null,
          body.symptom ? `Sintoma principal relatado: ${body.symptom}` : null,
          body.answers && Object.keys(body.answers).length
            ? `Respostas do usuário: ${JSON.stringify(body.answers)}`
            : null,
          `Foram enviadas ${photos.length} foto(s) para análise visual.`,
        ]
          .filter(Boolean)
          .join("\n");

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let full = "";

            const emitFinal = (diagnosis: DiagnosisPayload) => {
              controller.enqueue(encoder.encode(FINAL_SENTINEL + JSON.stringify(diagnosis)));
            };

            try {
              const result = streamText({
                model,
                system: `${SYSTEM_PROMPT}

${blocoDeEpoca()}`,
                temperature: 0.3,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: `${contextText}\n\n${JSON_INSTRUCTION}` },
                      ...photos.map((url) => ({ type: "image" as const, image: url })),
                    ],
                  },
                ],
              });

              for await (const chunk of result.textStream) {
                full += chunk;
                controller.enqueue(encoder.encode(chunk));
              }

              const parsed = DiagnosisSchema.safeParse(extractJson(full));

              if (!parsed.success) {
                const missing = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "")))].filter(Boolean);
                console.warn(
                  `[AI MONITOR] Resposta da IA fora do schema. Fotos: ${photos.length}. Campos: ${missing.join(", ")}`,
                );
                emitFinal(buildFallbackDiagnosis(body, "schema_mismatch", missing));
              } else {
                emitFinal(normalizeDiagnosis(parsed.data));
              }
            } catch (err) {
              console.error("AI Diagnosis Error:", err);
              // Mesmo com texto já transmitido, o objeto final substitui o parcial no
              // cliente — o usuário nunca fica com um diagnóstico pela metade.
              emitFinal(buildFallbackDiagnosis(body, "model_error"));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            // Impede buffering em proxies, que anularia o streaming.
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
