import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Sprout,
  Camera,
  Calendar,
  MessageCircle,
  BookImage,
  Package,
  User,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "./BottomNavigation";

const sideItems = [
  { to: "/app/inicio", label: "Início", icon: Home },
  { to: "/app/plantas", label: "Minhas plantas", icon: Sprout },
  { to: "/app/diagnostico", label: "Diagnosticar", icon: Camera },
  { to: "/app/calendario", label: "Calendário", icon: Calendar },
  { to: "/app/jardineiro", label: "Jardineiro IA", icon: MessageCircle },
  { to: "/app/diario", label: "Diário", icon: BookImage },
  { to: "/app/produtos", label: "Produtos", icon: Package },
  { to: "/app/perfil", label: "Perfil", icon: User },
] as const;

export function AppShell({
  title,
  children,
  right,
}: {
  title?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl md:gap-6 md:p-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl border border-border bg-card p-4 shadow-sm md:flex">
          <Link to="/app/inicio" className="mb-6 flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-leaf text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold">Plantae AI</span>
          </Link>
          <nav className="flex-1 space-y-1">
            {sideItems.map((it) => {
              const Icon = it.icon;
              const active = pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-leaf-soft text-leaf"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-4 px-3 text-xs text-muted-foreground">
            PlantaeFert · MVP
          </p>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1 pb-24 md:pb-6">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <Link to="/app/inicio" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-leaf text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-semibold">
                {title ?? "Plantae AI"}
              </span>
            </Link>
            {right}
          </header>

          {/* Desktop header */}
          {title && (
            <div className="mb-4 hidden items-center justify-between md:flex">
              <h1 className="font-display text-2xl font-semibold">{title}</h1>
              {right}
            </div>
          )}

          <div className="px-4 py-4 md:px-0">{children}</div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
