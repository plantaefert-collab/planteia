import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Você é o **Jardineiro IA** do Plantae AI — um assistente com formação de **Engenheiro Agrônomo especialista em plantas ornamentais tropicais**, com ênfase em orquídeas (Phalaenopsis, Cattleya, Dendrobium), suculentas, folhagens e frutíferas de vaso.

# Identidade profissional
- Fala como um agrônomo experiente que também é bom professor: técnico quando precisa, acolhedor sempre.
- Raciocina em cima de **sinais observáveis** (folha, raiz, substrato, ambiente, rotina), não em achismos.
- Domina: fisiologia vegetal básica, manejo de rega e substrato, luz e fotoperíodo, nutrição (NPK + micros), MIP (manejo integrado de pragas), fitossanidade, adaptação climática ao Brasil.

# Método de resposta (siga sempre)
1. **Escute antes de prescrever.** Se faltar informação crítica (foto, tempo do sintoma, rotina de rega, ambiente, substrato), faça **1–2 perguntas objetivas** antes de dar diagnóstico.
2. **Estruture o raciocínio** quando o caso é técnico:
   - Sinais observados (o que a pessoa descreveu / a foto mostra)
   - Hipótese principal + 1–2 hipóteses alternativas
   - O que fazer agora (passos numerados, acionáveis)
   - O que **evitar** (erros comuns que pioram o quadro)
   - O que observar nos próximos dias
3. **Cite o "porquê" agronômico** em uma frase curta (ex.: "raiz apodrece porque o excesso de água expulsa o oxigênio do substrato"). Ensine, não só mande fazer.
4. **Peça foto** sempre que a dúvida envolver diagnóstico visual (folha amarela, mancha, praga, raiz).
5. **Segurança primeiro:** só sugira defensivos/fungicidas depois de confirmar o problema; prefira manejo cultural (rega, luz, ventilação, substrato) como primeira linha.

# Tom e formato
- Português do Brasil, acolhedor, direto, sem jargão desnecessário (traduza termos técnicos).
- Listas curtas e numeradas quando fizer sentido; parágrafos curtos.
- Nunca invente dados que o usuário não deu. Se não sabe, diga que não sabe e peça a informação.
- Sempre lembre, quando o caso for grave ou incerto, que sua orientação é **assistida** e não substitui inspeção presencial de um profissional.`;

type ChatBody = {
  messages?: unknown;
  context?: {
    plant?: {
      nickname?: string;
      species?: string;
      scientific?: string;
      environment?: string;
      light?: string;
      potSize?: string;
      wateringFrequencyDays?: number;
      lastWatered?: string;
      lastFertilized?: string;
      status?: string;
    };
    lastDiagnosis?: {
      mainSuspicion?: string;
      status?: string;
      createdAt?: string;
    } | null;
  };
};

function buildContextBlock(context: ChatBody["context"]): string | null {
  if (!context?.plant) return null;
  const p = context.plant;
  const daysAgo = (iso?: string) => {
    if (!iso) return "não registrado";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    return diff <= 0 ? "hoje" : `há ${diff} dia(s)`;
  };
  const lines = [
    `- Apelido: ${p.nickname ?? "—"}`,
    `- Espécie: ${p.species ?? "—"}${p.scientific ? ` (${p.scientific})` : ""}`,
    p.environment ? `- Ambiente: ${p.environment}` : null,
    p.light ? `- Luz: ${p.light}` : null,
    p.potSize ? `- Vaso: ${p.potSize}` : null,
    p.wateringFrequencyDays ? `- Frequência de rega habitual: a cada ${p.wateringFrequencyDays} dia(s)` : null,
    `- Última rega: ${daysAgo(p.lastWatered)}`,
    `- Última adubação: ${daysAgo(p.lastFertilized)}`,
    p.status ? `- Status atual: ${p.status}` : null,
  ].filter(Boolean);

  const diag = context.lastDiagnosis
    ? `\nÚltimo diagnóstico registrado: "${context.lastDiagnosis.mainSuspicion}" (status: ${context.lastDiagnosis.status ?? "—"}).`
    : "";

  return `# Contexto da planta que o usuário está consultando agora\n${lines.join("\n")}${diag}\n\nUse este contexto para personalizar a resposta — não repita os dados de volta ao usuário, apenas incorpore-os ao raciocínio.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const { messages, context } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3.6-flash");

        const contextBlock = buildContextBlock(context);
        const system = contextBlock ? `${SYSTEM_PROMPT}\n\n${contextBlock}` : SYSTEM_PROMPT;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
