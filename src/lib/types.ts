export type PlantStatus = "saudavel" | "atencao" | "acompanhamento";
export type Environment = "interno" | "externo";
export type Light = "baixa" | "media" | "alta" | "indireta";

export interface User {
  id: string;
  name: string;
  email: string;
  city?: string;
  level?: "iniciante" | "intermediario" | "avancado";
  goal?: "recuperar" | "florescer" | "organizar" | "aprender";
  plantTypes?: string[];
}

export interface Plant {
  id: string;
  nickname: string;
  species: string;
  scientific?: string;
  photo: string;
  status: PlantStatus;
  environment: Environment;
  light: Light;
  potSize?: string;
  wateringFrequencyDays?: number;
  acquiredAt?: string;
  lastWatered?: string;
  lastFertilized?: string;
  nextCare?: { label: string; whenLabel: string };
}

export type CareType =
  | "regar"
  | "adubar"
  | "podar"
  | "pragas"
  | "fotografar"
  | "substrato";

export type TaskPriority = "baixa" | "media" | "alta" | "critica";

export interface CareTask {
  id: string;
  plantId: string;
  type: CareType;
  title: string;
  description?: string;
  date: string; // ISO
  done: boolean;
  priority?: TaskPriority;
  origin?: "diagnostico" | "manual";
}

export type PlanStatus = "nao_iniciado" | "em_andamento" | "aguardando_reavaliacao" | "concluido" | "ajustado" | "interrompido";

export interface CarePlan {
  id: string;
  plantId: string;
  diagnosisId: string;
  name: string;
  status: PlanStatus;
  priority: TaskPriority;
  createdAt: string;
  nextReevaluationAt?: string;
  tasks: CareTask[];
  avoid: string[];
}


export type Confidence = "baixa" | "moderada" | "moderada-alta" | "alta";

/** Hipótese alternativa considerada e descartada em favor da principal. Ver P-003. */
export interface DifferentialHypothesis {
  hypothesis: string;
  /** 0–100. Complementa a hipótese principal; não precisa somar 100 com ela. */
  probability: number;
  /** Por que esta ficou abaixo da principal. Uma frase curta. */
  ruledOutBy?: string;
}

/**
 * Contexto que veio do banco e foi usado sem perguntar ao usuário (P-006).
 * A interface é obrigada a revelar o que usou.
 */
export interface DiagnosisContextUsed {
  label: string;
  source: "diario" | "plano" | "diagnostico-anterior" | "planta";
}

export interface Diagnosis {
  id: string;
  plantId?: string;
  createdAt: string;
  status: PlantStatus;
  mainSuspicion: string;
  confidence: Confidence;
  observedSigns: string[];
  otherPossibilities: string[];
  immediateActions: string[];
  avoid: string[];
  urgencySigns: string[];
  whatToObserve?: string[];
  improvementSigns?: string[];
  careTimeline?: { when: string; task: string }[];
  reevaluateInDays: number;
  /** P-003 — hipóteses alternativas ranqueadas. Ausente em diagnósticos antigos. */
  differential?: DifferentialHypothesis[];
  /** P-006 — o que foi lido do histórico. Ausente quando nada foi usado. */
  contextUsed?: DiagnosisContextUsed[];
  /**
   * P-005 — campos que o modelo não conseguiu produzir. Quando presente, a UI
   * mostra falha parcial nomeada em vez de tela genérica de erro.
   */
  missingFields?: string[];
}

export type TimelineType =
  | "rega"
  | "adubacao"
  | "poda"
  | "diagnostico"
  | "troca_vaso"
  | "floracao"
  | "foto";

export interface TimelineEntry {
  id: string;
  plantId: string;
  type: TimelineType;
  date: string;
  note?: string;
  photo?: string;
}

export interface Product {
  id: string;
  name: string;
  goal: string;
  moment: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  attachments?: string[];
  plantId?: string;
  createdAt: string;
}
