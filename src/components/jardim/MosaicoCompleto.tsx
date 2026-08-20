import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { precisaDeVoce } from "./urgencia";

/**
 * O jardim inteiro como parede de fotos, agrupado por ambiente.
 *
 * A grade de cards responde "qual planta eu preciso abrir". Esta vista
 * responde outra pergunta — "como está o meu jardim" — e é a que dá a
 * sensação de posse. São duas leituras diferentes, por isso duas vistas
 * em vez de um meio-termo que não serve a nenhuma das duas.
 *
 * Diferente do mosaico da Home, aqui nenhuma planta fica de fora: o
 * arranjo se repete em blocos de cinco, alternando o lado do destaque
 * para a parede não virar padrão de papel de parede.
 *
 * O banco só distingue interno de externo (`plant_environment`), então
 * este é o agrupamento mais fino que o dado permite hoje.
 */
export function MosaicoCompleto({ plantas }: { plantas: Plant[] }) {
  const grupos = [
    { rotulo: "Dentro de casa", itens: plantas.filter((p) => p.environment === "interno") },
    { rotulo: "Do lado de fora", itens: plantas.filter((p) => p.environment === "externo") },
  ].filter((g) => g.itens.length > 0);

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <section key={grupo.rotulo}>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-base font-semibold">{grupo.rotulo}</h2>
            <span className="text-xs text-muted-foreground">
              {grupo.itens.length} {grupo.itens.length === 1 ? "planta" : "plantas"}
            </span>
          </div>
          <div className="space-y-1">
            {emBlocos(grupo.itens, 5).map((bloco, i) => (
              <Bloco key={i} plantas={bloco} invertido={i % 2 === 1} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function emBlocos<T>(itens: T[], tamanho: number): T[][] {
  const blocos: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) blocos.push(itens.slice(i, i + tamanho));
  return blocos;
}

const ALTURA_LINHA = 88;
const DUAS_LINHAS = { gridTemplateRows: `repeat(2, ${ALTURA_LINHA}px)` };

/**
 * Cada tamanho de bloco tem um arranjo que fecha a grade sem sobra.
 *
 * Foi por isso que o arranjo virou cinco casos e não um só com células de
 * preenchimento: com três plantas, a versão genérica deixava a metade de
 * baixo vazia — uma faixa verde chapada que parecia foto que não carregou.
 */
function Bloco({ plantas, invertido }: { plantas: Plant[]; invertido: boolean }) {
  const n = plantas.length;

  if (n === 1) {
    return (
      <div className="overflow-hidden rounded-[18px]">
        <Ladrilho planta={plantas[0]} className="h-[132px]" />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-[18px]">
        {plantas.map((p) => (
          <Ladrilho key={p.id} planta={p} className="h-[112px]" />
        ))}
      </div>
    );
  }

  // Quatro é o único caso sem destaque: em 2×2 as quatro fotos têm o mesmo
  // peso e a grade fecha exata.
  if (n === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-[18px]" style={DUAS_LINHAS}>
        {plantas.map((p) => (
          <Ladrilho key={p.id} planta={p} />
        ))}
      </div>
    );
  }

  const [destaque, ...resto] = plantas;
  // Três: destaque mais uma coluna de dois. Cinco: destaque mais duas de dois.
  const colunas =
    n === 3
      ? invertido
        ? "grid-cols-[1fr_1.6fr]"
        : "grid-cols-[1.6fr_1fr]"
      : invertido
        ? "grid-cols-[1fr_1fr_1.6fr]"
        : "grid-cols-[1.6fr_1fr_1fr]";
  const colunaDoDestaque = invertido ? (n === 3 ? "col-start-2" : "col-start-3") : "col-start-1";

  return (
    <div className={cn("grid gap-1 overflow-hidden rounded-[18px]", colunas)} style={DUAS_LINHAS}>
      <Ladrilho planta={destaque} className={cn("row-span-2 row-start-1", colunaDoDestaque)} />
      {resto.map((p) => (
        <Ladrilho key={p.id} planta={p} />
      ))}
    </div>
  );
}

function Ladrilho({ planta, className }: { planta: Plant; className?: string }) {
  return (
    <Link
      to="/app/plantas/$id"
      params={{ id: planta.id }}
      aria-label={planta.nickname}
      className={cn(
        "relative block overflow-hidden bg-leaf-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-leaf",
        className,
      )}
    >
      {planta.photo ? (
        <img src={planta.photo} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full place-items-center">
          <Sprout className="h-6 w-6 text-leaf/40" />
        </span>
      )}
      {precisaDeVoce(planta) && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card"
        />
      )}
    </Link>
  );
}
