import type { ReactNode } from "react";
import { Home, Leaf, Stethoscope, Calendar, MessageCircle, BookOpen, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "./DemoState";
import type { WireframeScreen } from "./types";

const primary: { key: WireframeScreen; label: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Início", icon: Home },
  { key: "plants", label: "Plantas", icon: Leaf },
  { key: "diagnosis", label: "Diagnóstico", icon: Stethoscope },
  { key: "calendar", label: "Calendário", icon: Calendar },
  { key: "gardener", label: "Jardineiro", icon: MessageCircle },
];

const secondary: { key: WireframeScreen; label: string; icon: typeof Home }[] = [
  { key: "journal", label: "Diário", icon: BookOpen },
  { key: "products", label: "Produtos", icon: Package },
  { key: "profile", label: "Perfil", icon: User },
];

export function WireframeShell({ children }: { children: ReactNode }) {
  const { nav, go } = useDemo();
  const inApp = !["welcome", "login", "signup", "recover", "onboarding"].includes(nav.screen);

  if (!inApp) {
    return <main className="mx-auto min-h-[calc(100dvh-52px)] w-full max-w-3xl px-4 py-6">{children}</main>;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-52px)] w-full max-w-6xl gap-4 px-3 pb-24 pt-4 md:pb-6">
      <aside className="sticky top-16 hidden h-[calc(100dvh-88px)] w-56 shrink-0 flex-col gap-1 rounded-2xl bg-card p-3 md:flex">
        <div className="mb-2 px-2 font-display text-lg text-leaf">Plantae AI</div>
        {primary.map((it) => (
          <NavBtn key={it.key} item={it} active={nav.screen === it.key} onClick={() => go(it.key)} />
        ))}
        <div className="mt-3 border-t border-border pt-3 text-xs font-medium text-muted-foreground">Mais</div>
        {secondary.map((it) => (
          <NavBtn key={it.key} item={it} active={nav.screen === it.key} onClick={() => go(it.key)} />
        ))}
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-card/95 backdrop-blur md:hidden"
      >
        {primary.map((it) => {
          const Icon = it.icon;
          const active = nav.screen === it.key;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => go(it.key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium",
                active ? "text-leaf" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function NavBtn({ item, active, onClick }: { item: { key: WireframeScreen; label: string; icon: typeof Home }; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-leaf-soft text-leaf" : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {item.label}
    </button>
  );
}
