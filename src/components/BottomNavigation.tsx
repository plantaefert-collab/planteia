import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { Home, Sprout, Camera, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { pendingCapture } from "@/lib/pending-capture";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
};

const items: NavItem[] = [
  { to: "/app/inicio", label: "Início", icon: Home },
  { to: "/app/plantas", label: "Plantas", icon: Sprout },
  { to: "/app/calendario", label: "Calendário", icon: Calendar },
  { to: "/app/jardineiro", label: "Jardineiro", icon: MessageCircle },
];

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Botão central: abre a câmera no próprio toque (gesto direto do usuário),
  // guarda a foto e só então navega para o diagnóstico já no passo de sintomas.
  const handleCapture = (file: File | undefined, input: HTMLInputElement) => {
    input.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      pendingCapture.set(dataUrl);
      navigate({ to: "/app/diagnostico" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleCapture(e.target.files?.[0], e.currentTarget)}
      />
      <ul className="mx-auto grid max-w-md grid-cols-5">
        <li className="flex items-center">
          <Link
            to="/app/inicio"
            className={cn(
              "flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
              pathname.startsWith("/app/inicio") ? "text-leaf" : "text-muted-foreground",
            )}
          >
            <Home className="h-5 w-5" />
            Início
          </Link>
        </li>
        <li className="flex items-center">
          <Link
            to="/app/plantas"
            className={cn(
              "flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
              pathname.startsWith("/app/plantas") ? "text-leaf" : "text-muted-foreground",
            )}
          >
            <Sprout className="h-5 w-5" />
            Plantas
          </Link>
        </li>
        <li className="flex items-start justify-center">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-background"
            aria-label="Diagnosticar por foto"
          >
            <Camera className="h-6 w-6" />
          </button>
        </li>
        <li className="flex items-center">
          <Link
            to="/app/calendario"
            className={cn(
              "flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
              pathname.startsWith("/app/calendario") ? "text-leaf" : "text-muted-foreground",
            )}
          >
            <Calendar className="h-5 w-5" />
            Calendário
          </Link>
        </li>
        <li className="flex items-center">
          <Link
            to="/app/jardineiro"
            className={cn(
              "flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
              pathname.startsWith("/app/jardineiro") ? "text-leaf" : "text-muted-foreground",
            )}
          >
            <MessageCircle className="h-5 w-5" />
            Jardineiro
          </Link>
        </li>
      </ul>
    </nav>
  );
}
