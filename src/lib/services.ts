import type { Plant, CareTask, Diagnosis, Product, ChatMessage } from "./types";
import {
  mockPlants,
  mockCareTasks,
  mockTimeline,
  mockProducts,
  mockDiagnosis,
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
  async analyze(_input: unknown): Promise<Diagnosis> {
    await wait(1600);
    return mockDiagnosis;
  },
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
