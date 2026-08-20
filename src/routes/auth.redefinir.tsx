import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { traduzErroAuth, regrasSenha } from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth/redefinir")({
  head: () => ({ meta: [{ title: "Definir nova senha · Plantae AI" }] }),
  component: Redefinir,
});

function Redefinir() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false);
  // O link do e-mail traz um token que o cliente troca por uma sessão temporária.
  // Sem ela não há o que redefinir — e a pessoa precisa saber disso na hora.
  const [temSessao, setTemSessao] = useState<boolean | null>(null);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (ativo) setTemSessao(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sessao) => {
      setTemSessao(!!sessao);
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const regras = regrasSenha(senha);
  const senhaOk = regras.every((r) => r.ok);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !senhaOk) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha alterada!", { description: "Você já está conectado." });
      navigate({ to: "/app/inicio" });
    } catch (err) {
      toast.error("Não consegui alterar", { description: traduzErroAuth(err) });
      setBusy(false);
    }
  };

  if (temSessao === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verificando o link…
      </div>
    );
  }

  if (!temSessao) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Link expirado</h1>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft/30 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">
            Este link de recuperação já foi usado ou passou da validade. Peça um novo —
            leva menos de um minuto.
          </p>
        </div>
        <Button asChild className="mt-4 w-full">
          <Link to="/auth/recover">Pedir novo link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Definir nova senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha uma senha nova para entrar na sua conta.
      </p>

      <form className="mt-6 space-y-4" onSubmit={salvar}>
        <div className="space-y-1.5">
          <Label htmlFor="nova-senha">Nova senha</Label>
          <Input
            id="nova-senha"
            type="password"
            autoComplete="new-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
          <ul className="space-y-1 pt-1">
            {regras.map((r) => (
              <li
                key={r.texto}
                className={`flex items-center gap-1.5 text-xs ${
                  r.ok ? "text-leaf" : "text-muted-foreground"
                }`}
              >
                <Check className={`h-3 w-3 ${r.ok ? "opacity-100" : "opacity-30"}`} />
                {r.texto}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={busy || !senhaOk}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {busy ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
