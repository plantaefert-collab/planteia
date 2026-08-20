import { Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Camera, MessageCircle, TrendingUp, ChevronRight, ShoppingBag } from "lucide-react";
import { saudeService } from "@/lib/services";
import type { Plant } from "@/lib/types";

/**
 * Blocos vivos: cada um mostra uma capacidade do produto com o estado real
 * daquele usuário.
 *
 * A faixa de ações resolve o acesso — um toque para cada coisa. Mas ícone
 * não ensina: quem nunca diagnosticou não sabe o que "Diagnosticar" faz,
 * nem que a IA conhece o histórico da planta dele.
 *
 * Aqui cada bloco fala do jardim de quem está lendo. "Pergunte sobre a
 * Orquídea" convida de um jeito que "Jardineiro IA" não convida.
 *
 * Bloco sem o que dizer não aparece — melhor ausência do que texto genérico.
 */
export function BlocosVivos({ plantas }: { plantas: Plant[] }) {
  // Consulta a saúde só das primeiras: a Home não precisa das quarenta, e
  // cada uma é uma ida ao banco.
  const amostra = plantas.slice(0, 6);
  const saudes = useQueries({
    queries: amostra.map((p) => ({
      queryKey: ["saude", p.id],
      queryFn: () => saudeService.daPlanta(p.id),
      staleTime: 60_000,
    })),
  });

  const comSaude = amostra
    .map((p, i) => ({ planta: p, saude: saudes[i]?.data ?? null }))
    .filter((x) => x.saude !== null);

  const precisaAtencao = comSaude.find((x) => x.saude!.score < 60);
  const melhorou = comSaude.find((x) => x.saude!.score >= 80);
  const alguma = plantas[0];

  return (
    <div className="space-y-2">
      {precisaAtencao ? (
        <Bloco
          icone={Camera}
          tom="terra"
          titulo={`${precisaAtencao.planta.nickname} precisa de atenção`}
          detalhe={precisaAtencao.saude!.motivos[0] ?? "Uma foto ajuda a entender o que houve"}
          para="/app/diagnostico"
        />
      ) : (
        <Bloco
          icone={Camera}
          tom="terra"
          titulo="Algo estranho numa folha?"
          detalhe="O diagnóstico por foto responde em um minuto"
          para="/app/diagnostico"
        />
      )}

      {alguma && (
        <Bloco
          icone={MessageCircle}
          tom="teal"
          titulo={`Pergunte sobre a ${alguma.nickname}`}
          detalhe="O Jardineiro conhece o histórico dela"
          para="/app/jardineiro"
        />
      )}

      {melhorou && (
        <Bloco
          icone={TrendingUp}
          tom="leaf"
          titulo={`${melhorou.planta.nickname} está bem`}
          detalhe={`${melhorou.saude!.rotulo} · ${melhorou.saude!.score}% — veja a evolução`}
          para="/app/diario"
        />
      )}

      <Bloco
        icone={ShoppingBag}
        tom="honey"
        titulo="O que usar em cada fase"
        detalhe="Adubos da PlantaeFert, com a dose certa"
        para="/app/produtos"
      />
    </div>
  );
}

const TONS = {
  terra: "bg-accent/12 text-accent",
  teal: "bg-leaf-soft text-leaf",
  leaf: "bg-success-soft text-success-dark",
  honey: "bg-warning-soft text-warning",
} as const;

function Bloco({
  icone: Ic,
  tom,
  titulo,
  detalhe,
  para,
}: {
  icone: typeof Camera;
  tom: keyof typeof TONS;
  titulo: string;
  detalhe: string;
  para: string;
}) {
  return (
    <Link
      to={para}
      className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3 shadow-sm transition active:scale-[.99]"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONS[tom]}`}>
        <Ic className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{titulo}</span>
        <span className="block truncate text-xs text-muted-foreground">{detalhe}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
