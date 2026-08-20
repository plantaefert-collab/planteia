import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai-persona";

const SYSTEM_PROMPT = CHAT_SYSTEM_PROMPT;

type ChatBody = {
  messages?: unknown;
  context?: {
    user?: {
      name?: string | null;
      level?: string | null;
      city?: string | null;
      goal?: string | null;
    } | null;
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

/**
 * Bloco de contexto do usuário. Independente da planta selecionada — vale
 * mesmo quando a conversa é geral. Alimenta as regras de nome e de modulação
 * do tom definidas na persona.
 */
function buildUserBlock(user: NonNullable<ChatBody["context"]>["user"]): string | null {
  if (!user) return null;
  const nivelLabel: Record<string, string> = {
    iniciante: "iniciante (explique com calma, poucos passos, sem jargão)",
    intermediario: "intermediário (pode justificar tecnicamente)",
    avancado: "avançado (pode aprofundar)",
    profissional: "profissional (pode usar termos técnicos e doses)",
  };
  const objetivoLabel: Record<string, string> = {
    recuperar: "recuperar uma planta debilitada",
    florescer: "melhorar a floração",
    organizar: "organizar os cuidados",
    aprender: "aprender sobre cultivo",
  };

  const lines = [
    user.name ? `- Nome: ${user.name}` : null,
    user.level ? `- Nível de experiência: ${nivelLabel[user.level] ?? user.level}` : null,
    user.city
      ? `- Cidade/região: ${user.city} (considere o clima local quando fizer diferença)`
      : null,
    user.goal ? `- Objetivo principal: ${objetivoLabel[user.goal] ?? user.goal}` : null,
  ].filter(Boolean);

  if (lines.length === 0) return null;

  return `# Quem é o usuário\n${lines.join("\n")}\n\nUse o nome com moderação, seguindo a regra de nome da persona. Ajuste a profundidade da resposta ao nível informado.`;
}

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
    p.wateringFrequencyDays
      ? `- Frequência de rega habitual: a cada ${p.wateringFrequencyDays} dia(s)`
      : null,
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

        const system = [SYSTEM_PROMPT, blocoDeEpoca(), buildUserBlock(context?.user), buildContextBlock(context)]
          .filter(Boolean)
          .join("\n\n");

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
