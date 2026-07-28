import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable";
import { destinoPosLogin } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GoogleSignInButton({ label = "Continuar com Google" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não consegui entrar com Google", {
          description: result.error instanceof Error ? result.error.message : "Tente novamente.",
        });
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      // Quem entra pela primeira vez ainda não respondeu as boas-vindas.
      const destino = await destinoPosLogin();
      navigate({ to: destino });
    } catch (err) {
      toast.error("Erro inesperado", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleClick} disabled={busy}>
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.7 13.2-4.7l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.5 39 16.2 43.5 24 43.5z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5c-.4.4 6.6-4.8 6.6-14.4 0-1.2-.1-2.3-.3-3.5z" />
        </svg>
      )}
      {label}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">ou</span>
      </div>
    </div>
  );
}
