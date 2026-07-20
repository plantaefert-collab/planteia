import type {
  CareTask,
  ChatMessage,
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

export const mockDiagnosis: Diagnosis = {
  id: "d1",
  plantId: "p1",
  createdAt: addDays(0),
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
  reevaluateInDays: 7,
};

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
