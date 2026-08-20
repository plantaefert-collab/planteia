import { Link } from "@tanstack/react-router";
import { Droplets, Sprout, Scissors, Bug, Camera, Layers, Loader2 } from "lucide-react";
import type { CareTask, CareType, Plant } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONE: Record<CareType, typeof Droplets> = {
  regar: Droplets,
  adubar: Sprout,
  podar: Scissors,
  pragas: Bug,
  fotografar: Camera,
  substrato: Layers,
};

const ACAO: Record<CareType, string> = {
  regar: "Regar agora",
  adubar: "Adubar agora",
  podar: "Podar agora",
  pragas: "Tratar agora",
  fotografar: "Fotografar",
  substrato: "Trocar substrato",
};

interface Props {
  tarefa: CareTask;
  planta?: Plant;
  concluindo: boolean;
  onConcluir: () => void;
}

/**
 * O card de foco: uma planta, uma ação.
 *
 * A regra que ele existe para cumprir é a de uma ação principal por tela —
 * a Início antes oferecia "ver tudo", "ver todas" e cada card com o mesmo
 * peso, então não havia próximo passo óbvio. Aqui há um só, e ele resolve
 * a tarefa sem sair da tela.
 */
export function FocoDoDia({ tarefa, planta, concluindo, onConcluir }: Props) {
  const Icone = ICONE[tarefa.type] ?? Droplets;

  return (
    <article className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
      <Link
        to="/app/plantas/$id"
        params={{ id: tarefa.plantId }}
        className="block"
        aria-label={planta ? `Abrir ficha de ${planta.nickname}` : "Abrir planta"}
      >
        <div className="relative h-[180px] bg-leaf-soft">
          {planta?.photo ? (
            <img src={planta.photo} alt={planta.nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center">
              <Sprout className="h-10 w-10 text-leaf/40" />
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
            <Icone className="h-3.5 w-3.5" />
            {tarefa.title}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <h2 className="font-display text-lg font-semibold leading-tight">
          {planta?.nickname ?? "Sua planta"}
        </h2>
        {(planta?.species || tarefa.description) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[planta?.species, tarefa.description].filter(Boolean).join(" · ")}
          </p>
        )}

        <button
          onClick={onConcluir}
          disabled={concluindo}
          className={cn(
            "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full",
            "bg-accent text-sm font-bold text-accent-foreground",
            "transition active:scale-[.97] disabled:opacity-60",
          )}
        >
          {concluindo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icone className="h-4 w-4" />
          )}
          {ACAO[tarefa.type] ?? "Concluir"}
        </button>
      </div>
    </article>
  );
}
