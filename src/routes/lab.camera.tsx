import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VisorDaCamera } from "@/components/camera/VisorDaCamera";

export const Route = createFileRoute("/lab/camera")({ component: LabCamera });

/** Rota de laboratório: existe só para avaliar o visor antes de ligá-lo ao
 *  fluxo de diagnóstico. Remover quando o VisorDaCamera estiver integrado. */
function LabCamera() {
  const [aberta, setAberta] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-semibold">Visor da câmera</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Avaliação isolada, antes de ligar ao diagnóstico.
        </p>

        {foto && (
          <img
            src={foto}
            alt="Captura de teste"
            className="mt-6 aspect-square w-full rounded-2xl object-cover shadow-md"
          />
        )}

        <button
          onClick={() => setAberta(true)}
          className="mt-6 h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground"
        >
          {foto ? "Fotografar de novo" : "Abrir câmera"}
        </button>
      </div>

      {aberta && (
        <VisorDaCamera
          instrucao="Folha afetada, de perto"
          onFechar={() => setAberta(false)}
          onCapturar={(arquivo) => {
            setFoto(URL.createObjectURL(arquivo));
            setAberta(false);
          }}
        />
      )}
    </div>
  );
}
