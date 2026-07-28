// Protege telas que dependem de dados do usuário.
// Uso: envolver o conteúdo da rota -> <RequireAuth><MinhaTela /></RequireAuth>
//
// Ainda NÃO aplicado em /app: a demonstração com dados de exemplo segue aberta.
// Conforme cada tela migrar para dados reais (Bloco 2 em diante), ela passa a
// usar este componente.
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth/login" });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
