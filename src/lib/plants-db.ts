// Acesso real ao banco (Supabase) para plantas, diário e tarefas.
// A camada `services.ts` decide quando usar isto (usuário logado) ou os dados
// de exemplo (visitante da demonstração).
import { supabase } from "@/integrations/supabase/client";
import type { Plant, CareTask, TimelineEntry, PlantStatus } from "./types";

// Os tipos gerados em integrations/supabase/types.ts ainda listam apenas
// `plants` e `profiles` (foram gerados antes das tabelas do Bloco 2). Até o
// Lovable regenerá-los, as tabelas novas são acessadas por este cliente sem
// tipagem — o formato de retorno é convertido logo abaixo, nos mapeadores.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sbNovo = supabase as any;

export async function usuarioAtual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Converte a linha do banco (snake_case) para o formato usado nas telas. */
function paraPlanta(r: Record<string, any>): Plant {
  return {
    id: r.id,
    nickname: r.nickname,
    species: r.species ?? "",
    scientific: r.scientific ?? undefined,
    photo: r.photo ?? "",
    status: (r.status ?? "acompanhamento") as PlantStatus,
    environment: r.environment ?? "interno",
    light: r.light ?? "indireta",
    potSize: r.pot_size ?? undefined,
    wateringFrequencyDays: r.watering_frequency_days ?? undefined,
    acquiredAt: r.acquired_at ?? undefined,
    lastWatered: r.last_watered ?? undefined,
    lastFertilized: r.last_fertilized ?? undefined,
  };
}

export type NovaPlanta = {
  nickname: string;
  species?: string;
  photo?: string;
  environment?: "interno" | "externo";
  light?: "baixa" | "media" | "alta" | "indireta";
  potSize?: string;
  wateringFrequencyDays?: number;
  acquiredAt?: string;
};

