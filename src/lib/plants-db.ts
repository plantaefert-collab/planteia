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

export const plantsDb = {
  async list(): Promise<Plant[]> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(paraPlanta);
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

export const timelineDb = {
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
