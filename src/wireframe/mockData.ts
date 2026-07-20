import type { DemoPlant, DemoTask, DemoDiagnosis, DemoHistoryEntry, DiagnosisScenarioKey } from "./types";

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

export const initialPlants: DemoPlant[] = [
  {
    id: "p1",
    name: "Íris",
    species: "Orquídea Phalaenopsis",
    status: "saudavel",
    photo: "🌸",
    environment: "Sala com janela leste",
    light: "Indireta forte",
    waterFreq: "A cada 7 dias",
    pot: "Vaso transparente com drenagem",
    lastWatering: iso(-3),
    lastFertilizing: iso(-14),
    nextTaskTitle: "Regar em 4 dias",
    hasPlan: false,
  },
  {
    id: "p2",
    name: "Rubi",
    species: "Rosa-do-deserto",
    status: "atencao",
    photo: "🌺",
    environment: "Varanda ensolarada",
    light: "Sol pleno",
    waterFreq: "A cada 10 dias",
    pot: "Cerâmica com drenagem",
    lastWatering: iso(-2),
    lastFertilizing: iso(-30),
    nextTaskTitle: "Reduzir rega — folhas murchas",
    hasPlan: true,
  },
  {
    id: "p3",
    name: "Verde",
    species: "Samambaia",
    status: "acompanhamento",
    photo: "🌿",
    environment: "Banheiro iluminado",
    light: "Indireta",
    waterFreq: "A cada 3 dias",
    pot: "Vaso suspenso",
    lastWatering: iso(-1),
    nextTaskTitle: "Reavaliar amanhã",
    hasPlan: true,
  },
  {
    id: "p4",
    name: "Novata",
    species: "Espécie não identificada",
    status: "sem_diagnostico",
    photo: "🪴",
    environment: "Escritório",
    light: "Baixa",
    waterFreq: "Não definida",
    pot: "Plástico simples",
    hasPlan: false,
  },
];

export const initialTasks: DemoTask[] = [
  { id: "t1", plantId: "p1", type: "rega", title: "Regar Íris", dueDate: iso(4), done: false, priority: "media", origin: "manual" },
  { id: "t2", plantId: "p2", type: "observacao", title: "Verificar substrato de Rubi", dueDate: iso(0), done: false, priority: "alta", origin: "diagnostico" },
  { id: "t3", plantId: "p2", type: "reavaliacao", title: "Reavaliar Rubi", dueDate: iso(3), done: false, priority: "alta", origin: "diagnostico" },
  { id: "t4", plantId: "p3", type: "foto", title: "Foto de acompanhamento", dueDate: iso(-1), done: false, priority: "media", origin: "diagnostico" },
  { id: "t5", plantId: "p3", type: "rega", title: "Regar Samambaia", dueDate: iso(2), done: false, priority: "baixa", origin: "manual" },
];

export const initialHistory: DemoHistoryEntry[] = [
  { id: "h1", plantId: "p2", type: "diagnostico", title: "Diagnóstico: excesso de umidade", date: iso(-2) },
  { id: "h2", plantId: "p2", type: "rega", title: "Rega registrada", date: iso(-2) },
  { id: "h3", plantId: "p3", type: "diagnostico", title: "Diagnóstico: investigação necessária", date: iso(-5) },
  { id: "h4", plantId: "p1", type: "adubacao", title: "Adubação registrada", date: iso(-14) },
];

export const initialDiagnoses: DemoDiagnosis[] = [
  {
    id: "d1",
    plantId: "p2",
    date: iso(-2),
    hypothesis: "Excesso de umidade no substrato",
    confidence: "alta",
    priority: "alta",
    scenario: "excesso_umidade",
    symptoms: ["folhas murchas", "substrato úmido"],
    reasoning: "Folhas murchas com substrato ainda úmido indicam raízes saturadas.",
    doNow: ["Suspender a rega por 5 dias", "Mover para local mais ventilado"],
    avoid: ["Regar novamente antes do substrato secar", "Adubar nesta semana"],
    observe: ["Cor das folhas", "Umidade do substrato a 3 cm"],
    improvementSigns: ["Folhas voltam a ficar firmes", "Substrato seca uniformemente"],
    alertSigns: ["Amarelamento das folhas", "Odor no substrato"],
    timeline: {
      today: ["Suspender rega", "Verificar drenagem"],
      day3: ["Checar umidade do substrato", "Observar folhas"],
      day7: ["Reavaliar e retomar rega se necessário"],
    },
    reassessOn: iso(3),
  },
];

export const symptomOptions = [
  "folhas amareladas", "folhas murchas", "folhas enrugadas", "pontas secas",
  "manchas", "queimaduras", "raízes escuras ou moles", "raízes ressecadas",
  "flores ou botões caindo", "planta sem flores", "pragas", "marcas de insetos",
  "substrato úmido", "crescimento parado", "planta debilitada", "outro sinal",
];

export const scenarioBySymptom: Record<string, DiagnosisScenarioKey> = {
  "folhas murchas": "excesso_umidade",
  "substrato úmido": "excesso_umidade",
  "raízes escuras ou moles": "excesso_umidade",
  "folhas enrugadas": "falta_agua",
  "pontas secas": "falta_agua",
  "raízes ressecadas": "falta_agua",
  "queimaduras": "excesso_luz",
  "manchas": "excesso_luz",
  "pragas": "pragas",
  "marcas de insetos": "pragas",
};

