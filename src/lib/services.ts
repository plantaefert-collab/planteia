import type { Plant, CareTask, Diagnosis, Product, ChatMessage, CarePlan } from "./types";
import * as mockData from "./mock-data";
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

export const plantsService = {
  async list(): Promise<Plant[]> {
    await wait(120);
    return mockPlants;
  },
  async get(id: string): Promise<Plant | undefined> {
    await wait(80);
    return mockPlants.find((p) => p.id === id);
  },
};

export const tasksService = {
  async list(): Promise<CareTask[]> {
    await wait(80);
    return mockCareTasks;
  },
  async listByPlant(plantId: string): Promise<CareTask[]> {
    await wait(80);
    return mockCareTasks.filter((t) => t.plantId === plantId);
  },
};

export const timelineService = {
  async listByPlant(plantId: string) {
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
    objective?: string; 
    symptom?: string; 
    photos?: string[];
    answers?: Record<string, any>;
  }): Promise<Diagnosis> {
    await wait(1500);
    // Find a scenario based on symptom
    const scenarioId = input.symptom === "folhas_amarelas" ? "excesso_umidade" : 
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
