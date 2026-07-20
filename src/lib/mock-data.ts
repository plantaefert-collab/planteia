import type {
  CareTask,
  ChatMessage,
  Confidence,
  Diagnosis,
  Plant,
  Product,
  TimelineEntry,
} from "./types";

const today = new Date();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

// Neutral botanical placeholder photos (Unsplash direct URLs)
const PHOTO_ORCHID =
  "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&auto=format&fit=crop";
const PHOTO_DESERT_ROSE =
  "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&auto=format&fit=crop";
const PHOTO_FERN =
  "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=800&auto=format&fit=crop";

export const mockPlants: Plant[] = [
  {
    id: "p1",
    nickname: "Orquídea da sala",
    species: "Phalaenopsis",
    scientific: "Phalaenopsis sp.",
    photo: PHOTO_ORCHID,
    status: "atencao",
    environment: "interno",
    light: "indireta",
    potSize: "Vaso 12 cm",
    wateringFrequencyDays: 7,
    acquiredAt: addDays(-120),
    lastWatered: addDays(-6),
    lastFertilized: addDays(-25),
    nextCare: { label: "Verificar raízes", whenLabel: "hoje" },
  },
  {
    id: "p2",
    nickname: "Rosa-do-deserto",
    species: "Rosa-do-deserto",
    scientific: "Adenium obesum",
    photo: PHOTO_DESERT_ROSE,
    status: "saudavel",
    environment: "externo",
    light: "alta",
    potSize: "Vaso 20 cm",
    wateringFrequencyDays: 10,
    acquiredAt: addDays(-300),
    lastWatered: addDays(-8),
    lastFertilized: addDays(-40),
    nextCare: { label: "Regar", whenLabel: "em 2 dias" },
  },
  {
    id: "p3",
    nickname: "Samambaia da varanda",
    species: "Samambaia",
    scientific: "Nephrolepis exaltata",
    photo: PHOTO_FERN,
    status: "acompanhamento",
    environment: "externo",
    light: "media",
    potSize: "Vaso suspenso 18 cm",
    wateringFrequencyDays: 3,
    acquiredAt: addDays(-60),
    lastWatered: addDays(-2),
    lastFertilized: addDays(-30),
    nextCare: { label: "Verificar umidade", whenLabel: "amanhã" },
  },
];

export const mockCareTasks: CareTask[] = [
  {
    id: "t1",
    plantId: "p1",
    type: "pragas",
    title: "Verificar raízes da Orquídea",
    date: addDays(0),
    done: false,
  },
  {
    id: "t2",
    plantId: "p3",
    type: "regar",
    title: "Verificar umidade da Samambaia",
    date: addDays(1),
    done: false,
  },
  {
    id: "t3",
    plantId: "p2",
    type: "regar",
    title: "Regar Rosa-do-deserto",
    date: addDays(2),
    done: false,
  },
  {
    id: "t4",
    plantId: "p1",
    type: "adubar",
    title: "Adubar Orquídea (Bokashi)",
    date: addDays(5),
    done: false,
  },
  {
    id: "t5",
    plantId: "p3",
    type: "fotografar",
    title: "Fotografar evolução da Samambaia",
    date: addDays(7),
    done: false,
  },
  {
    id: "t6",
    plantId: "p2",
    type: "podar",
    title: "Podar galhos secos",
    date: addDays(-2),
    done: true,
  },
];

export const mockTimeline: TimelineEntry[] = [
  {
    id: "e1",
    plantId: "p1",
    type: "rega",
    date: addDays(-6),
    note: "Imersão de 15 min em água filtrada.",
  },
  {
    id: "e2",
    plantId: "p1",
    type: "adubacao",
    date: addDays(-25),
    note: "Bokashi Orquídeas — meia colher.",
  },
  {
    id: "e3",
    plantId: "p1",
    type: "floracao",
    date: addDays(-45),
    note: "Nova haste floral detectada.",
  },
  {
    id: "e4",
    plantId: "p1",
    type: "foto",
    date: addDays(-10),
    photo: PHOTO_ORCHID,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod1",
    name: "Enraizador Forte 500 ml",
    goal: "Estimula formação de novas raízes",
    moment: "Após troca de vaso ou raízes fracas",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop",
  },
  {
    id: "prod2",
    name: "Bokashi Orquídeas 500 ml",
    goal: "Adubação orgânica equilibrada",
    moment: "Manutenção mensal em orquídeas",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&auto=format&fit=crop",
  },
];

