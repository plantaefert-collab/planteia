import type { Plant, CareTask, Diagnosis, Product, ChatMessage, CarePlan } from "./types";
import * as mockData from "./mock-data";
import { plantsDb, tasksDb, timelineDb, usuarioAtual, type NovaPlanta } from "./plants-db";
import {
  consumeDiagnosisStream,
  completedSteps,
  type AnalysisStepId,
} from "./diagnosis-stream";
import {
  mockPlants,
  mockCareTasks,
  mockTimeline,
  mockProducts,
  mockDiagnosis,
  mockDiagnosesByPlant,
  mockChat,
} from "./mock-data";


// Isolated service layer — future replacement by Supabase / AI API.
// All functions are async on purpose to mimic real API contracts.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Logado -> dados reais do banco. Visitante -> dados de exemplo (demonstracao).
async function logado(): Promise<boolean> {
  return (await usuarioAtual()) !== null;
}

export const plantsService = {
  async list(): Promise<Plant[]> {
    if (await logado()) return plantsDb.list();
    await wait(120);
    return mockPlants;
  },
  async get(id: string): Promise<Plant | undefined> {
    if (await logado()) return plantsDb.get(id);
    await wait(80);
    return mockPlants.find((p) => p.id === id);
  },
  async create(input: NovaPlanta): Promise<Plant> {
    return plantsDb.create(input);
  },
  async remove(id: string): Promise<void> {
    return plantsDb.remove(id);
  },
  async uploadPhoto(dataUrl: string): Promise<string> {
    return plantsDb.uploadPhoto(dataUrl);
  },
};

export const tasksService = {
  async list(): Promise<CareTask[]> {
    if (await logado()) return tasksDb.list();
    await wait(80);
    return mockCareTasks;
  },
  async listByPlant(plantId: string): Promise<CareTask[]> {
    if (await logado()) return tasksDb.listByPlant(plantId);
    await wait(80);
    return mockCareTasks.filter((t) => t.plantId === plantId);
  },
};

export const timelineService = {
  async listByPlant(plantId: string) {
    if (await logado()) return timelineDb.listByPlant(plantId);
    await wait(80);
    return mockTimeline.filter((t) => t.plantId === plantId);
  },
};

export const productsService = {
  async list(): Promise<Product[]> {
    await wait(60);
    return mockProducts;
  },
};

