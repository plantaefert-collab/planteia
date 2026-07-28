import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton, OrDivider } from "@/components/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { traduzErroAuth, destinoPosLogin } from "@/lib/auth-helpers";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const destino = await destinoPosLogin();
      navigate({ to: destino });
    } catch (err) {
      toast.error("Não consegui entrar", { description: traduzErroAuth(err) });
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Bem-vindo de volta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Entre para acompanhar suas plantas.
      </p>
      <div className="mt-6">
        <GoogleSignInButton label="Entrar com Google" />
        <OrDivider />
      </div>
      <form className="space-y-4" onSubmit={entrar}>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/auth/recover" className="text-xs text-leaf hover:underline">
              Esqueci
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/auth/signup" className="font-medium text-leaf hover:underline">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