export const mockDiagnosesByPlant: Record<string, Diagnosis> = {
  p1: {
    id: "d-p1",
    plantId: "p1",
    createdAt: addDays(-4),
    status: "atencao",
    mainSuspicion: "Excesso de umidade nas raízes",
    confidence: "moderada",
    observedSigns: [
      "Folhas amolecidas e amareladas na base",
      "Substrato encharcado",
      "Algumas raízes escurecidas",
    ],
    otherPossibilities: [
      "Deficiência de nutrientes",
      "Baixa luminosidade prolongada",
    ],
    immediateActions: [
      "Retirar do vaso e inspecionar as raízes",
      "Cortar raízes escuras com tesoura esterilizada",
      "Deixar secar ao ar por algumas horas",
      "Replantar em substrato para orquídeas bem drenado",
    ],
    avoid: [
      "Regar novamente antes do substrato secar",
      "Deixar em local sem circulação de ar",
    ],
    urgencySigns: [
      "Coleto (base) amolecido e escuro",
      "Odor forte no substrato",
      "Folhas caindo em sequência",
    ],
    reevaluateInDays: 3,
  },
  p3: {
    id: "d-p3",
    plantId: "p3",
    createdAt: addDays(-10),
    status: "acompanhamento",
    mainSuspicion: "Baixa umidade do ar",
    confidence: "alta",
    observedSigns: [
      "Pontas das folhas ressecadas",
      "Perda leve de folíolos",
    ],
    otherPossibilities: ["Ventilação excessiva", "Rega irregular"],
    immediateActions: [
      "Borrifar água filtrada nas folhas 2x ao dia",
      "Agrupar com outras plantas para aumentar umidade local",
      "Manter longe de ar-condicionado",
    ],
    avoid: ["Sol direto do meio-dia", "Substrato encharcado"],
    urgencySigns: ["Folhas totalmente marrons", "Queda maciça de folíolos"],
    reevaluateInDays: 14,
  },
  // p2 (Rosa-do-deserto) intencionalmente sem diagnóstico
};

export type SymptomId = 
  | "folhas_amarelas" | "folhas_murchas" | "folhas_enrugadas" 
  | "pontas_secas" | "manchas" | "folhas_queimadas" 
  | "raizes_escuras" | "raizes_ressecadas" | "queda_flores" 
  | "sem_flores" | "pragas" | "furos_insetos" 
  | "substrato_umido" | "crescimento_parado" | "debilitada" | "outro";

export interface DiagnosisScenario {
  id: string;
  title: string;
  confidence: Confidence;
  priority: "orientacao_preventiva" | "observacao" | "atencao" | "acao_prioritaria" | "investigacao_necessaria";

  why: string[];
  whatToDo: string[];
  whatToAvoid: string[];
  whatToObserve: string[];
  improvementSigns: string[];
  alertSigns: string[];
  timeline: { when: string; task: string }[];
}

