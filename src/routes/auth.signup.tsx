import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton, OrDivider } from "@/components/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { traduzErroAuth, regrasSenha } from "@/lib/auth-helpers";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const regras = regrasSenha(password);
  const senhaOk = regras.every((r) => r.ok);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !senhaOk) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      });
      if (error) throw error;
      toast.success("Conta criada!", { description: "Agora conta um pouco sobre você." });
      navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error("Não consegui criar a conta", { description: traduzErroAuth(err) });
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Criar sua conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gratuito para começar. Sem cartão.
      </p>
      <div className="mt-6">
        <GoogleSignInButton label="Cadastrar com Google" />
        <OrDivider />
      </div>
      <form className="space-y-4" onSubmit={criar}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Como podemos te chamar?</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {busy ? "Criando…" : "Criar conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/auth/login" className="font-medium text-leaf hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
