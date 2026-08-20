import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { legendaDeCuidado, precisaDeVoce } from "./jardim/urgencia";

/**
 * O card do jardim, dimensionado para duas colunas no celular.
 *
 * Em 375px sobram ~166px por card, então tudo que não fosse foto, nome,
 * espécie e a linha de cuidado teve de sair — inclusive o texto que
 * ensinava a tocar no card, que ocupava uma linha para dizer o óbvio.
 *
 * A cor nunca carrega sozinha o recado: o ponto colorido é redundante com
 * o texto ao lado. Terracota e âmbar não passam em contraste como texto
 * pequeno sobre o creme, então quem fica escuro é a palavra, não o tom.
 */
export function PlantCard({ plant }: { plant: Plant }) {
  const urgente = precisaDeVoce(plant);

  return (
    <Link
      to="/app/plantas/$id"
      params={{ id: plant.id }}
      aria-label={`Abrir ficha de ${plant.nickname}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-leaf/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-soft/60">
        {plant.photo ? (
          <img
            src={plant.photo}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-(--duration-base) group-hover:scale-105"
          />
        ) : (
          // Planta cadastrada sem foto: um marcador, não uma imagem quebrada.
          <div className="grid h-full w-full place-items-center text-leaf">
            <Sprout className="h-8 w-8 opacity-60" />
          </div>
        )}
        {urgente && (
          <span
            aria-hidden
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card"
          />
        )}
      </div>

      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{plant.nickname}</h3>
        <p className="truncate text-xs text-muted-foreground">{plant.species}</p>
        <p className="mt-1.5 flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              urgente
                ? "bg-accent"
                : plant.status === "acompanhamento"
                  ? "bg-warning"
                  : "bg-success",
            )}
          />
          <span
            className={cn(
              "truncate text-xs",
              urgente ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {legendaDeCuidado(plant)}
          </span>
        </p>
      </div>
    </Link>
  );
}