export const diagnosisService = {
  async analyze(input: {
    plantId?: string;
    plantSpecies?: string;
    objective?: string;
    symptom?: string;
    photos?: string[];
    answers?: Record<string, unknown>;
  }): Promise<Diagnosis> {
    const photos = (input.photos ?? []).filter((p) => p.startsWith("data:image/"));

    // If we have photos, ask the AI to analyze them.
    if (photos.length > 0) {
      const res = await fetch("/api/diagnose-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          symptom: input.symptom,
          objective: input.objective,
          answers: input.answers,
          plantSpecies: input.plantSpecies,
        }),
      });
      if (!res.ok) {
        let code = "generation_failed";
        let message = "Não foi possível concluir a análise.";
        try {
          const errBody = await res.json();
          if (errBody?.error) code = errBody.error;
          if (errBody?.message) message = errBody.message;
        } catch {
          try { message = await res.text(); } catch { /* ignore */ }
        }
        if (code === "schema_mismatch" || code === "generation_failed" || res.status === 422 || res.status >= 500) {
          return buildLocalPhotoDiagnosis(input, code);
        }

        const error = new Error(message) as Error & { code?: string };
        error.code = code;
        throw error;
      }
      const ai = (await res.json()) as Partial<Diagnosis>;
      return normalizePhotoDiagnosis(ai, input);
    }

    // Fallback: cenário simulado por sintoma quando não há fotos.
    await wait(800);
    const scenarioId =
      input.symptom === "folhas_amarelas" ? "excesso_umidade" :
      input.symptom === "folhas_murchas" ? "falta_agua" :
      input.symptom === "folhas_queimadas" ? "excesso_luz" :
      input.symptom === "pragas" ? "pragas" : "investigacao";

    const scenario = mockData.diagnosisScenarios[scenarioId];

    return {
      id: crypto.randomUUID(),
      plantId: input.plantId,
      createdAt: new Date().toISOString(),
      // P-003 — severidade é eixo separado da hipótese, então precisa estar certa.
      // O mapa anterior jogava tudo que não fosse ação prioritária em "saudavel", o
      // que rotulava "Investigação necessária" como planta saudável. Passava
      // despercebido quando o status não aparecia em destaque; agora aparece.
      status:
        scenario.priority === "acao_prioritaria" || scenario.priority === "atencao"
          ? "atencao"
          : scenario.priority === "investigacao_necessaria" || scenario.priority === "observacao"
            ? "acompanhamento"
            : "saudavel",
      mainSuspicion: scenario.title,
      confidence: scenario.confidence,
      observedSigns: scenario.why,
      otherPossibilities: ["Outros fatores ambientais", "Adaptação ao local"],
      immediateActions: scenario.whatToDo,
      avoid: scenario.whatToAvoid,
      urgencySigns: scenario.alertSigns,
      whatToObserve: scenario.whatToObserve,
      improvementSigns: scenario.improvementSigns,
      careTimeline: scenario.timeline,
      reevaluateInDays: 7,
    };
  },

  /**
   * Versão em fluxo de `analyze`. Implementa P-001 e P-002.
   *
   * Chama `onPartial` a cada pedaço com o diagnóstico montado até ali e os passos
   * já concluídos, para que a interface revele o conteúdo enquanto ele é gerado.
   *
   * `analyze` continua existindo para chamadas sem interface esperando — reexecução
   * a partir do histórico, testes — onde streaming só adicionaria complexidade.
   */
  async analyzeStream(
    input: {
      plantId?: string;
      plantSpecies?: string;
      objective?: string;
      symptom?: string;
      photos?: string[];
      answers?: Record<string, unknown>;
    },
    onPartial: (partial: Partial<Diagnosis>, completed: AnalysisStepId[]) => void,
  ): Promise<Diagnosis> {
    const photos = (input.photos ?? []).filter((p) => p.startsWith("data:image/"));

    // Sem foto não há nada a transmitir: o cenário simulado por sintoma responde de
    // uma vez só. Delego para `analyze` em vez de duplicar os cenários aqui.
    if (photos.length === 0) {
      const result = await this.analyze(input);
      onPartial(result, completedSteps(result, true));
      return result;
    }

    const res = await fetch("/api/diagnose-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photos,
        symptom: input.symptom,
        objective: input.objective,
        answers: input.answers,
        plantSpecies: input.plantSpecies,
      }),
    });

    if (!res.ok) {
      let code = "generation_failed";
      let message = "Não foi possível concluir a análise.";
      try {
        const errBody = await res.json();
        if (errBody?.error) code = errBody.error;
        if (errBody?.message) message = errBody.message;
      } catch {
        try { message = await res.text(); } catch { /* ignore */ }
      }
      if (code === "schema_mismatch" || code === "generation_failed" || res.status === 422 || res.status >= 500) {
        return buildLocalPhotoDiagnosis(input, code);
      }

      const error = new Error(message) as Error & { code?: string };
      error.code = code;
      throw error;
    }

    try {
      const final = await consumeDiagnosisStream(res, onPartial);
      return normalizePhotoDiagnosis(final, input);
    } catch (err) {
      // Conexão cortada antes do objeto final. O parcial já mostrado na tela não é
      // confiável para salvar, então caímos no protocolo conservador local — mesma
      // política do caminho não-streaming.
      if (err instanceof Error && err.message === "stream_truncated") {
        return buildLocalPhotoDiagnosis(input, "stream_truncated");
      }
      throw err;
    }
  },

  async getByPlant(plantId: string): Promise<Diagnosis | null> {
    await wait(80);
    return mockData.mockDiagnosesByPlant[plantId] ?? null;
  },
};

export const carePlanService = {
  async createFromDiagnosis(plantId: string, diagnosis: Diagnosis): Promise<CarePlan> {
    await wait(500);
    const scenario = Object.values(mockData.diagnosisScenarios).find(s => s.title === diagnosis.mainSuspicion) || mockData.diagnosisScenarios.investigacao;
    
    const plan: CarePlan = {
      id: crypto.randomUUID(),
      plantId,
      diagnosisId: diagnosis.id,
      name: `Recuperação: ${diagnosis.mainSuspicion}`,
      status: "em_andamento",
      priority: diagnosis.status === "atencao" ? "alta" : "media",
      createdAt: new Date().toISOString(),
      nextReevaluationAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tasks: diagnosis.immediateActions.map((action, i) => ({
        id: `task-${i}-${Date.now()}`,
        plantId,
        type: action.toLowerCase().includes("rega") ? "regar" : "substrato",
        title: action,
        date: new Date().toISOString(),
        done: false,
        priority: diagnosis.status === "atencao" ? "alta" : "media",
        origin: "diagnostico"
      })),
      avoid: diagnosis.avoid
    };
    
    // In a real app, we'd save this to a database.
    // Here we'll just return it.
    return plan;
  }
};

