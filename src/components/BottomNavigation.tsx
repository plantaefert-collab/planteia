import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import { useRef } from "react";
import { Home, Sprout, Camera, ShoppingBag, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { pendingCapture } from "@/lib/pending-capture";

type NavItem = {
  to: LinkProps["to"];
  label: string;
  icon: typeof Home;
  // A aba "Mais" é uma porta, não um destino: ela precisa ficar acesa
  // enquanto o usuário estiver em qualquer tela que mora atrás dela.
  tambem?: string[];
};

const antesDoCentro: NavItem[] = [
  { to: "/app/inicio", label: "Hoje", icon: Home },
  { to: "/app/plantas", label: "Jardim", icon: Sprout },
];

const depoisDoCentro: NavItem[] = [
  { to: "/app/produtos", label: "Loja", icon: ShoppingBag },
  {
    to: "/app/mais",
    label: "Mais",
    icon: LayoutGrid,
    tambem: ["/app/jardineiro", "/app/calendario", "/app/diario", "/app/perfil"],
  },
];

function estaAtivo(item: NavItem, pathname: string) {
  const rotas = [item.to, ...(item.tambem ?? [])].filter((r): r is string => !!r);
  return rotas.some((rota) => pathname.startsWith(rota));
}

function AbaLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const ativo = estaAtivo(item, pathname);
  return (
    <li className="flex items-center">
      <Link
        to={item.to}
        aria-current={ativo ? "page" : undefined}
        className={cn(
          "flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
          ativo ? "text-leaf" : "text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    </li>
  );
}

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

  const noDiagnostico = pathname.startsWith("/app/diagnostico");

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
        {antesDoCentro.map((item) => (
          <AbaLink key={item.to} item={item} pathname={pathname} />
        ))}

        <li className="flex items-start justify-center">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center gap-1 px-1 pb-2.5 text-[11px] font-medium transition-colors",
              noDiagnostico ? "text-leaf" : "text-muted-foreground",
            )}
            aria-current={noDiagnostico ? "page" : undefined}
            aria-label="Diagnosticar por foto"
          >
            <span
              className={cn(
                // -26px, e não -24: o círculo é 56px onde o ícone das outras abas é 20,
                // e essa diferença desalinharia a linha dos rótulos em 2px.
                "-mt-[26px] grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-background",
              )}
            >
              <Camera className="h-6 w-6" />
            </span>
            Diagnóstico
          </button>
        </li>

        {depoisDoCentro.map((item) => (
          <AbaLink key={item.to} item={item} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}
