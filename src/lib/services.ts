import type { Plant, CareTask, Diagnosis, Product, ChatMessage, CarePlan } from "./types";
import * as mockData from "./mock-data";
import {
  plantsDb, tasksDb, timelineDb, usuarioAtual,
  diagnosesDb, carePlansDb,
  type NovaPlanta, type DadosDiagnostico,
} from "./plants-db";
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
      status: scenario.priority === "acao_prioritaria" || scenario.priority === "atencao" ? "atencao" : "saudavel",
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
  async getByPlant(plantId: string): Promise<Diagnosis | null> {
    await wait(80);
    return mockData.mockDiagnosesByPlant[plantId] ?? null;
  },
};

export const diagnosesService = {
  /** Salva o diagnóstico no banco. Só faz sentido com sessão. */
  async save(dados: DadosDiagnostico): Promise<string | null> {
    if (!(await logado())) return null;
    return diagnosesDb.create(dados);
  },
};

export const carePlanService = {
  async createFromDiagnosis(
    plantId: string,
    diagnosis: Diagnosis,
    diagnosisRowId?: string,
  ): Promise<CarePlan> {
    // Logado: plano e tarefas gravados de verdade (inclusive a reavaliação).
    if (await logado()) {
      return carePlansDb.createFromDiagnosis(plantId, diagnosis, diagnosisRowId);
    }
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
