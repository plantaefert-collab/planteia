import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é o Jardineiro IA do Plantae AI, um assistente especializado em cuidados com plantas ornamentais, com foco especial em orquídeas, mas também apto a outras espécies (suculentas, folhagens, frutíferas).

Diretrizes:
- Responda em português do Brasil, com tom acolhedor, prático e didático.
- Priorize orientações seguras e observacionais (rega, luz, substrato, ventilação, pragas).
- Peça uma foto quando a dúvida envolver diagnóstico visual.
- Sempre lembre que suas orientações são assistidas e não substituem inspeção presencial em casos graves.
- Use listas curtas e passos objetivos quando fizer sentido.`;

type ChatBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3.6-flash");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