/** "hoje", "amanhã", "atrasada", "em 5 dias" — como a pessoa pensa a data. */
function quandoLabel(iso: string): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const dias = Math.round((d.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return dias === -1 ? "atrasada 1 dia" : `atrasada ${Math.abs(dias)} dias`;
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  return `em ${dias} dias`;
}

const ROTULO_TIPO: Record<string, string> = {
  regar: "Regar",
  adubar: "Adubar",
  podar: "Podar",
  pragas: "Checar pragas",
  fotografar: "Reavaliar com foto",
  substrato: "Cuidar do substrato",
};

export const plantsDb = {
  async list(): Promise<Plant[]> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const plantas = (data ?? []).map(paraPlanta);

    // Anexa a próxima ação pendente de cada planta: é o que faz a lista dizer
    // o que precisa de você hoje, em vez de ser só um álbum de fotos.
    try {
      const { data: tarefas } = await sbNovo
        .from("care_tasks")
        .select("plant_id, title, date, type")
        .eq("done", false)
        .order("date", { ascending: true });

      const proxima = new Map<string, Record<string, any>>();
      for (const t of (tarefas ?? []) as Record<string, any>[]) {
        if (!proxima.has(t.plant_id)) proxima.set(t.plant_id, t);
      }
      for (const pl of plantas) {
        const t = proxima.get(pl.id);
        if (t) {
          pl.nextCare = {
            label: ROTULO_TIPO[t.type] ?? t.title,
            whenLabel: quandoLabel(t.date),
          };
        }
      }
    } catch {
      // Sem tarefas a lista ainda funciona — só não mostra a próxima ação.
    }

    return plantas;
  },

  async get(id: string): Promise<Plant | undefined> {
    const { data, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? paraPlanta(data) : undefined;
  },

  async create(input: NovaPlanta): Promise<Plant> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para cadastrar plantas.");

    const { data, error } = await supabase
      .from("plants")
      .insert({
        user_id: userId,
        nickname: input.nickname,
        species: input.species || null,
        photo: input.photo || null,
        environment: input.environment ?? null,
        light: input.light ?? null,
        pot_size: input.potSize || null,
        watering_frequency_days: input.wateringFrequencyDays ?? null,
        acquired_at: input.acquiredAt || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return paraPlanta(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("plants").delete().eq("id", id);
    if (error) throw error;
  },

  /** Envia a foto para o armazenamento e devolve a URL pública. */
  async uploadPhoto(dataUrl: string): Promise<string> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para enviar fotos.");

    const blob = await (await fetch(dataUrl)).blob();
    const caminho = `${userId}/${crypto.randomUUID()}.jpg`;

    const { error } = await supabase.storage
      .from("plant-photos")
      .upload(caminho, blob, { contentType: blob.type || "image/jpeg", upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from("plant-photos").getPublicUrl(caminho);
    return data.publicUrl;
  },
};

export type NovoRegistroDiario = {
  plantId: string;
  type: TimelineEntry["type"];
  note?: string;
  photo?: string;
  /** Só para adubação: o que foi aplicado e quanto. */
  productId?: string;
  doseAmount?: number;
  doseUnit?: string;
  doseForm?: string;
};

export const timelineDb = {
  /** Registra um cuidado no diário (rega, adubação, foto, observação). */
  async add(r: NovoRegistroDiario): Promise<TimelineEntry> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para registrar cuidados.");

    const { data, error } = await sbNovo
      .from("timeline_entries")
      .insert({
        user_id: userId,
        plant_id: r.plantId,
        type: r.type,
        date: new Date().toISOString(),
        note: r.note ?? null,
        photo: r.photo ?? null,
        product_id: r.productId ?? null,
        dose_amount: r.doseAmount ?? null,
        dose_unit: r.doseUnit ?? null,
        dose_form: r.doseForm ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;

    // Rega e adubação atualizam os atalhos da ficha da planta.
    const agora = new Date().toISOString();
    if (r.type === "rega") {
      await supabase.from("plants").update({ last_watered: agora }).eq("id", r.plantId);
    } else if (r.type === "adubacao") {
      await supabase.from("plants").update({ last_fertilized: agora }).eq("id", r.plantId);
    }

    return {
      id: data.id,
      plantId: data.plant_id,
      type: data.type,
      date: data.date,
      note: data.note ?? undefined,
      photo: data.photo ?? undefined,
    };
  },

  async listByPlant(plantId: string): Promise<TimelineEntry[]> {
    const { data, error } = await sbNovo
      .from("timeline_entries")
      .select("*")
      .eq("plant_id", plantId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, any>) => ({
      id: r.id,
      plantId: r.plant_id,
      type: r.type,
      date: r.date,
      note: r.note ?? undefined,
      photo: r.photo ?? undefined,
    }));
  },
};

export const tasksDb = {
  async list(): Promise<CareTask[]> {
    const { data, error } = await sbNovo
      .from("care_tasks")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(paraTarefa);
  },

  /** Marca a tarefa como feita (ou reabre) — e registra a rega/adubação no diário. */
  async toggle(taskId: string, done: boolean): Promise<void> {
    const { data, error } = await sbNovo
      .from("care_tasks")
      .update({ done })
      .eq("id", taskId)
      .select("plant_id, type, title")
      .single();
    if (error) throw error;

    if (done && data) {
      const tipoDiario =
        data.type === "regar" ? "rega" :
        data.type === "adubar" ? "adubacao" :
        data.type === "podar" ? "poda" :
        data.type === "fotografar" ? "foto" : null;
      if (tipoDiario) {
        try {
          await timelineDb.add({
            plantId: data.plant_id,
            type: tipoDiario as TimelineEntry["type"],
            note: data.title,
          });
        } catch {
          // O diário é consequência; falhar nele não desfaz a tarefa concluída.
        }
      }
    }
  },

  async listByPlant(plantId: string): Promise<CareTask[]> {
    const { data, error } = await sbNovo
      .from("care_tasks")
      .select("*")
      .eq("plant_id", plantId)
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(paraTarefa);
  },
};

function paraTarefa(r: Record<string, any>): CareTask {
  return {
    id: r.id,
    plantId: r.plant_id,
    type: r.type,
    title: r.title,
    description: r.description ?? undefined,
    date: r.date,
    done: r.done,
    priority: r.priority ?? undefined,
    origin: r.origin ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloco 3 — diagnósticos e planos de cuidado
// ─────────────────────────────────────────────────────────────────────────────

import type { Diagnosis, CarePlan, CareType } from "./types";

/** Deduz o tipo de cuidado a partir do texto da ação sugerida pela IA. */
function tipoDaAcao(texto: string): CareType {
  const t = texto.toLowerCase();
  if (/rega|regar|água|agua|molhar|encharcad/.test(t)) return "regar";
  if (/adub|fertiliz|bokashi|nutri/.test(t)) return "adubar";
  if (/pod|cortar|remover folha|remover parte/.test(t)) return "podar";
  if (/praga|inseto|cochonilha|pulgão|pulgao|neem|fungo|calda/.test(t)) return "pragas";
  if (/foto|fotograf|registr/.test(t)) return "fotografar";
  return "substrato";
}

export type DadosDiagnostico = {
  plantId?: string;
  photos: string[];      // data URLs vindas da câmera
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  diagnosis: Diagnosis;
};

export const diagnosesDb = {
  /**
   * Salva o diagnóstico. As fotos vão para o armazenamento (guardar data URL
   * na tabela inflaria o banco); no registro ficam apenas as URLs.
   */
  async create(dados: DadosDiagnostico): Promise<string> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para salvar o diagnóstico.");

    const urls: string[] = [];
    for (const foto of dados.photos) {
      if (foto.startsWith("data:image/")) {
        try {
          urls.push(await plantsDb.uploadPhoto(foto));
        } catch {
          // Uma foto que falha não pode impedir de salvar o diagnóstico.
        }
      } else if (foto) {
        urls.push(foto);
      }
    }

    const d = dados.diagnosis;
    const { data, error } = await sbNovo
      .from("diagnoses")
      .insert({
        user_id: userId,
        plant_id: dados.plantId ?? null,
        status: d.status,
        main_suspicion: d.mainSuspicion,
        confidence: d.confidence,
        observed_signs: d.observedSigns ?? [],
        other_possibilities: d.otherPossibilities ?? [],
        immediate_actions: d.immediateActions ?? [],
        avoid: d.avoid ?? [],
        urgency_signs: d.urgencySigns ?? [],
        what_to_observe: d.whatToObserve ?? [],
        improvement_signs: d.improvementSigns ?? [],
        care_timeline: d.careTimeline ?? [],
        reevaluate_in_days: d.reevaluateInDays ?? 7,
        photos: urls,
        symptom: dados.symptom ?? null,
        objective: dados.objective ?? null,
        answers: dados.answers ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  },

  /** Liga um diagnóstico feito "sem cadastro" à planta recém-criada. */
  async attachToPlant(rowId: string, plantId: string): Promise<void> {
    const { error } = await sbNovo
      .from("diagnoses")
      .update({ plant_id: plantId })
      .eq("id", rowId);
    if (error) throw error;
  },

  async listByPlant(plantId: string) {
    const { data, error } = await sbNovo
      .from("diagnoses")
      .select("*")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const carePlansDb = {
  /**
   * Cria o plano a partir do diagnóstico: as ações imediatas viram tarefas
   * para hoje, e a reavaliação vira uma tarefa agendada para o prazo indicado
   * pela IA. Também registra o diagnóstico no diário da planta.
   */
  async createFromDiagnosis(
    plantId: string,
    diagnosis: Diagnosis,
    diagnosisRowId?: string,
  ): Promise<CarePlan> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para salvar o plano.");

    const prioridade = diagnosis.status === "atencao" ? "alta" : "media";
    const dias = diagnosis.reevaluateInDays ?? 7;
    const reavaliarEm = new Date(Date.now() + dias * 86400000).toISOString();

    const { data: plano, error: erroPlano } = await sbNovo
      .from("care_plans")
      .insert({
        user_id: userId,
        plant_id: plantId,
        diagnosis_id: diagnosisRowId ?? null,
        name: `Recuperação: ${diagnosis.mainSuspicion}`,
        status: "em_andamento",
        priority: prioridade,
        avoid: diagnosis.avoid ?? [],
        next_reevaluation_at: reavaliarEm,
      })
      .select("*")
      .single();
    if (erroPlano) throw erroPlano;

    const hoje = new Date().toISOString();
    const tarefas = (diagnosis.immediateActions ?? []).map((acao) => ({
      user_id: userId,
      plant_id: plantId,
      care_plan_id: plano.id,
      type: tipoDaAcao(acao),
      title: acao,
      date: hoje,
      priority: prioridade,
      origin: "diagnostico",
    }));

    // A reavaliação fecha o ciclo: sem ela o plano não tem fim.
    tarefas.push({
      user_id: userId,
      plant_id: plantId,
      care_plan_id: plano.id,
      type: "fotografar",
      title: `Reavaliar com nova foto (${dias} dias)`,
      date: reavaliarEm,
      priority: prioridade,
      origin: "diagnostico",
    });

    const { data: criadas, error: erroTarefas } = await sbNovo
      .from("care_tasks")
      .insert(tarefas)
      .select("*");
    if (erroTarefas) throw erroTarefas;

    // Marca no diário que houve um diagnóstico.
    await sbNovo.from("timeline_entries").insert({
      user_id: userId,
      plant_id: plantId,
      type: "diagnostico",
      date: hoje,
      note: diagnosis.mainSuspicion,
      photo: null,
    });

    return {
      id: plano.id,
      plantId,
      diagnosisId: diagnosisRowId ?? diagnosis.id,
      name: plano.name,
      status: "em_andamento",
      priority: prioridade,
      createdAt: plano.created_at,
      nextReevaluationAt: reavaliarEm,
      tasks: (criadas ?? []).map(paraTarefa),
      avoid: diagnosis.avoid ?? [],
    };
  },
};
