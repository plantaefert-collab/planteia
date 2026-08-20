// Guarda o diagnóstico recém-feito enquanto o usuário vai cadastrar a planta.
// Quem avalia "sem cadastro" não deve perder o resultado: a foto e o
// diagnóstico viajam até a tela de cadastro e são aproveitados lá.
//
// Estado de módulo: a navegação é client-side, então sobrevive à troca de rota
// (mas não a um recarregamento — o que é aceitável para um fluxo contínuo).
import type { Diagnosis } from "./types";

export type DiagnosticoPendente = {
  photos: string[];
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  diagnosis: Diagnosis;
  /** Id da linha em `diagnoses`, quando já foi salvo. */
  diagnosisRowId?: string;
};

let pendente: DiagnosticoPendente | null = null;

export const pendingDiagnosis = {
  set(d: DiagnosticoPendente) {
    pendente = d;
  },
  /** Devolve e limpa (consumo único). */
  take(): DiagnosticoPendente | null {
    const v = pendente;
    pendente = null;
    return v;
  },
  peek(): DiagnosticoPendente | null {
    return pendente;
  },
};
