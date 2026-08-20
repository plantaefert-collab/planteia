import { createFileRoute, Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MessageCircle, Calendar, BookImage, User, ChevronRight, ExternalLink } from "lucide-react";
import { LOJA_URL } from "@/lib/plants-db";

export const Route = createFileRoute("/app/mais")({
  head: () => ({ meta: [{ title: "Mais · Plantae AI" }] }),
  component: Mais,
});

type Destino = {
  para: LinkProps["to"];
  titulo: string;
  descricao: string;
  icone: typeof MessageCircle;
};

const grupos: { titulo: string; itens: Destino[] }[] = [
  {
    titulo: "Cuidar",
    itens: [
      {
        para: "/app/jardineiro",
        titulo: "Jardineiro IA",
        descricao: "Pergunte qualquer coisa sobre as suas plantas.",
        icone: MessageCircle,
      },
      {
        para: "/app/calendario",
        titulo: "Calendário",
        descricao: "Todos os cuidados, dia a dia, com filtro por planta.",
        icone: Calendar,
      },
      {
        para: "/app/diario",
        titulo: "Diário",
        descricao: "A evolução de cada planta contada pelas fotos.",
        icone: BookImage,
      },
    ],
  },
  {
    titulo: "Sua conta",
    itens: [
      {
        para: "/app/perfil",
        titulo: "Perfil",
        descricao: "Dados, lembretes, exportar ou apagar o que é seu.",
        icone: User,
      },
    ],
  },
];

function Mais() {
  return (
    <AppShell title="Mais">
      <div className="space-y-7">
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {grupo.titulo}
            </h2>
            <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {grupo.itens.map((item, i) => {
                const Icone = item.icone;
                return (
                  <li key={item.para}>
                    <Link
                      to={item.para}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 ${
                        i > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf">
                        <Icone className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          {item.titulo}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {item.descricao}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="space-y-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            PlantaeFert
          </h2>
          <a
            href={LOJA_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition-colors hover:bg-muted/60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf">
              <ExternalLink className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Loja oficial</span>
              <span className="block text-xs text-muted-foreground">
                Comprar os fertilizantes fora do aplicativo.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        </section>

        <p className="px-1 text-center text-xs text-muted-foreground">Plantae AI · PlantaeFert</p>
      </div>
    </AppShell>
  );
}
