import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { plantsService, timelineService } from "@/lib/services";
import { Camera, Sprout } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/diario")({
  head: () => ({ meta: [{ title: "Diário · Plantae AI" }] }),
  component: Diary,
});

function Diary() {
  const plants = useQuery({ queryKey: ["plants"], queryFn: plantsService.list });
  const [plantId, setPlantId] = useState<string>("");

  useEffect(() => {
    const lista = plants.data ?? [];
    if (!plantId && lista.length > 0) setPlantId(lista[0].id);
  }, [plantId, plants.data]);

  const timeline = useQuery({
    queryKey: ["timeline", plantId],
    queryFn: () => timelineService.listByPlant(plantId),
    enabled: !!plantId,
  });

  const planta = (plants.data ?? []).find((p) => p.id === plantId);

  // Só as fotos contam a história visual da evolução.
  const fotos = useMemo(
    () =>
      (timeline.data ?? [])
        .filter((e) => !!e.photo)
        .sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [timeline.data],
  );

  const primeira = fotos[0];
  const ultima = fotos[fotos.length - 1];
  const diasEntre =
    primeira && ultima && primeira.id !== ultima.id
      ? differenceInCalendarDays(new Date(ultima.date), new Date(primeira.date))
      : 0;

  if (plants.isLoading) {
    return (
      <AppShell title="Diário de evolução">
        <div className="space-y-3">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if ((plants.data ?? []).length === 0) {
    return (
      <AppShell title="Diário de evolução">
        <EmptyState
          icon={<Sprout className="h-5 w-5" />}
          title="Nenhuma planta ainda"
          description="Cadastre uma planta para começar a registrar a evolução dela."
          action={
            <Button asChild>
              <Link to="/app/plantas/nova">Adicionar planta</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Diário de evolução">
      <div className="space-y-6">
        {(plants.data ?? []).length > 1 && (
          <div className="flex flex-wrap gap-2">
            {(plants.data ?? []).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlantId(p.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                  p.id === plantId
                    ? "border-leaf bg-leaf-soft text-leaf"
                    : "border-border bg-card text-muted-foreground hover:border-leaf"
                }`}
              >
                <Sprout className="h-3.5 w-3.5" />
                {p.nickname}
              </button>
            ))}
          </div>
        )}

        {/* Antes e agora — a recompensa de quem acompanha */}
        {diasEntre > 0 ? (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">
              Antes e agora — {planta?.nickname}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <img
                  src={primeira!.photo}
                  alt="Primeira foto registrada"
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(primeira!.date), "d 'de' MMM", { locale: ptBR })}
                </p>
              </div>
              <div>
                <img
                  src={ultima!.photo}
                  alt="Foto mais recente"
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(ultima!.date), "d 'de' MMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-leaf">
              {diasEntre} {diasEntre === 1 ? "dia" : "dias"} de acompanhamento
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
            <Camera className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              {fotos.length === 1 ? "Primeira foto registrada" : "Ainda sem fotos"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {fotos.length === 1
                ? "Registre outra daqui a alguns dias para ver a comparação."
                : "Abra a planta e use “Foto” para começar a linha do tempo."}
            </p>
            {planta && (
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/app/plantas/$id" params={{ id: planta.id }}>
                  Abrir {planta.nickname}
                </Link>
              </Button>
            )}
          </section>
        )}

        {fotos.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold">Galeria cronológica</h3>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
              {fotos.map((e) => (
                <figure key={e.id}>
                  <img
                    src={e.photo}
                    alt={e.note ?? ""}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <figcaption className="mt-1 text-[10px] text-muted-foreground">
                    {format(new Date(e.date), "d MMM", { locale: ptBR })}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-sm font-semibold">Registros</h3>
          {timeline.isLoading ? (
            <Skeleton className="h-20 rounded-2xl" />
          ) : (timeline.data ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
              Nada registrado ainda. Rega, adubação e fotos aparecem aqui.
            </p>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-4">
              {(timeline.data ?? []).map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-leaf" />
                  <div className="rounded-2xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.date), "d 'de' MMM", { locale: ptBR })} · {e.type}
                    </p>
                    {e.note && <p className="text-sm">{e.note}</p>}
                    {e.photo && (
                      <img
                        src={e.photo}
                        alt=""
                        className="mt-2 h-24 w-24 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AppShell>
  );
}
