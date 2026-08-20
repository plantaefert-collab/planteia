// Comparação entre o diagnóstico anterior e o novo.
//
// É o fecho do ciclo: sem isto, o app diagnostica muitas vezes e nunca responde
// a pergunta que a pessoa realmente tem — "está melhorando?".
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Resumo = {
  mainSuspicion: string;
  status: string;
  createdAt: string;
  photo?: string;
};

/** saudável é melhor que acompanhamento, que é melhor que atenção. */
const ORDEM: Record<string, number> = { atencao: 0, acompanhamento: 1, saudavel: 2 };

export function ComparacaoEvolucao({
  anterior,
  atual,
}: {
  anterior: Resumo;
  atual: { mainSuspicion: string; status: string; photo?: string };
}) {
  const antes = ORDEM[anterior.status] ?? 1;
  const agora = ORDEM[atual.status] ?? 1;
  const dias = differenceInCalendarDays(new Date(), new Date(anterior.createdAt));

  const veredito =
    agora > antes
      ? {
          rotulo: "Melhorou",
          detalhe: "Os sinais indicam recuperação desde a última avaliação.",
          Icone: TrendingUp,
          cor: "text-success",
          fundo: "bg-success-soft/40 border-success/30",
        }
      : agora < antes
        ? {
            rotulo: "Piorou",
            detalhe: "O quadro se agravou. Vale rever o manejo com atenção.",
            Icone: TrendingDown,
            cor: "text-destructive",
            fundo: "bg-destructive/5 border-destructive/20",
          }
        : {
            rotulo: "Estável",
            detalhe: "Sem mudança de estado. Mantenha o plano e reavalie.",
            Icone: Minus,
            cor: "text-muted-foreground",
            fundo: "bg-card border-border",
          };

  const { Icone } = veredito;

  return (
    <section className={`rounded-2xl border p-4 ${veredito.fundo}`}>
      <div className="flex items-center gap-2">
        <Icone className={`h-5 w-5 ${veredito.cor}`} />
        <h3 className={`font-display text-lg font-semibold ${veredito.cor}`}>
          {veredito.rotulo}
        </h3>
        {dias > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {dias} {dias === 1 ? "dia" : "dias"} depois
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{veredito.detalhe}</p>

      {(anterior.photo || atual.photo) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <figure>
            {anterior.photo ? (
              <img
                src={anterior.photo}
                alt="Antes"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
                sem foto
              </div>
            )}
            <figcaption className="mt-1 text-xs text-muted-foreground">
              {format(new Date(anterior.createdAt), "d 'de' MMM", { locale: ptBR })}
            </figcaption>
          </figure>
          <figure>
            {atual.photo ? (
              <img
                src={atual.photo}
                alt="Agora"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
                sem foto
              </div>
            )}
            <figcaption className="mt-1 text-xs text-muted-foreground">Hoje</figcaption>
          </figure>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {anterior.mainSuspicion}
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
          {atual.mainSuspicion}
        </span>
      </div>
    </section>
  );
}
