import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { plantsService } from "@/lib/services";
import { PlantCard } from "@/components/PlantCard";
import { MosaicoCompleto } from "@/components/jardim/MosaicoCompleto";
import { pesoDeUrgencia, precisaDeVoce } from "@/components/jardim/urgencia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Search, Sprout, LayoutGrid, Images, SearchX } from "lucide-react";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/plantas")({
  head: () => ({ meta: [{ title: "Seu jardim · Plantae AI" }] }),
  component: Plants,
});

type ChaveDeFiltro = "todas" | "precisam" | "interno" | "externo";

// Filtrar por "saudável" nunca foi uma pergunta real. As que valem são
// "o que precisa de mim" e "onde está" — e ambiente é o único recorte de
// lugar que o banco guarda.
const filtros: { chave: ChaveDeFiltro; rotulo: string }[] = [
  { chave: "todas", rotulo: "Todas" },
  { chave: "precisam", rotulo: "Precisam de você" },
  { chave: "interno", rotulo: "Dentro de casa" },
  { chave: "externo", rotulo: "Do lado de fora" },
];

function passaNoFiltro(planta: Plant, filtro: ChaveDeFiltro) {
  if (filtro === "todas") return true;
  if (filtro === "precisam") return precisaDeVoce(planta);
  return planta.environment === filtro;
}

function Plants() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<ChaveDeFiltro>("todas");
  const [vista, setVista] = useState<"grade" | "mosaico">("grade");
  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });

  const todas = plants.data ?? [];
  const pedindo = todas.filter(precisaDeVoce).length;

  const visiveis = todas
    .filter((p) => {
      if (!passaNoFiltro(p, filtro)) return false;
      if (busca && !`${p.nickname} ${p.species}`.toLowerCase().includes(busca.toLowerCase()))
        return false;
      return true;
    })
    // A lista responde "o que precisa de mim agora?", não "o que cadastrei antes".
    .sort((a, b) => pesoDeUrgencia(a) - pesoDeUrgencia(b));

  const jardimVazio = !plants.isLoading && todas.length === 0;

  return (
    <AppShell
      title="Seu jardim"
      right={
        <Button asChild size="sm" variant="ghost" className="tap-safe -mr-2">
          <Link to="/app/plantas/nova" aria-label="Adicionar planta">
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">Adicionar</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {!jardimVazio && (
          <div className="flex items-center justify-between gap-3">
            {/* O Skeleton é um <div>: dentro de <p> vira HTML inválido e
                quebra a hidratação. Por isso os dois estados são irmãos. */}
            {plants.isLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {todas.length} {todas.length === 1 ? "planta" : "plantas"}
                </span>
                {pedindo > 0 && (
                  <>
                    {" "}
                    · {pedindo} {pedindo === 1 ? "pede" : "pedem"} você
                  </>
                )}
              </p>
            )}
            <SeletorDeVista vista={vista} aoTrocar={setVista} />
          </div>
        )}

        {vista === "grade" && !jardimVazio && (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou espécie"
                className="pl-9"
              />
            </div>

            <div className="rolagem-discreta -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {filtros.map((f) => (
                <button
                  key={f.chave}
                  onClick={() => setFiltro(f.chave)}
                  aria-pressed={filtro === f.chave}
                  className={cn(
                    "tap-safe shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filtro === f.chave
                      ? "border-leaf bg-leaf text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>
          </>
        )}

        {plants.isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[192px] rounded-2xl" />
            ))}
          </div>
        ) : jardimVazio ? (
          <EmptyState
            icon={<Sprout className="h-5 w-5" />}
            title="Seu jardim começa aqui"
            description="Cadastre a primeira planta e o app passa a lembrar você de regar, adubar e acompanhar."
            action={
              <Button asChild>
                <Link to="/app/plantas/nova">
                  <Plus className="h-4 w-4" /> Adicionar planta
                </Link>
              </Button>
            }
          />
        ) : vista === "mosaico" ? (
          <MosaicoCompleto plantas={todas} />
        ) : visiveis.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-5 w-5" />}
            title="Nenhuma planta com esse recorte"
            description={
              busca
                ? `Nada encontrado para "${busca}".`
                : "Troque o filtro para ver o resto do jardim."
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setBusca("");
                  setFiltro("todas");
                }}
              >
                Ver todas
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {visiveis.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SeletorDeVista({
  vista,
  aoTrocar,
}: {
  vista: "grade" | "mosaico";
  aoTrocar: (v: "grade" | "mosaico") => void;
}) {
  const opcoes = [
    { chave: "grade" as const, rotulo: "Grade", Icone: LayoutGrid },
    { chave: "mosaico" as const, rotulo: "Mosaico", Icone: Images },
  ];
  return (
    <div className="flex shrink-0 gap-0.5 rounded-full border border-border bg-card p-0.5">
      {opcoes.map(({ chave, rotulo, Icone }) => (
        <button
          key={chave}
          type="button"
          onClick={() => aoTrocar(chave)}
          aria-pressed={vista === chave}
          aria-label={`Ver em ${rotulo.toLowerCase()}`}
          className={cn(
            "tap-safe-square grid h-8 w-8 place-items-center rounded-full transition",
            vista === chave ? "bg-leaf text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <Icone className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
