import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsDb, LOJA_URL, type ProdutoCatalogo } from "@/lib/plants-db";
import { ExternalLink, Leaf, Info } from "lucide-react";

export const Route = createFileRoute("/app/produtos")({
  head: () => ({ meta: [{ title: "Produtos · Plantae AI" }] }),
  component: Produtos,
});

const SECOES: { chave: ProdutoCatalogo["category"]; titulo: string; descricao: string }[] = [
  {
    chave: "base",
    titulo: "Base",
    descricao: "Serve a todas as plantas, em todas as fases. Prepara o solo para o resto funcionar melhor.",
  },
  {
    chave: "especifico",
    titulo: "Específicos",
    descricao: "Resultado direcionado ao objetivo da sua planta. Combinam com a base.",
  },
  {
    chave: "outro",
    titulo: "Complementares",
    descricao: "Raízes, solo e proteção contra pragas e doenças.",
  },
];

function Produtos() {
  const produtos = useQuery({ queryKey: ["produtos"], queryFn: productsDb.list });

  return (
    <AppShell title="Produtos PlantaeFert">
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-leaf/20 bg-leaf-soft/40 p-4">
          <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
          <p className="text-sm text-leaf-dark">
            Todos orgânicos e seguros desde a primeira aplicação — inclusive em plantas
            debilitadas. Siga sempre a dose do rótulo.
          </p>
        </div>

        {produtos.isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {produtos.isError && (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Não consegui carregar o catálogo agora. Tente novamente em instantes.
          </p>
        )}

        {SECOES.map((secao) => {
          const lista = (produtos.data ?? []).filter((p) => p.category === secao.chave);
          if (lista.length === 0) return null;
          return (
            <section key={secao.chave}>
              <h2 className="font-display text-lg font-semibold">{secao.titulo}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{secao.descricao}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {lista.map((p) => (
                  <article
                    key={p.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold">{p.name}</h3>
                    {p.goal && <p className="mt-1 text-sm text-muted-foreground">{p.goal}</p>}
                    {p.moment && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Quando: </span>
                        {p.moment}
                      </p>
                    )}
                    {p.formats.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.formats.map((f) => (
                          <span
                            key={f}
                            className="rounded-full bg-leaf-soft px-2 py-0.5 text-[10px] font-medium text-leaf"
                          >
                            {f === "pronto_uso" ? "pronto uso" : f}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                      {/* Sem link próprio ainda: leva à loja, que é honesto — melhor
                          que um endereço inventado que daria página não encontrada. */}
                      <a href={p.url ?? LOJA_URL} target="_blank" rel="noopener noreferrer">
                        Ver na loja <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Concentrado dilui em água; pronto uso nunca se dilui. Na dúvida sobre a dose,
            pergunte ao Jardineiro — ele conhece o protocolo de cada produto.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
