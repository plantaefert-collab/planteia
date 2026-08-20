import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { traduzErroAuth } from "@/lib/auth-helpers";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/recover")({
  component: Recover,
});

function Recover() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/redefinir`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error("Não consegui enviar", { description: traduzErroAuth(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enviaremos um link para redefinir sua senha.
      </p>
      {sent ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 text-success">
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
          <div className="text-sm">
            Se este e-mail existir, você receberá as instruções em instantes.
          </div>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={enviar}>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/auth/login" className="font-medium text-leaf hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
