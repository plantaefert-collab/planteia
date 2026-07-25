import { createFileRoute } from "@tanstack/react-router";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z, ZodError } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é um fitopatologista assistente do Plantae AI, especializado em diagnóstico visual de plantas ornamentais (foco em orquídeas).
Analise as fotos e o contexto e produza um diagnóstico estruturado.

Regras:
- Português do Brasil, tom acolhedor e prático.
- Baseie-se nos sinais visíveis nas fotos.
- SE AS FOTOS FOREM DE MÁ QUALIDADE, BORRADAS OU NÃO MOSTRAREM UMA PLANTA, tente dar o melhor palpite possível com confiança "baixa" ou "moderada", mas NÃO negue o diagnóstico completamente a menos que seja impossível ver qualquer coisa.
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

type Body = {
  photos?: string[];
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  plantSpecies?: string;
};

export const Route = createFileRoute("/api/diagnose-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const photos = Array.isArray(body.photos)
          ? body.photos.filter((p) => typeof p === "string" && p.startsWith("data:image/"))
          : [];

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-1.5-flash"); // Using a very stable vision model

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

          return Response.json(object);
        } catch (err) {
          console.error("AI Diagnosis Error:", err);
          
          const isSchemaMismatch =
            NoObjectGeneratedError.isInstance?.(err) ||
            err instanceof ZodError ||
            (err instanceof Error && /schema|validation|parse|zod/i.test(err.message));

          if (isSchemaMismatch) {
            return Response.json(
              {
                error: "schema_mismatch",
                message:
                  "A IA não conseguiu estruturar um diagnóstico confiável desta foto. Tente reenviar com uma imagem mais nítida, bem iluminada e focando a região afetada (folha, raiz ou pseudobulbo).",
              },
              { status: 422 },
            );
          }

          const message = err instanceof Error ? err.message : "Erro desconhecido";
          return Response.json(
            { error: "generation_failed", message },
            { status: 500 },
          );
        }
      },
    },
  },
});
