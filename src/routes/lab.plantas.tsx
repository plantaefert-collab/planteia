// PILOTO (rota paralela, não linkada na navegação).
// Objetivo: validar ponta a ponta login real + plantas salvas no banco.
// A tela oficial (/app/plantas) segue intacta com dados de exemplo.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sprout, Trash2, LogOut, Database } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/lab/plantas")({
  head: () => ({ meta: [{ title: "Piloto · Plantas reais" }] }),
  component: LabPlantas,
});

type PlantRow = {
  id: string;
  nickname: string;
  species: string | null;
  environment: "interno" | "externo" | null;
  created_at: string;
};

function LabPlantas() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando sessão…
        </div>
      </Shell>
    );
  }

  if (!session) return <Shell><AuthForm /></Shell>;

  return (
    <Shell>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Conectado como</p>
          <p className="truncate text-sm font-medium">{session.user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
        </Button>
      </div>
      <PlantsManager />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-soft text-leaf">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold leading-tight">Piloto — dados reais</h1>
            <p className="text-xs text-muted-foreground">Tela de teste. A oficial continua intacta.</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"entrar" | "criar">("criar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "criar") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          toast.info("Conta criada!", {
            description: "Confirme o e-mail que enviamos para entrar.",
          });
        } else {
          toast.success("Conta criada e sessão iniciada.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
    } catch (err) {
      toast.error("Não consegui autenticar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display text-lg font-semibold">
          {mode === "criar" ? "Criar conta" : "Entrar"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Precisamos saber quem é você para guardar suas plantas.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password" type="password" required minLength={6}
          autoComplete={mode === "criar" ? "new-password" : "current-password"}
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="mínimo 6 caracteres"
        />
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "criar" ? "Criar conta" : "Entrar"}
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "criar" ? "entrar" : "criar")}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {mode === "criar" ? "Já tenho conta — entrar" : "Não tenho conta — criar"}
      </button>
    </form>
  );
}

function PlantsManager() {
  const qc = useQueryClient();
  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState("");

  const plants = useQuery({
    queryKey: ["lab-plants"],
    queryFn: async (): Promise<PlantRow[]> => {
      const { data, error } = await supabase
        .from("plants")
        .select("id, nickname, species, environment, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addPlant = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const { error } = await supabase.from("plants").insert({
        user_id: auth.user.id,
        nickname: nickname.trim(),
        species: species.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNickname("");
      setSpecies("");
      qc.invalidateQueries({ queryKey: ["lab-plants"] });
      toast.success("Planta salva no banco!");
    },
    onError: (err) =>
      toast.error("Não consegui salvar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      }),
  });

  const removePlant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lab-plants"] });
      toast.success("Planta removida.");
    },
  });

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (nickname.trim()) addPlant.mutate();
        }}
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
      >
        <h2 className="font-display text-lg font-semibold">Cadastrar planta</h2>

        <div className="space-y-1.5">
          <Label htmlFor="nick">Apelido *</Label>
          <Input
            id="nick" required value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ex.: Orquídea da sala"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp">Espécie</Label>
          <Input
            id="sp" value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="Ex.: Phalaenopsis"
          />
        </div>

        <Button type="submit" className="w-full" disabled={addPlant.isPending || !nickname.trim()}>
          {addPlant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar no banco
        </Button>
      </form>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Minhas plantas</h2>
          <span className="text-xs text-muted-foreground">
            {plants.data ? `${plants.data.length} salva(s)` : ""}
          </span>
        </div>

        {plants.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Buscando no banco…
          </div>
        )}

        {plants.isError && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            Erro ao ler: {(plants.error as Error).message}
          </p>
        )}

        {plants.data?.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            Nenhuma planta ainda. Cadastre a primeira acima — depois feche o app e volte para conferir que ela continua aqui.
          </p>
        )}

        <ul className="space-y-2">
          {plants.data?.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-leaf-soft text-leaf">
                <Sprout className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.nickname}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.species || "espécie não informada"} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button
                variant="ghost" size="icon" aria-label="Remover"
                onClick={() => removePlant.mutate(p.id)}
                disabled={removePlant.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
