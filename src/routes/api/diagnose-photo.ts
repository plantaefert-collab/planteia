import { createFileRoute } from "@tanstack/react-router";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z, ZodError } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é um fitopatologista assistente do Plantae AI, especializado em diagnóstico visual de plantas ornamentais (foco em orquídeas).
Analise as fotos e o contexto e produza um diagnóstico estruturado.

Regras:
- Português do Brasil, tom acolhedor, profissional e prático.
- Baseie-se nos sinais visíveis nas fotos.
- MESMO SE AS FOTOS FOREM DE MÁ QUALIDADE, BORRADAS OU NÃO MOSTRAREM UMA PLANTA CLARAMENTE, você DEVE gerar um diagnóstico. Use seu conhecimento botânico para inferir o estado da planta a partir de cores, sombras ou texturas.
- NUNCA diga que não pode realizar a análise. Se houver dúvida extrema, use confiança "baixa" e sugira o que o usuário deve observar melhor.
- 3 a 6 itens em cada lista, frases curtas e acionáveis.
- "reevaluateInDays" entre 3 e 14.`;

const DiagnosisSchema = z.object({
  status: z.enum(["saudavel", "atencao", "acompanhamento"]),
  mainSuspicion: z.string(),
  confidence: z.enum(["baixa", "moderada", "moderada-alta", "alta"]),
  observedSigns: z.array(z.string()),
  otherPossibilities: z.array(z.string()),
  immediateActions: z.array(z.string()),
  avoid: z.array(z.string()),
  urgencySigns: z.array(z.string()),
  whatToObserve: z.array(z.string()),
  improvementSigns: z.array(z.string()),
  careTimeline: z.array(z.object({ when: z.string(), task: z.string() })),
  reevaluateInDays: z.number().int().min(3).max(14),
});

type DiagnosisPayload = z.infer<typeof DiagnosisSchema>;

type Body = {
  photos?: string[];
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  plantSpecies?: string;
};

const DEFAULT_DIAGNOSIS: DiagnosisPayload = {
  status: "acompanhamento",
  mainSuspicion: "Análise preliminar por foto",
  confidence: "baixa",
  observedSigns: [
    "Foto recebida para análise visual",
    "Detalhes clínicos podem exigir novo enquadramento",
    "Contexto informado pelo usuário foi considerado",
  ],
  otherPossibilities: [
    "Estresse ambiental por luz, rega ou ventilação",
    "Alteração natural de folhas antigas",
    "Início de problema ainda pouco evidente na imagem",
  ],
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

function normalizeDiagnosis(value: DiagnosisPayload): DiagnosisPayload {
  return {
    status: value.status ?? DEFAULT_DIAGNOSIS.status,
    mainSuspicion: value.mainSuspicion?.trim() || DEFAULT_DIAGNOSIS.mainSuspicion,
    confidence: value.confidence ?? DEFAULT_DIAGNOSIS.confidence,
    observedSigns: normalizeList(value.observedSigns, DEFAULT_DIAGNOSIS.observedSigns),
    otherPossibilities: normalizeList(value.otherPossibilities, DEFAULT_DIAGNOSIS.otherPossibilities),
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
  };
}

function buildFallbackDiagnosis(body: Body, reason: "model_error" | "schema_mismatch" | "no_photo"): DiagnosisPayload {
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
  };
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
          return Response.json(buildFallbackDiagnosis(body, "no_photo"));
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
          photos.length
            ? `Foram enviadas ${photos.length} foto(s) para análise visual.`
            : "Nenhuma foto foi enviada — a análise será preliminar.",
        ]
          .filter(Boolean)
          .join("\n");

        try {
          const { object } = await generateObject({
            model,
            schema: DiagnosisSchema,
            system: SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: contextText },
                  ...photos.map((url) => ({ type: "image" as const, image: url })),
                ],
              },
            ],
          });

          return Response.json(normalizeDiagnosis(object));
        } catch (err) {
          console.error("AI Diagnosis Error:", err);
          
          // Log para monitoramento (simulado - em produção usaria uma ferramenta de observability)
          if (photos.length > 0) {
            console.warn(`[AI MONITOR] Falha na análise estruturada. Fotos: ${photos.length}. Contexto: ${contextText.substring(0, 100)}...`);
          }
          
          const isSchemaMismatch =
            NoObjectGeneratedError.isInstance?.(err) ||
            err instanceof ZodError ||
            (err instanceof Error && /schema|validation|parse|zod/i.test(err.message));

          const fallbackReason = isSchemaMismatch ? "schema_mismatch" : "model_error";
          return Response.json(buildFallbackDiagnosis(body, fallbackReason));
        }
      },
    },
  },
});
