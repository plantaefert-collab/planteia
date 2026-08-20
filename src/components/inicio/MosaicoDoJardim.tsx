import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * O jardim em mosaico, agrupado por ambiente.
 *
 * Existe para o dia em que não há nada a fazer. A alternativa era tela
 * vazia — e quem tem poucas plantas veria isso quase sempre, aprendendo
 * que o app não tem o que mostrar.
 *
 * Mosaico e não grade de cards: a foto da planta no lugar dela responde
 * "como está meu jardim", que é outra pergunta e outro motivo de voltar.
 * Padrão observado no Planta, que agrupa por cômodo — aqui o dado
 * disponível é apenas interno/externo.
 */
export function MosaicoDoJardim({ plantas }: { plantas: Plant[] }) {
  const grupos = [
    { rotulo: "Dentro de casa", itens: plantas.filter((p) => p.environment === "interno") },
    { rotulo: "Do lado de fora", itens: plantas.filter((p) => p.environment === "externo") },
  ].filter((g) => g.itens.length > 0);

  if (plantas.length === 0) return null;

  return (
    <div className="space-y-5">
      {grupos.map((g) => (
        <section key={g.rotulo}>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-display text-base font-semibold">{g.rotulo}</h3>
            <span className="text-xs text-muted-foreground">
              {g.itens.length} {g.itens.length === 1 ? "planta" : "plantas"}
            </span>
          </div>
          <Mosaico plantas={g.itens} />
        </section>
      ))}
    </div>
  );
}

/**
 * Uma grande à esquerda e as demais em duas colunas à direita. Com uma só
 * planta ela ocupa tudo; com duas, dividem. O arranjo se adapta em vez de
 * deixar buraco.
 */
function Mosaico({ plantas }: { plantas: Plant[] }) {
  const [principal, ...resto] = plantas;
  const secundarias = resto.slice(0, 4);

  return (
    <div
      className={cn(
        "grid gap-1 overflow-hidden rounded-[18px]",
        secundarias.length === 0 ? "grid-cols-1" : "grid-cols-[1.6fr_1fr_1fr]",
      )}
      style={secundarias.length ? { gridTemplateRows: "repeat(2, 74px)" } : undefined}
    >
      <Ladrilho planta={principal} className={secundarias.length ? "row-span-2" : "h-[150px]"} />
      {secundarias.map((p) => (
        <Ladrilho key={p.id} planta={p} />
      ))}
      {/* Preenche a última coluna quando sobra buraco, para o mosaico não
          terminar cortado. */}
      {secundarias.length === 1 && <span className="bg-leaf-soft" />}
      {secundarias.length === 3 && <span className="bg-leaf-soft" />}
    </div>
  );
}

function Ladrilho({ planta, className }: { planta: Plant; className?: string }) {
  return (
    <Link
      to="/app/plantas/$id"
      params={{ id: planta.id }}
      aria-label={planta.nickname}
      className={cn("relative block overflow-hidden bg-leaf-soft", className)}
    >
      {planta.photo ? (
        <img src={planta.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full place-items-center">
          <Sprout className="h-6 w-6 text-leaf/40" />
        </span>
      )}
      {planta.status === "atencao" && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />
      )}
    </Link>
  );
}
