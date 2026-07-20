import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { mockPlants, mockTimeline } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/diario")({
  head: () => ({ meta: [{ title: "Diário · Plantae AI" }] }),
  component: Diary,
});

function Diary() {
  const orchid = mockPlants[0];
  return (
    <AppShell title="Diário de evolução">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Antes e agora — {orchid.nickname}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <img src={orchid.photo} alt="antes" className="aspect-square w-full rounded-xl object-cover opacity-70" />
              <p className="mt-1 text-xs text-muted-foreground">Há 45 dias</p>
            </div>
            <div>
              <img src={orchid.photo} alt="agora" className="aspect-square w-full rounded-xl object-cover" />
              <p className="mt-1 text-xs text-muted-foreground">Hoje</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Galeria cronológica</h3>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <img
                key={i}
                src={orchid.photo}
                alt=""
                className="aspect-square w-full rounded-xl object-cover"
                style={{ opacity: 0.4 + (i / 8) * 0.6 }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Registros</h3>
          <ol className="relative space-y-3 border-l border-border pl-4">
            {mockTimeline.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-leaf" />
                <div className="rounded-2xl border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(e.date), "d 'de' MMM", { locale: ptBR })} · {e.type}
                  </p>
                  {e.note && <p className="text-sm">{e.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
