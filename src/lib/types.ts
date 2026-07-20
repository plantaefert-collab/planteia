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
  reevaluateInDays: number;
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
