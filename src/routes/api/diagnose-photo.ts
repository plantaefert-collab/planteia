import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é um fitopatologista assistente do Plantae AI, especializado em diagnóstico visual de plantas ornamentais (foco em orquídeas).
Analise as fotos e o contexto e retorne EXCLUSIVAMENTE um JSON válido, sem markdown, sem crase, sem comentários, com esta estrutura exata:

{
  "status": "saudavel" | "atencao" | "acompanhamento",
  "mainSuspicion": string,
  "confidence": "baixa" | "moderada" | "moderada-alta" | "alta",
  "observedSigns": string[],
  "otherPossibilities": string[],
  "immediateActions": string[],
  "avoid": string[],
  "urgencySigns": string[],
  "whatToObserve": string[],
  "improvementSigns": string[],
  "careTimeline": [{ "when": string, "task": string }],
  "reevaluateInDays": number
}

Regras:
- Português do Brasil, tom acolhedor e prático.
- Baseie-se nos sinais visíveis nas fotos; se as fotos não permitirem, reduza a "confidence" e explique em "observedSigns".
- 3 a 6 itens em cada lista, frases curtas e acionáveis.
- "reevaluateInDays" entre 3 e 14.
- NUNCA inclua texto fora do JSON.`;

type Body = {
  photos?: string[]; // data URLs
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
        const photos = Array.isArray(body.photos) ? body.photos.filter((p) => typeof p === "string" && p.startsWith("data:image/")) : [];

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

          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return new Response("Modelo não retornou JSON.", { status: 502 });

          const parsed = JSON.parse(jsonMatch[0]);
          return Response.json(parsed);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro desconhecido";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
