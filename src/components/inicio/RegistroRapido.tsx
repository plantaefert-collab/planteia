import { useState } from "react";
import { Droplets, Sprout, Scissors, Camera, Check, Loader2, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { timelineService } from "@/lib/services";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Cuidado = "rega" | "adubacao" | "poda" | "foto";

const CUIDADOS: { id: Cuidado; rotulo: string; icone: typeof Droplets; verbo: string }[] = [
  { id: "rega", rotulo: "Reguei", icone: Droplets, verbo: "Rega" },
  { id: "adubacao", rotulo: "Adubei", icone: Sprout, verbo: "Adubação" },
  { id: "poda", rotulo: "Podei", icone: Scissors, verbo: "Poda" },
  { id: "foto", rotulo: "Foto", icone: Camera, verbo: "Foto" },
];

/** Quando foi. O app não pergunta hora — ninguém lembra, e não muda nada. */
const QUANDO = [
  { id: 0, rotulo: "Hoje" },
  { id: 1, rotulo: "Ontem" },
  { id: 3, rotulo: "Há 3 dias" },
  { id: 7, rotulo: "Semana passada" },
];

/**
 * Registro de cuidado fora do cronograma.
 *
 * O app sabia marcar tarefa agendada como feita, mas não sabia ouvir
 * "reguei ontem". É falha declarada do Planta — lá, se a planta precisou
 * de água dois dias antes, não há onde registrar, e o app segue cobrando
 * uma rega que já aconteceu.
 *
 * Três toques: o que você fez, em qual planta, quando. A dose entra só na
 * adubação, porque é lá que ela muda alguma coisa — e é ela que fecha o
 * ciclo com o diagnóstico seguinte.
 */
export function RegistroRapido({
  aberto,
  cuidadoInicial,
  plantas,
  onFechar,
  onRegistrado,
}: {
  aberto: boolean;
  cuidadoInicial: Cuidado;
  plantas: Plant[];
  onFechar: () => void;
  onRegistrado: () => void;
}) {
  const [cuidado, setCuidado] = useState<Cuidado>(cuidadoInicial);
  const [plantaId, setPlantaId] = useState<string | null>(null);
  const [diasAtras, setDiasAtras] = useState(0);
  const [dose, setDose] = useState("");
  const [salvando, setSalvando] = useState(false);

  const info = CUIDADOS.find((c) => c.id === cuidado)!;
  const planta = plantas.find((p) => p.id === plantaId);

  async function salvar() {
    if (!plantaId) return;
    setSalvando(true);
    try {
      const quando = QUANDO.find((q) => q.id === diasAtras)?.rotulo.toLowerCase() ?? "hoje";
      await timelineService.add({
        plantId: plantaId,
        type: cuidado,
        note: diasAtras > 0 ? `Registrado depois — ${quando}` : undefined,
        ...(cuidado === "adubacao" && dose
          ? { doseAmount: Number(dose) || undefined, doseUnit: "ml" }
          : {}),
      });
      toast.success(`${info.verbo} registrada`, {
        description: planta ? `${planta.nickname} · ${quando}` : undefined,
      });
      onRegistrado();
      onFechar();
      setPlantaId(null);
      setDose("");
      setDiasAtras(0);
    } catch {
      toast.error("Não consegui registrar", { description: "Tente de novo em instantes." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Drawer open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DrawerContent className="max-h-[90svh]">
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle className="font-display text-xl">O que você fez?</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-5 overflow-y-auto px-4 pb-8">
          <Grupo titulo="Cuidado">
            <div className="grid grid-cols-4 gap-2">
              {CUIDADOS.map((c) => {
                const Ic = c.icone;
                const ativo = c.id === cuidado;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCuidado(c.id)}
                    className={cn(
                      "flex h-[62px] flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition",
                      ativo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Ic className="h-4 w-4" />
                    {c.rotulo}
                  </button>
                );
              })}
            </div>
          </Grupo>

          <Grupo titulo="Em qual planta">
            {plantas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cadastre uma planta para registrar cuidados.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {plantas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlantaId(p.id)}
                    className={cn(
                      "tap-safe rounded-full border px-3 py-2 text-xs font-semibold transition",
                      p.id === plantaId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {p.nickname}
                  </button>
                ))}
              </div>
            )}
          </Grupo>

          <Grupo titulo="Quando">
            <div className="flex flex-wrap gap-2">
              {QUANDO.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setDiasAtras(q.id)}
                  className={cn(
                    "tap-safe rounded-full border px-3 py-2 text-xs font-semibold transition",
                    q.id === diasAtras
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {q.rotulo}
                </button>
              ))}
            </div>
          </Grupo>

          {cuidado === "adubacao" && (
            <Grupo titulo="Quanto (opcional)">
              <div className="flex items-center gap-2">
                <input
                  inputMode="decimal"
                  value={dose}
                  onChange={(e) => setDose(e.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder="250"
                  className="h-11 w-28 rounded-xl border border-border bg-card px-3 text-sm"
                  aria-label="Quantidade aplicada em mililitros"
                />
                <span className="text-sm text-muted-foreground">ml</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Guardar a dose deixa o diagnóstico seguinte comparar o que foi aplicado com o
                resultado.
              </p>
            </Grupo>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onFechar}
              className="h-12 flex-1 rounded-full border border-border text-sm font-semibold text-muted-foreground"
            >
              <X className="mr-1 inline h-4 w-4" />
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!plantaId || salvando}
              className="inline-flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground disabled:opacity-50"
            >
              {salvando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Registrar
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export type { Cuidado };
export { CUIDADOS };
