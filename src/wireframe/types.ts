export type DemoStatus = "saudavel" | "atencao" | "acompanhamento" | "sem_diagnostico";

export type DemoTaskType = "rega" | "adubacao" | "foto" | "observacao" | "reavaliacao" | "poda";

export interface DemoTask {
  id: string;
  plantId: string;
  type: DemoTaskType;
  title: string;
  dueDate: string; // ISO
  done: boolean;
  priority?: "baixa" | "media" | "alta" | "critica";
  origin?: "manual" | "diagnostico";
}

export interface DemoHistoryEntry {
  id: string;
  plantId: string;
  type: DemoTaskType | "diagnostico" | "troca_vaso";
  title: string;
  date: string;
  note?: string;
}

export interface DemoDiagnosis {
  id: string;
  plantId: string;
  date: string;
  hypothesis: string;
  confidence: "baixa" | "media" | "alta";
  priority: "baixa" | "media" | "alta" | "critica";
  scenario: DiagnosisScenarioKey;
  symptoms: string[];
  reasoning: string;
  doNow: string[];
  avoid: string[];
  observe: string[];
  improvementSigns: string[];
  alertSigns: string[];
  timeline: { today: string[]; day3: string[]; day7: string[] };
  reassessOn: string;
}

export type DiagnosisScenarioKey =
  | "excesso_umidade"
  | "falta_agua"
  | "excesso_luz"
  | "pragas"
  | "inconclusivo";

export interface DemoPlant {
  id: string;
  name: string;
  species: string;
  status: DemoStatus;
  photo: string; // emoji placeholder
  environment: string;
  light: string;
  waterFreq: string;
  pot: string;
  lastWatering?: string;
  lastFertilizing?: string;
  nextTaskTitle?: string;
  hasPlan: boolean;
}

export type WireframeScreen =
  | "welcome"
  | "login"
  | "signup"
  | "recover"
  | "onboarding"
  | "dashboard"
  | "plants"
  | "newPlant"
  | "plantDetail"
  | "diagnosis"
  | "calendar"
  | "journal"
  | "gardener"
  | "products"
  | "profile"
  | "reassessment";
