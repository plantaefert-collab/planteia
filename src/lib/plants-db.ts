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
    if (!data) return undefined;
    const planta = paraPlanta(data);

    // A ficha abre respondendo "o que fazer com esta planta agora".
    try {
      const { data: t } = await sbNovo
        .from("care_tasks")
        .select("title, date, type")
        .eq("plant_id", id)
        .eq("done", false)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (t) {
        planta.nextCare = {
          label: ROTULO_TIPO[t.type] ?? t.title,
          whenLabel: quandoLabel(t.date),
        };
      }
    } catch {
      // Sem tarefa a ficha continua completa — só não destaca a próxima ação.
    }

    return planta;
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

  /** Cria uma tarefa avulsa (a pessoa marcando algo que quer lembrar). */
  async create(t: {
    plantId: string;
    type: CareType;
    title: string;
    date: string;
    description?: string;
  }): Promise<CareTask> {
    const userId = await usuarioAtual();
    if (!userId) throw new Error("Entre na sua conta para criar tarefas.");
    const { data, error } = await sbNovo
      .from("care_tasks")
      .insert({
        user_id: userId,
        plant_id: t.plantId,
        type: t.type,
        title: t.title,
        description: t.description ?? null,
        date: t.date,
        origin: "manual",
      })
      .select("*")
      .single();
    if (error) throw error;
    return paraTarefa(data);
  },

  /**
   * Garante que cada planta com frequência de rega definida tenha uma rega
   * pendente no calendário. É isto que faz o calendário "trabalhar sozinho":
   * a pessoa não deveria precisar agendar a própria rega.
   *
   * Idempotente: só cria para quem não tem rega em aberto.
   */
  async ensureWateringTasks(): Promise<number> {
    const userId = await usuarioAtual();
    if (!userId) return 0;

    const { data: plantas } = await supabase
      .from("plants")
      .select("id, nickname, watering_frequency_days, last_watered");
    const comFrequencia = (plantas ?? []).filter((p) => p.watering_frequency_days);
    if (comFrequencia.length === 0) return 0;

    const { data: pendentes } = await sbNovo
      .from("care_tasks")
      .select("plant_id")
      .eq("type", "regar")
      .eq("done", false);
    const jaTem = new Set((pendentes ?? []).map((t: Record<string, any>) => t.plant_id));

    const novas = comFrequencia
      .filter((p) => !jaTem.has(p.id))
      .map((p) => {
        const base = p.last_watered ? new Date(p.last_watered) : new Date();
        const quando = new Date(base.getTime() + p.watering_frequency_days! * 86400000);
        // Rega vencida não some: aparece como atrasada, hoje.
        const data = quando < new Date() ? new Date() : quando;
        return {
          user_id: userId,
          plant_id: p.id,
          type: "regar",
          title: `Regar ${p.nickname}`,
          date: data.toISOString(),
          origin: "automatica",
        };
      });

    if (novas.length === 0) return 0;
    const { error } = await sbNovo.from("care_tasks").insert(novas);
    if (error) throw error;
    return novas.length;
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

    // O estado da planta passa a refletir o último diagnóstico — é o que faz a
    // lista e a ficha mostrarem melhora ou piora sem a pessoa marcar nada.
    if (dados.plantId) {
      await supabase
        .from("plants")
        .update({ status: d.status })
        .eq("id", dados.plantId)
        .then(() => undefined, () => undefined);
    }

    return data.id as string;
  },

  /**
   * Resumo do diagnóstico anterior da planta, para comparar com o novo.
   * `exceto` evita comparar o diagnóstico consigo mesmo quando ele já foi salvo.
   */
  async anteriorDaPlanta(
    plantId: string,
    exceto?: string,
  ): Promise<{ id: string; mainSuspicion: string; status: string; createdAt: string; photo?: string } | null> {
    let q = sbNovo
      .from("diagnoses")
      .select("id, main_suspicion, status, created_at, photos")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(2);
    const { data, error } = await q;
    if (error) throw error;
    const linhas = ((data ?? []) as Record<string, any>[]).filter((r) => r.id !== exceto);
    const r = linhas[0];
    if (!r) return null;
    return {
      id: r.id,
      mainSuspicion: r.main_suspicion,
      status: r.status,
      createdAt: r.created_at,
      photo: (r.photos ?? [])[0],
    };
  },

  /** Liga um diagnóstico feito "sem cadastro" à planta recém-criada. */
  async attachToPlant(rowId: string, plantId: string): Promise<void> {
    const { data, error } = await sbNovo
      .from("diagnoses")
      .update({ plant_id: plantId })
      .eq("id", rowId)
      .select("status")
      .single();
    if (error) throw error;
    if (data?.status) {
      await supabase
        .from("plants")
        .update({ status: data.status })
        .eq("id", plantId)
        .then(() => undefined, () => undefined);
    }
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

  /** O diagnóstico mais recente da planta, no formato que as telas usam. */
  async latestByPlant(plantId: string): Promise<Diagnosis | null> {
    const { data, error } = await sbNovo
      .from("diagnoses")
      .select("*")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return paraDiagnostico(data);
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


/** Converte a linha de `diagnoses` para o formato usado nas telas. */
function paraDiagnostico(r: Record<string, any>): Diagnosis {
  return {
    id: r.id,
    plantId: r.plant_id ?? undefined,
    createdAt: r.created_at,
    status: r.status,
    mainSuspicion: r.main_suspicion,
    confidence: r.confidence,
    observedSigns: r.observed_signs ?? [],
    otherPossibilities: r.other_possibilities ?? [],
    immediateActions: r.immediate_actions ?? [],
    avoid: r.avoid ?? [],
    urgencySigns: r.urgency_signs ?? [],
    whatToObserve: r.what_to_observe ?? [],
    improvementSigns: r.improvement_signs ?? [],
    careTimeline: r.care_timeline ?? [],
    reevaluateInDays: r.reevaluate_in_days ?? 7,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloco 7 — memória do chat
// ─────────────────────────────────────────────────────────────────────────────

export type MensagemSalva = {
  id: string;
  role: "user" | "assistant";
  content: string;
  photo?: string;
  plantId?: string;
  createdAt: string;
};

export const chatDb = {
  /** Últimas mensagens do usuário, em ordem cronológica. */
  async list(limite = 50): Promise<MensagemSalva[]> {
    const { data, error } = await sbNovo
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return ((data ?? []) as Record<string, any>[])
      .reverse()
      .map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        photo: r.photo ?? undefined,
        plantId: r.plant_id ?? undefined,
        createdAt: r.created_at,
      }));
  },

  async add(m: {
    role: "user" | "assistant";
    content: string;
    plantId?: string;
    photo?: string;
  }): Promise<void> {
    const userId = await usuarioAtual();
    if (!userId) return;
    await sbNovo.from("chat_messages").insert({
      user_id: userId,
      plant_id: m.plantId ?? null,
      role: m.role,
      content: m.content,
      photo: m.photo ?? null,
    });
  },

  async clear(): Promise<void> {
    const userId = await usuarioAtual();
    if (!userId) return;
    await sbNovo.from("chat_messages").delete().eq("user_id", userId);
  },
};