function buildLocalPhotoDiagnosis(
  input: { plantId?: string; plantSpecies?: string; symptom?: string },
  reason: string,
): Diagnosis {
  const symptomLabel = input.symptom?.replace(/_/g, " ").trim();
  return {
    id: crypto.randomUUID(),
    plantId: input.plantId,
    createdAt: new Date().toISOString(),
    status: "acompanhamento",
    mainSuspicion: symptomLabel ? `Análise preliminar: ${symptomLabel}` : "Análise preliminar por foto",
    confidence: "baixa",
    observedSigns: [
      reason === "schema_mismatch"
        ? "A IA analisou a foto, mas a resposta precisou ser reorganizada"
        : "O servidor aplicou um protocolo conservador para não bloquear o diagnóstico",
      input.plantSpecies ? `Espécie informada: ${input.plantSpecies}` : "Foto recebida para avaliação visual",
      "Recomendações baseadas em cuidados seguros para orquídeas",
    ],
    otherPossibilities: [
      "Estresse por umidade, luz ou ventilação",
      "Mudança natural de folhas antigas",
      "Sinais iniciais ainda pouco evidentes na foto",
    ],
    immediateActions: [
      "Verifique a umidade do substrato antes de regar",
      "Observe a planta sob luz natural indireta",
      "Tire nova foto da área afetada e do substrato em 3 a 7 dias",
    ],
    avoid: [
      "Aplicar defensivos sem confirmar pragas",
      "Regar se o substrato ainda estiver úmido",
      "Fazer podas drásticas sem necrose evidente",
    ],
    urgencySigns: [
      "Manchas aumentando rapidamente",
      "Mau cheiro no substrato",
      "Murcha intensa ou raízes escuras e moles",
    ],
    whatToObserve: [
      "Evolução das manchas",
      "Firmeza das folhas",
      "Secagem do substrato entre regas",
    ],
    improvementSigns: [
      "Folhas firmes",
      "Sem avanço das manchas",
      "Novas raízes ou brotos saudáveis",
    ],
    careTimeline: [
      { when: "Agora", task: "Comparar sinais visíveis com a foto enviada" },
      { when: "Em 3 dias", task: "Revisar umidade e avanço das manchas" },
      { when: "Em 7 dias", task: "Refazer foto no mesmo ângulo" },
    ],
    reevaluateInDays: 7,
  };
}

function normalizePhotoDiagnosis(ai: Partial<Diagnosis>, input: { plantId?: string }): Diagnosis {
  const fallback = buildLocalPhotoDiagnosis(input, "normalized");
  const list = (value: string[] | undefined, fallbackValue: string[]) =>
    Array.isArray(value) && value.length > 0 ? value.filter(Boolean).slice(0, 6) : fallbackValue;

  return {
    id: crypto.randomUUID(),
    plantId: input.plantId,
    createdAt: new Date().toISOString(),
    status: ai.status ?? fallback.status,
    mainSuspicion: ai.mainSuspicion ?? fallback.mainSuspicion,
    confidence: ai.confidence ?? fallback.confidence,
    observedSigns: list(ai.observedSigns, fallback.observedSigns),
    otherPossibilities: list(ai.otherPossibilities, fallback.otherPossibilities),
    immediateActions: list(ai.immediateActions, fallback.immediateActions),
    avoid: list(ai.avoid, fallback.avoid),
    urgencySigns: list(ai.urgencySigns, fallback.urgencySigns),
    whatToObserve: list(ai.whatToObserve, fallback.whatToObserve ?? []),
    improvementSigns: list(ai.improvementSigns, fallback.improvementSigns ?? []),
    careTimeline: Array.isArray(ai.careTimeline) && ai.careTimeline.length > 0 ? ai.careTimeline : fallback.careTimeline,
    reevaluateInDays:
      typeof ai.reevaluateInDays === "number"
        ? Math.min(14, Math.max(3, Math.round(ai.reevaluateInDays)))
        : fallback.reevaluateInDays,
    // Campos de D-001. Ficam `undefined` quando ausentes em vez de receberem um
    // fallback inventado: um diferencial falso é pior que nenhum diferencial, e a
    // interface já sabe se esconder quando não há dado. Ver P-003 e P-005.
    differential:
      Array.isArray(ai.differential) && ai.differential.length > 0 ? ai.differential : undefined,
    contextUsed:
      Array.isArray(ai.contextUsed) && ai.contextUsed.length > 0 ? ai.contextUsed : undefined,
    missingFields:
      Array.isArray(ai.missingFields) && ai.missingFields.length > 0 ? ai.missingFields : undefined,
  };
}



export const chatService = {
  async initial(): Promise<ChatMessage[]> {
    await wait(50);
    return mockChat;
  },
  async ask(question: string): Promise<ChatMessage> {
    await wait(900);
    return {
      id: crypto.randomUUID(),
      role: "ai",
      createdAt: new Date().toISOString(),
      content:
        `Ótima pergunta sobre: "${question}". ` +
        "Com base nos sinais mais comuns, sugiro observar a umidade do substrato, a luminosidade indireta e a ventilação. " +
        "Se possível, envie uma foto da planta e das raízes para eu refinar a hipótese. " +
        "Lembre-se: esta é uma orientação assistida, não substitui inspeção presencial.",
    };
  },
};
