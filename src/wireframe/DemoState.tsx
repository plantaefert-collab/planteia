import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import {
  initialPlants,
  initialTasks,
  initialHistory,
  initialDiagnoses,
  scenarios,
  scenarioBySymptom,
} from "./mockData";
import type {
  DemoPlant,
  DemoTask,
  DemoDiagnosis,
  DemoHistoryEntry,
  WireframeScreen,
  DiagnosisScenarioKey,
} from "./types";

interface State {
  plants: DemoPlant[];
  tasks: DemoTask[];
  history: DemoHistoryEntry[];
  diagnoses: DemoDiagnosis[];
}

type Action =
  | { type: "reset" }
  | { type: "addPlant"; plant: DemoPlant }
  | { type: "toggleTask"; id: string }
  | { type: "addTask"; task: DemoTask }
  | { type: "addHistory"; entry: DemoHistoryEntry }
  | { type: "addDiagnosis"; diagnosis: DemoDiagnosis; tasks: DemoTask[] }
  | { type: "updatePlant"; id: string; patch: Partial<DemoPlant> };

const initialState: State = {
  plants: initialPlants,
  tasks: initialTasks,
  history: initialHistory,
  diagnoses: initialDiagnoses,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return { ...initialState };
    case "addPlant":
      return { ...state, plants: [...state.plants, action.plant] };
    case "toggleTask":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case "addTask":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "addHistory":
      return { ...state, history: [action.entry, ...state.history] };
    case "addDiagnosis":
      return {
        ...state,
        diagnoses: [...state.diagnoses, action.diagnosis],
        tasks: [...state.tasks, ...action.tasks],
        history: [
          {
            id: `h-${action.diagnosis.id}`,
            plantId: action.diagnosis.plantId,
            type: "diagnostico",
            title: `Diagnóstico: ${action.diagnosis.hypothesis}`,
            date: action.diagnosis.date,
          },
          ...state.history,
        ],
        plants: state.plants.map((p) =>
          p.id === action.diagnosis.plantId ? { ...p, hasPlan: true, status: "acompanhamento" } : p,
        ),
      };
    case "updatePlant":
      return {
        ...state,
        plants: state.plants.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };
  }
}

interface Navigation {
  screen: WireframeScreen;
  params: Record<string, string | undefined>;
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  nav: Navigation;
  go: (screen: WireframeScreen, params?: Record<string, string | undefined>) => void;
  back: () => void;
  history: Navigation[];
  guided: boolean;
  setGuided: (v: boolean) => void;
  guidedStep: number;
  nextGuidedStep: () => void;
  prevGuidedStep: () => void;
  guidedFlow: WireframeScreen[];
  buildScenarioDiagnosis: (plantId: string, symptoms: string[]) => DemoDiagnosis;
  buildTasksFromDiagnosis: (d: DemoDiagnosis) => DemoTask[];
  reset: () => void;
}

const DemoCtx = createContext<Ctx | null>(null);

export const guidedFlow: WireframeScreen[] = [
  "welcome",
  "login",
  "onboarding",
  "dashboard",
  "plants",
  "plantDetail",
  "diagnosis",
  "calendar",
  "journal",
  "gardener",
  "products",
  "profile",
];

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [navStack, setNavStack] = useState<Navigation[]>([{ screen: "welcome", params: {} }]);
  const [guided, setGuided] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);

  const nav = navStack[navStack.length - 1];

  const go = useCallback((screen: WireframeScreen, params: Record<string, string | undefined> = {}) => {
    setNavStack((s) => [...s, { screen, params }]);
  }, []);

  const back = useCallback(() => {
    setNavStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const nextGuidedStep = useCallback(() => {
    setGuidedStep((s) => {
      const next = Math.min(s + 1, guidedFlow.length - 1);
      setNavStack((stack) => [...stack, { screen: guidedFlow[next], params: {} }]);
      return next;
    });
  }, []);

  const prevGuidedStep = useCallback(() => {
    setGuidedStep((s) => {
      const prev = Math.max(s - 1, 0);
      setNavStack((stack) => [...stack, { screen: guidedFlow[prev], params: {} }]);
      return prev;
    });
  }, []);

  const buildScenarioDiagnosis = useCallback((plantId: string, symptoms: string[]): DemoDiagnosis => {
    let key: DiagnosisScenarioKey = "inconclusivo";
    for (const s of symptoms) {
      if (scenarioBySymptom[s]) {
        key = scenarioBySymptom[s];
        break;
      }
    }
    const base = scenarios[key];
    const now = new Date();
    const reassess = new Date(now);
    reassess.setDate(reassess.getDate() + 7);
    return {
      id: `d-${Date.now()}`,
      plantId,
      date: now.toISOString(),
      symptoms,
      reassessOn: reassess.toISOString(),
      ...base,
    };
  }, []);

  const buildTasksFromDiagnosis = useCallback((d: DemoDiagnosis): DemoTask[] => {
    const now = new Date();
    const mkDate = (offset: number) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString();
    };
    return [
      ...d.timeline.today.map((title, i) => ({
        id: `dt-${d.id}-today-${i}`,
        plantId: d.plantId,
        type: "observacao" as const,
        title,
        dueDate: mkDate(0),
        done: false,
        priority: d.priority,
        origin: "diagnostico" as const,
      })),
      ...d.timeline.day3.map((title, i) => ({
        id: `dt-${d.id}-d3-${i}`,
        plantId: d.plantId,
        type: "observacao" as const,
        title,
        dueDate: mkDate(3),
        done: false,
        priority: d.priority,
        origin: "diagnostico" as const,
      })),
      {
        id: `dt-${d.id}-reassess`,
        plantId: d.plantId,
        type: "reavaliacao" as const,
        title: "Reavaliar planta",
        dueDate: d.reassessOn,
        done: false,
        priority: d.priority,
        origin: "diagnostico" as const,
      },
    ];
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    setNavStack([{ screen: "welcome", params: {} }]);
    setGuided(false);
    setGuidedStep(0);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      nav,
      go,
      back,
      history: navStack,
      guided,
      setGuided,
      guidedStep,
      nextGuidedStep,
      prevGuidedStep,
      guidedFlow,
      buildScenarioDiagnosis,
      buildTasksFromDiagnosis,
      reset,
    }),
    [state, nav, go, back, navStack, guided, guidedStep, nextGuidedStep, prevGuidedStep, buildScenarioDiagnosis, buildTasksFromDiagnosis, reset],
  );

  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoCtx);
  if (!ctx) throw new Error("useDemo must be used inside DemoStateProvider");
  return ctx;
}

export const screenLabels: Record<WireframeScreen, string> = {
  welcome: "Boas-vindas",
  login: "Login",
  signup: "Cadastro",
  recover: "Recuperar senha",
  onboarding: "Onboarding",
  dashboard: "Início",
  plants: "Minhas plantas",
  newPlant: "Nova planta",
  plantDetail: "Ficha da planta",
  diagnosis: "Diagnóstico",
  calendar: "Calendário",
  journal: "Diário",
  gardener: "Jardineiro IA",
  products: "Produtos",
  profile: "Perfil",
  reassessment: "Reavaliação",
};
