import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, LogOut, Download, Trash2, Loader2, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Plantae AI" }] }),
  component: Profile,
});

function Profile() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const logado = !!session;

  const perfil = useQuery({
    queryKey: ["perfil", session?.user?.id],
    enabled: logado,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, city")
        .eq("id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (perfil.data) {
      setName(perfil.data.name ?? "");
      setCity(perfil.data.city ?? "");
    }
  }, [perfil.data]);

  const salvar = async () => {
    if (!session?.user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() || null, city: city.trim() || null })
        .eq("id", session.user.id);
      if (error) throw error;
      toast.success("Perfil atualizado!");
    } catch (err) {
      toast.error("Não consegui salvar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const sair = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/" });
  };

  return (
    <AppShell title="Perfil e configurações">
      <div className="mx-auto max-w-2xl space-y-6">
        {!loading && !logado && (
          <div className="flex items-start gap-3 rounded-2xl border border-leaf/20 bg-leaf-soft/40 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-leaf-dark">Você está na demonstração</p>
              <p className="mt-0.5 text-muted-foreground">
                Os dados abaixo são de exemplo. Entre na sua conta para ver os seus.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/auth/login">Entrar</Link>
              </Button>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Dados pessoais</h3>

          {logado && perfil.isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando seus dados…
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="n">Nome</Label>
                  <Input
                    id="n"
                    value={logado ? name : "Maria"}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!logado}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e">E-mail</Label>
                  <Input
                    id="e"
                    type="email"
                    value={logado ? (session!.user.email ?? "") : "maria@email.com"}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c">Cidade</Label>
                  <Input
                    id="c"
                    value={logado ? city : "São Paulo, SP"}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!logado}
                    placeholder="Ex.: São Paulo, SP"
                  />
                </div>
              </div>
              {logado && (
                <Button className="mt-4" onClick={salvar} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar alterações
                </Button>
              )}
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Notificações</h3>
          <div className="mt-3 space-y-3">
            {[
              "Lembretes de rega",
              "Alertas de plantas em atenção",
              "Dica do dia",
              "Novidades da PlantaeFert",
            ].map((n) => (
              <div key={n} className="flex items-center justify-between">
                <span className="text-sm">{n}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-bloom-soft to-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Plano atual
            </span>
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold">Gratuito</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre plantas, use lembretes e diagnóstico com limites.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Privacidade</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4" /> Exportar meus dados
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. Todos os seus dados serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.info("Em breve: exclusão definitiva da conta.")}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <Separator />

        {logado ? (
          <Button variant="outline" className="w-full" onClick={sair}>
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <LogOut className="h-4 w-4" /> Voltar ao início
            </Link>
          </Button>
        )}
      </div>
    </AppShell>
  );
}
