import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { DIAGNOSIS_SYSTEM_PROMPT } from "@/lib/ai-persona";

const SYSTEM_PROMPT = DIAGNOSIS_SYSTEM_PROMPT;

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

// Instrução explícita de saída JSON — substitui o "structured output" (generateObject),
// que não é honrado pelo AI Gateway com este provider/modelo e fazia todo diagnóstico
// cair no fallback genérico. Aqui o modelo devolve JSON como texto e nós parseamos.
const JSON_INSTRUCTION = `Responda EXCLUSIVAMENTE com um objeto JSON válido — sem markdown, sem cercas de código, sem qualquer texto antes ou depois. Use exatamente estas chaves:
{
  "status": "saudavel" | "atencao" | "acompanhamento",
  "mainSuspicion": "hipótese principal específica desta planta",
  "confidence": "baixa" | "moderada" | "moderada-alta" | "alta",
  "observedSigns": ["sinais que você realmente vê NESTA foto"],
  "otherPossibilities": ["hipóteses alternativas"],
  "immediateActions": ["ações imediatas"],
  "avoid": ["o que evitar"],
  "urgencySigns": ["sinais de urgência"],
  "whatToObserve": ["o que observar nos próximos dias"],
  "improvementSigns": ["sinais de melhora"],
  "careTimeline": [{ "when": "quando", "task": "tarefa" }],
  "reevaluateInDays": 7
}
Regras do JSON: cada lista com 3 a 6 itens curtos e acionáveis; "reevaluateInDays" é um inteiro entre 3 e 14. Baseie "observedSigns" e "mainSuspicion" no que é visível NESTA imagem específica — não repita respostas genéricas.`;

// Extrai um objeto JSON de uma resposta em texto (tolera cercas de código e texto ao redor).
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
          const { text } = await generateText({
            model,
            system: SYSTEM_PROMPT,
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

          const result = DiagnosisSchema.safeParse(extractJson(text));

          if (!result.success) {
            console.warn(
              `[AI MONITOR] Resposta da IA fora do schema. Fotos: ${photos.length}. Campos: ${result.error.issues
                .map((i) => i.path.join("."))
                .join(", ")}`,
            );
            return Response.json({
              ...buildFallbackDiagnosis(body, "schema_mismatch"),
              _debug: {
                branch: "schema_mismatch",
                rawText: (text ?? "").slice(0, 800),
                issues: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 12),
              },
            });
          }

          return Response.json(normalizeDiagnosis(result.data));
        } catch (err) {
          console.error("AI Diagnosis Error:", err);
          const e = err as { name?: string; message?: string; cause?: unknown; statusCode?: number; responseBody?: unknown };
          return Response.json({
            ...buildFallbackDiagnosis(body, "model_error"),
            _debug: {
              branch: "model_error",
              name: e?.name ?? null,
              message: (e?.message ?? "").slice(0, 800),
              statusCode: e?.statusCode ?? null,
              responseBody: typeof e?.responseBody === "string" ? e.responseBody.slice(0, 500) : e?.responseBody ?? null,
              cause: (() => {
                const c = e?.cause as { message?: string } | undefined;
                return c?.message ? c.message.slice(0, 500) : String(c ?? "").slice(0, 300);
              })(),
            },
          });
        }
      },
    },
  },
});
