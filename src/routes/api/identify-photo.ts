import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { PERSONA_CORE } from "@/lib/ai-persona";
import { FAMILIAS } from "@/lib/conhecimento-tecnico";

/**
 * Identificação de espécie por foto.
 *
 * Custo baixo de propósito: mesma câmera, mesmo modelo com visão do diagnóstico,
 * só muda o prompt. O que a diferencia dos concorrentes é o campo `familia`, que
 * liga o resultado às fichas de cuidado que já existem — eles identificam e
 * param; aqui, identificar já entrega o cuidado.
 */

const SYSTEM_PROMPT = `${PERSONA_CORE}

# Tarefa: identificar a planta da foto
Diga QUE PLANTA É — não diagnostique problema, isso é outra tela.

- Nome popular como se fala no Brasil, e o científico correto.
- **Nomes regionais importam muito aqui:** a mesma planta muda de nome entre
  regiões. Liste os que você souber em "tambemConhecidaComo".
- **Identificação erra. Errar com certeza é pior que errar admitindo.** Se a foto
  não permite concluir (ângulo ruim, só folha, planta jovem, gênero com muitas
  espécies parecidas), use confiança baixa e ofereça alternativas de verdade.
- Em "outrasPossibilidades", liste o que mais se parece — é o que permite a
  pessoa decidir olhando a planta.
- "curiosidade": UMA frase que faça a pessoa entender ou gostar mais da planta.
  Prefira a que explica um cuidado (ex.: vem de tronco de árvore, por isso a raiz
  precisa de ar). Nada de trivia solta.
- Se não for planta (objeto, pessoa, bicho), devolva confiança "baixa" e diga
  isso em "nomePopular", sem inventar espécie.`;

const FAMILIA_ENUM = FAMILIAS.join(" | ");

const JSON_INSTRUCTION = `Responda EXCLUSIVAMENTE com um objeto JSON válido — sem markdown, sem cercas de código, sem texto antes ou depois:
{
  "nomePopular": "como se chama no Brasil",
  "nomeCientifico": "Genus species",
  "tambemConhecidaComo": ["outros nomes regionais"],
  "confianca": "baixa" | "moderada" | "alta",
  "outrasPossibilidades": [{ "nome": "popular", "cientifico": "Genus species" }],
  "familia": ${FAMILIA_ENUM ? `"${FAMILIAS.join('" | "')}"` : "null"} ou null,
  "curiosidade": "uma frase"
}
Regras: "familia" só pode ser um dos valores listados, ou null se a planta não se
encaixar em nenhum — não invente valor novo. "outrasPossibilidades" com 0 a 3
itens. "tambemConhecidaComo" com 0 a 4 itens.`;

const IdentificacaoSchema = z.object({
  nomePopular: z.string(),
  nomeCientifico: z.string().optional().default(""),
  tambemConhecidaComo: z.array(z.string()).optional().default([]),
  confianca: z.enum(["baixa", "moderada", "alta"]),
  outrasPossibilidades: z
    .array(z.object({ nome: z.string(), cientifico: z.string().optional().default("") }))
    .optional()
    .default([]),
  familia: z.string().nullable().optional(),
  curiosidade: z.string().optional(),
});

type Identificacao = z.infer<typeof IdentificacaoSchema>;

/** Resposta quando não dá para concluir — honesta em vez de inventada. */
function naoIdentificada(motivo: string): Identificacao {
  return {
    nomePopular: motivo,
    nomeCientifico: "",
    tambemConhecidaComo: [],
    confianca: "baixa",
    outrasPossibilidades: [],
    familia: null,
    curiosidade: undefined,
  };
}

/** Extrai JSON tolerando cercas de código e texto ao redor. */
function extractJson(text: string): unknown {
  if (!text) return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1);
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/identify-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { photo?: string };
        try {
          body = (await request.json()) as { photo?: string };
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const foto = typeof body.photo === "string" && body.photo.startsWith("data:image/")
          ? body.photo
          : null;
        if (!foto) {
          return Response.json(naoIdentificada("Nenhuma foto recebida"));
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        // Mesmo modelo com visão do diagnóstico — trocar aqui exigiria revalidar
        // o outro endpoint também.
        const model = gateway("google/gemini-3.6-flash");

        try {
          const { text } = await generateText({
            model,
            system: SYSTEM_PROMPT,
            temperature: 0.2, // identificação pede precisão, não criatividade
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: JSON_INSTRUCTION },
                  { type: "image" as const, image: foto },
                ],
              },
            ],
          });

          const resultado = IdentificacaoSchema.safeParse(extractJson(text));
          if (!resultado.success) {
            console.warn(
              `[AI MONITOR] identify-photo fora do schema: ${resultado.error.issues
                .map((i) => i.path.join("."))
                .join(", ")}`,
            );
            return Response.json(naoIdentificada("Não consegui concluir pela foto"));
          }

          // Família fora da lista viraria ponte quebrada para a ficha de cuidado.
          const familia =
            resultado.data.familia && FAMILIAS.includes(resultado.data.familia)
              ? resultado.data.familia
              : null;

          return Response.json({ ...resultado.data, familia });
        } catch (err) {
          console.error("Identify Error:", err);
          return Response.json(naoIdentificada("Não consegui analisar agora"));
        }
      },
    },
  },
});