export const diagnosisScenarios: Record<string, DiagnosisScenario> = {
  excesso_umidade: {
    id: "excesso_umidade",
    title: "Possível excesso de umidade",
    confidence: "moderada-alta",
    priority: "atencao",
    why: [
      "Folhas com amarelamento na base",
      "Substrato permanecendo úmido por muito tempo",
      "Raízes com coloração escura ou textura mole",
      "Acúmulo de água no fundo do cachepô ou pratinho"
    ],
    whatToDo: [
      "Suspender temporariamente a rega por pelo menos 7-10 dias",
      "Verificar se os furos de drenagem do vaso estão obstruídos",
      "Retirar qualquer água acumulada no cachepô imediatamente",
      "Manter a planta em local com excelente ventilação e luz indireta"
    ],
    whatToAvoid: [
      "Não aplicar adubos ou fertilizantes enquanto a planta estiver debilitada",
      "Não regar seguindo um cronograma fixo, use o teste do dedo",
      "Evitar luz solar direta forte que pode estressar ainda mais as folhas"
    ],
    whatToObserve: [
      "Nos próximos 3 dias, veja se o amarelamento estabiliza",
      "Sinta se há odor de apodrecimento vindo do substrato",
      "Verifique se as raízes continuam firmes"
    ],
    improvementSigns: [
      "Interrupção do avanço do amarelamento",
      "Substrato voltando a secar em ritmo normal",
      "Novas raízes verdes ou prateadas surgindo"
    ],
    alertSigns: [
      "Mau cheiro intenso vindo do vaso",
      "Folhas caindo verdes ainda na base",
      "Manchas escuras avançando para o caule principal"
    ],
    timeline: [
      { when: "Hoje", task: "Suspender rega e conferir drenagem" },
      { when: "Em 3 dias", task: "Verificar raízes e registrar observação" },
      { when: "Em 7 dias", task: "Atualizar diagnóstico e revisar plano" }
    ]
  },
  falta_agua: {
    id: "falta_agua",
    title: "Possível falta de água",
    confidence: "alta",
    priority: "atencao",
    why: [
      "Substrato totalmente seco e leve",
      "Folhas murchas ou com aspecto 'triste'",
      "Raízes muito esbranquiçadas ou finas",
      "Solo se afastando das bordas do vaso"
    ],
    whatToDo: [
      "Fazer uma rega por imersão (15 min) para hidratar o substrato",
      "Borrifar água nas folhas para alívio imediato (se a espécie permitir)",
      "Revisar a frequência de rega para os próximos dias",
      "Verificar se a planta está recebendo calor excessivo"
    ],
    whatToAvoid: [
      "Não encharcar diariamente após a primeira rega de recuperação",
      "Não colocar no sol forte logo após a rega (risco de queima)"
    ],
    whatToObserve: [
      "Veja se as folhas recuperam a turgidez (ficam firmes) em 24h",
      "Observe se o substrato mantém a umidade por pelo menos 3 dias"
    ],
    improvementSigns: [
      "Folhas voltando a ficar eretas e firmes",
      "Cor verde ficando mais vibrante",
      "Abertura de novos botões que estavam travados"
    ],
    alertSigns: [
      "Pontas das folhas começando a secar e quebrar",
      "Queda de folhas ainda murchas",
      "Substrato que não absorve água (corre direto)"
    ],
    timeline: [
      { when: "Hoje", task: "Rega por imersão e hidratação" },
      { when: "Em 2 dias", task: "Conferir umidade do substrato" },
      { when: "Em 5 dias", task: "Avaliar turgidez das folhas" }
    ]
  },
  excesso_luz: {
    id: "excesso_luz",
    title: "Excesso de luminosidade",
    confidence: "moderada",
    priority: "observacao",
    why: [
      "Manchas secas ou amareladas no centro das folhas",
      "Folhas com aspecto 'lavado' ou pálido",
      "Presença de sol direto em horários críticos",
      "Pontas das folhas queimadas"
    ],
    whatToDo: [
      "Mudar a planta para um local com luz filtrada ou indireta",
      "Usar uma cortina leve se estiver perto de janelas",
      "Girar a planta para que todos os lados recebam luz uniforme",
      "Manter a umidade do ambiente um pouco mais alta"
    ],
    whatToAvoid: [
      "Não mudar bruscamente para um local muito escuro",
      "Não borrifar água nas folhas sob sol pleno (efeito lupa)"
    ],
    whatToObserve: [
      "Veja se novas folhas nascem com a cor verde correta",
      "Observe se as manchas param de expandir"
    ],
    improvementSigns: [
      "Novas brotações saudáveis",
      "Folhas antigas parando de desbotar"
    ],
    alertSigns: [
      "Folhas ficando totalmente amarelas e secas rapidamente",
      "Morte de brotos novos"
    ],
    timeline: [
      { when: "Hoje", task: "Mudar posicionamento da planta" },
      { when: "Em 5 dias", task: "Verificar se as manchas avançaram" },
      { when: "Em 14 dias", task: "Avaliar cor das novas folhas" }
    ]
  },
  pragas: {
    id: "pragas",
    title: "Suspeita de pragas",
    confidence: "moderada",
    priority: "acao_prioritaria",
    why: [
      "Pontos brancos, pretos ou marrons que se movem ou saem ao passar o dedo",
      "Folhas deformadas ou com furos",
      "Presença de teias finas ou substância pegajosa (melada)",
      "Marcas de 'caminhos' prateados nas folhas"
    ],
    whatToDo: [
      "Isolar a planta de outras espécies imediatamente",
      "Limpar as folhas com algodão embebido em água e sabão neutro",
      "Remover partes muito infestadas se necessário",
      "Aplicar óleo de neem ou inseticida natural específico"
    ],
    whatToAvoid: [
      "Não deixar a planta perto das outras até estar 100% limpa",
      "Não aplicar produtos químicos fortes sob sol quente"
    ],
    whatToObserve: [
      "Verifique diariamente o verso das folhas e junções",
      "Veja se aparecem novos pontos de infestação"
    ],
    improvementSigns: [
      "Ausência de novos insetos",
      "Folhas parando de deformar",
      "Planta voltando a crescer"
    ],
    alertSigns: [
      "Infestação espalhando para o caule e raízes",
      "Folhas amarelando e caindo em massa",
      "Aparecimento de fungo preto (fumagina) sobre a melada"
    ],
    timeline: [
      { when: "Hoje", task: "Isolamento e limpeza manual" },
      { when: "Em 2 dias", task: "Primeira aplicação de defensivo natural" },
      { when: "Em 7 dias", task: "Revisão completa e nova aplicação" }
    ]
  },
  investigacao: {
    id: "investigacao",
    title: "Investigação necessária",
    confidence: "baixa",
    priority: "investigacao_necessaria",
    why: [
      "Sinais relatados são contraditórios",
      "Falta de fotos nítidas para análise visual",
      "Múltiplos fatores ambientais alterados recentemente"
    ],
    whatToDo: [
      "Fotografar a área afetada com mais detalhes e luz natural",
      "Observar o verso das folhas com uma lupa se possível",
      "Registrar a frequência exata de rega nos últimos 15 dias",
      "Verificar se houve mudança de local ou adubação nova"
    ],
    whatToAvoid: [
      "Não aplicar nenhum produto ou adubo 'por tentativa e erro'",
      "Não mudar as condições de luz e rega drasticamente agora"
    ],
    whatToObserve: [
      "Veja se o problema avança para folhas novas ou fica nas velhas",
      "Sinta a textura da folha (seca vs mole) diariamente"
    ],
    improvementSigns: [
      "Estabilização dos sintomas",
      "Novas informações coletadas para diagnóstico preciso"
    ],
    alertSigns: [
      "Qualquer mudança rápida no aspecto geral da planta",
      "Morte súbita de galhos ou folhas"
    ],
    timeline: [
      { when: "Hoje", task: "Registrar observações detalhadas e novas fotos" },
      { when: "Em 3 dias", task: "Revisar sinais e tentar novo diagnóstico" }
    ]
  }
};

export const mockDiagnosis: Diagnosis = mockDiagnosesByPlant.p1;

export const mockChat: ChatMessage[] = [
  {
    id: "m1",
    role: "ai",
    content:
      "Oi! Sou seu Jardineiro IA 🌱 Posso ajudar com rega, raízes, floração e pragas. Como posso ajudar hoje?",
    createdAt: addDays(0),
  },
];

export const chatSuggestions = [
  "Minha orquídea perdeu as flores, e agora?",
  "Como sei se preciso trocar o substrato?",
  "Manchas escuras nas folhas — o que pode ser?",
  "Quando adubar minha planta?",
];
