import { useState } from "react";
import { ArrowLeft, ArrowRight, Map, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo, screenLabels, guidedFlow } from "./DemoState";
import type { WireframeScreen } from "./types";

const allScreens: WireframeScreen[] = [
  "welcome", "login", "signup", "recover", "onboarding",
  "dashboard", "plants", "newPlant", "plantDetail", "diagnosis",
  "reassessment", "calendar", "journal", "gardener", "products", "profile",
];

export function WireframeNavigator() {
  const { nav, guided, guidedStep, nextGuidedStep, prevGuidedStep, back, go, reset } = useDemo();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 text-xs sm:text-sm">
        <span className="rounded-full bg-leaf-soft px-2.5 py-1 font-medium text-leaf">Wireframe</span>
        <span className="truncate text-foreground">
          <span className="text-muted-foreground">Tela:</span>{" "}
          <strong>{screenLabels[nav.screen]}</strong>
        </span>
        {guided && (
          <span className="text-muted-foreground">
            Etapa {guidedStep + 1}/{guidedFlow.length}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={back} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
          </Button>
          {guided && (
            <>
              <Button size="sm" variant="ghost" onClick={prevGuidedStep} aria-label="Etapa anterior">
                Anterior
              </Button>
              <Button size="sm" variant="secondary" onClick={nextGuidedStep} aria-label="Próxima etapa">
                Próxima <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => setMapOpen(true)} aria-label="Mapa de telas">
            <Map className="h-4 w-4" /> <span className="hidden sm:inline">Mapa</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} aria-label="Reiniciar demonstração">
            <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Reiniciar</span>
          </Button>
        </div>
      </div>

      {mapOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mapa de telas"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setMapOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg">Mapa de telas</h2>
              <Button size="sm" variant="ghost" onClick={() => setMapOpen(false)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {allScreens.map((s) => (
                <Button
                  key={s}
                  variant={s === nav.screen ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-left"
                  onClick={() => {
                    go(s);
                    setMapOpen(false);
                  }}
                >
                  {screenLabels[s]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
