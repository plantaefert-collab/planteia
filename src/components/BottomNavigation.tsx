import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sprout, Camera, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  center?: boolean;
  search?: Record<string, any>;
};

const items: NavItem[] = [
  { to: "/app/inicio", label: "Início", icon: Home },
  { to: "/app/plantas", label: "Plantas", icon: Sprout },
  { to: "/app/diagnostico", label: "Diagnosticar", icon: Camera, center: true, search: { direct: "camera" } },
  { to: "/app/calendario", label: "Calendário", icon: Calendar },
  { to: "/app/jardineiro", label: "Jardineiro", icon: MessageCircle },
];

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          if (it.center) {
            return (
              <li key={it.to} className="flex items-start justify-center">
                <Link
                  to={it.to}
                  search={(it as any).search}
                  className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-background"
                  aria-label={it.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-leaf" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