export const scenarios: Record<DiagnosisScenarioKey, Omit<DemoDiagnosis, "id" | "plantId" | "date" | "symptoms" | "reassessOn">> = {
  excesso_umidade: {
    hypothesis: "Excesso de umidade no substrato",
    confidence: "alta",
    priority: "alta",
    scenario: "excesso_umidade",
    reasoning: "Sinais compatíveis com raízes encharcadas por rega excessiva ou drenagem insuficiente.",
    doNow: ["Suspender a rega por 5 dias", "Verificar drenagem do vaso", "Mover para local ventilado"],
    avoid: ["Regar antes do substrato secar", "Adubar esta semana", "Manter em prato com água parada"],
    observe: ["Firmeza das folhas", "Umidade do substrato a 3 cm de profundidade", "Aparência das raízes"],
    improvementSigns: ["Folhas mais firmes em 3 dias", "Substrato seca uniformemente"],
    alertSigns: ["Amarelamento generalizado", "Cheiro azedo no substrato", "Raízes escurecendo"],
    timeline: {
      today: ["Suspender rega", "Checar drenagem"],
      day3: ["Verificar umidade", "Registrar foto"],
      day7: ["Reavaliar e decidir próxima rega"],
    },
  },
  falta_agua: {
    hypothesis: "Falta de água ou baixa umidade ambiente",
    confidence: "media",
    priority: "media",
    scenario: "falta_agua",
    reasoning: "Folhas enrugadas e pontas secas indicam desidratação da planta.",
    doNow: ["Regar lentamente até drenar", "Umedecer o ambiente", "Retirar folhas totalmente secas"],
    avoid: ["Encharcar de uma vez", "Expor ao sol forte agora"],
    observe: ["Recuperação da folhagem em 24h", "Umidade do substrato"],
    improvementSigns: ["Folhas retomam turgor", "Novos brotos"],
    alertSigns: ["Folhas não recuperam em 48h", "Queda de folhas"],
    timeline: {
      today: ["Regar com atenção", "Borrifar folhas"],
      day3: ["Manter rotina", "Observar novos brotos"],
      day7: ["Reavaliar frequência de rega"],
    },
  },
  excesso_luz: {
    hypothesis: "Excesso de luz direta",
    confidence: "media",
    priority: "media",
    scenario: "excesso_luz",
    reasoning: "Queimaduras e manchas descoloridas indicam exposição solar direta em excesso.",
    doNow: ["Mover para luz indireta", "Remover folhas muito queimadas"],
    avoid: ["Manter em sol pleno das 11h às 15h", "Regar folhas em pleno sol"],
    observe: ["Novas manchas", "Coloração das folhas jovens"],
    improvementSigns: ["Novas folhas saudáveis", "Sem novas queimaduras"],
    alertSigns: ["Manchas se alastram", "Folhagem afinando"],
    timeline: {
      today: ["Reposicionar planta"],
      day3: ["Observar novas folhas"],
      day7: ["Reavaliar luminosidade"],
    },
  },
  pragas: {
    hypothesis: "Suspeita de infestação por pragas",
    confidence: "media",
    priority: "alta",
    scenario: "pragas",
    reasoning: "Marcas e insetos visíveis sugerem infestação inicial.",
    doNow: ["Isolar a planta", "Limpar folhas com pano úmido", "Aplicar solução neutra recomendada"],
    avoid: ["Colocar perto de outras plantas", "Usar produtos sem indicação"],
    observe: ["Presença de novos insetos", "Estado das folhas jovens"],
    improvementSigns: ["Redução de insetos em 3 dias"],
    alertSigns: ["Aumento da infestação", "Folhas caindo"],
    timeline: {
      today: ["Isolar e limpar"],
      day3: ["Reaplicar tratamento", "Observar"],
      day7: ["Reavaliar e reintroduzir se recuperada"],
    },
  },
  inconclusivo: {
    hypothesis: "Investigação necessária — sinais inespecíficos",
    confidence: "baixa",
    priority: "media",
    scenario: "inconclusivo",
    reasoning: "Os sinais informados não caracterizam um quadro específico. Recomenda-se acompanhar por alguns dias.",
    doNow: ["Registrar fotos diariamente", "Monitorar rega e luz", "Verificar substrato e raízes"],
    avoid: ["Mudanças bruscas de local", "Adubação por precaução", "Rega fora do ritmo"],
    observe: ["Evolução visual", "Cor e textura das folhas", "Novos sinais"],
    improvementSigns: ["Estabilização em 5 dias"],
    alertSigns: ["Piora rápida", "Novos sintomas"],
    timeline: {
      today: ["Registrar estado atual"],
      day3: ["Nova foto e observação"],
      day7: ["Reavaliar com mais dados"],
    },
  },
};

export const demoProducts = [
  {
    id: "pr1",
    name: "Adubo foliar orquídeas",
    reason: "Complemento nutricional para orquídeas saudáveis",
    when: "Quando o plano indicar adubação leve",
    avoid: "Evitar em plantas debilitadas ou recém-transplantadas",
  },
  {
    id: "pr2",
    name: "Substrato drenante",
    reason: "Melhora drenagem em casos de excesso de umidade",
    when: "Ao trocar de vaso ou revisar substrato",
    avoid: "Não usar sozinho em plantas que precisam reter umidade",
  },
  {
    id: "pr3",
    name: "Óleo neem",
    reason: "Auxílio no manejo de pragas leves",
    when: "Ao identificar infestação inicial",
    avoid: "Não aplicar sob sol forte — respeite o rótulo",
  },
];

export const gardenerSuggestions = [
  "Minha planta está amarela",
  "Quando devo regar?",
  "Posso adubar agora?",
  "Explique meu diagnóstico",
];
