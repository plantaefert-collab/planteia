// Perfil do usuário logado (tabela `profiles`).
// Usado para personalizar a conversa com o Jardineiro: saber o nome e o nível
// de experiência permite que a IA acolha e ajuste a profundidade da resposta.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export type Perfil = {
  name: string | null;
  level: string | null;
  city: string | null;
  goal: string | null;
};

export function useProfile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("profiles")
      .select("name, level, city, goal")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setProfile(data ?? null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { profile, loading };
}
