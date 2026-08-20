import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FocoDoDia } from "@/components/inicio/FocoDoDia";
import { MosaicoDoJardim } from "@/components/inicio/MosaicoDoJardim";
import { FaixaDeAcoes } from "@/components/inicio/FaixaDeAcoes";
import { RegistroRapido, type Cuidado } from "@/components/inicio/RegistroRapido";
import { CareTaskCard } from "@/components/CareTaskCard";
import { plantsService, tasksService } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Sprout } from "lucide-react";

export const Route = createFileRoute("/app/inicio")({
  head: () => ({ meta: [{ title: "Início · Plantae AI" }] }),
  component: Home,
});

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Início — direção "A com B", aprovada por Felipe em 20/08/2026.
 *
 * Havendo tarefa, a tela é uma planta em foco com uma ação dominante; o
 * resto do dia fica em linhas resolvíveis ali mesmo. Não havendo, ela vira
 * o mosaico do jardim.
 *
 * O motivo do segundo estado: a versão anterior repetia o Calendário e a
 * aba Plantas, e sem tarefa não sobrava nada. Quem tem poucas plantas via
 * tela vazia quase sempre e aprendia que o app não tem o que mostrar.
 */
function Home() {
  const qc = useQueryClient();
  const plantas = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });
  const tarefas = useQuery({ queryKey: ["tasks"], queryFn: tasksService.list });
  const [concluindo, setConcluindo] = useState<string | null>(null);
  const [registro, setRegistro] = useState<Cuidado | null>(null);

  const concluir = useMutation({
    mutationFn: (id: string) => tasksService.toggle(id, true),
    onMutate: (id: string) => setConcluindo(id),
    onSettled: () => {
      setConcluindo(null);
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const carregando = plantas.isLoading || tarefas.isLoading;
  const pendentes = (tarefas.data ?? []).filter((t) => !t.done);
  const foco = pendentes[0];
  const demais = pendentes.slice(1, 4);
  const plantaDoFoco = (plantas.data ?? []).find((p) => p.id === foco?.plantId);

  const hoje = new Date();
  const dataLabel = `${DIAS[hoje.getDay()]} · ${hoje.getDate()} ${MESES[hoje.getMonth()]}`;

  const titulo = carregando
    ? ""
    : pendentes.length === 0
      ? "Nada pendente hoje"
      : pendentes.length === 1
        ? "Uma planta pede você"
        : `${pendentes.length} plantas pedem você`;

  return (
    <AppShell title="Início">
      <div className="space-y-4">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {dataLabel}
          </p>
          {carregando ? (
            <Skeleton className="mt-1.5 h-8 w-52" />
          ) : (
            <h2 className="mt-0.5 font-display text-2xl font-semibold leading-tight">{titulo}</h2>
          )}
        </header>

        <FaixaDeAcoes onRegistrar={setRegistro} />

        {carregando && <Skeleton className="h-[300px] w-full rounded-[18px]" />}

        {!carregando && foco && (
          <>
            <FocoDoDia
              tarefa={foco}
              planta={plantaDoFoco}
              concluindo={concluindo === foco.id}
              onConcluir={() => concluir.mutate(foco.id)}
            />
            {demais.length > 0 && (
              <section className="space-y-2 pt-1">
                <h3 className="text-sm font-semibold">Também hoje</h3>
                {demais.map((t) => (
                  <CareTaskCard key={t.id} task={t} />
                ))}
              </section>
            )}
          </>
        )}

        {!carregando && !foco && (plantas.data?.length ?? 0) > 0 && (
          <>
            <p className="-mt-1 text-sm text-muted-foreground">
              Seu jardim está em dia. Uma boa hora para só olhar.
            </p>
            <MosaicoDoJardim plantas={plantas.data ?? []} />
          </>
        )}

        {!carregando && (plantas.data?.length ?? 0) === 0 && <PrimeiraPlanta />}
      </div>

      <RegistroRapido
        aberto={registro !== null}
        cuidadoInicial={registro ?? "rega"}
        plantas={plantas.data ?? []}
        onFechar={() => setRegistro(null)}
        onRegistrado={() => {
          qc.invalidateQueries({ queryKey: ["tasks"] });
          qc.invalidateQueries({ queryKey: ["plants"] });
        }}
      />
    </AppShell>
  );
}

/** Estado inicial: sem plantas não há tarefa nem jardim, e a tela precisa
 *  oferecer o primeiro passo em vez de ficar vazia. */
function PrimeiraPlanta() {
  return (
    <div className="rounded-[18px] border border-border bg-card p-6 text-center shadow-sm">
      <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-leaf-soft">
        <Sprout className="h-7 w-7 text-leaf" />
      </span>
      <h3 className="font-display text-lg font-semibold">Comece pela primeira</h3>
      <p className="mx-auto mt-1 max-w-[34ch] text-sm text-muted-foreground">
        Cadastre uma planta e o Plantae passa a lembrar você do que ela precisa.
      </p>
      <Link
        to="/app/plantas/nova"
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground"
      >
        <Camera className="h-4 w-4" />
        Cadastrar planta
      </Link>
    </div>
  );
}
