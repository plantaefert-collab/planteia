import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageUp, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MENSAGEM,
  useAnaliseDoQuadro,
  vereditoDe,
  type QualidadeDoQuadro,
  type Veredito,
} from "./useAnaliseDoQuadro";

interface Props {
  onCapturar: (arquivo: File) => void;
  onFechar: () => void;
  /** Texto do que se espera desta foto. Ex.: "Folha afetada, de perto". */
  instrucao?: string;
}

/**
 * Visor de câmera dentro do app.
 *
 * O que existia antes era `<input capture="environment">`, que entrega a
 * captura para o app de câmera do sistema: sem moldura, sem orientação e
 * sem nenhuma verificação. O usuário só descobria que a foto estava ruim
 * depois de esperar o diagnóstico inteiro.
 *
 * Aqui a moldura diz onde pôr a planta, a leitura de qualidade avisa antes
 * de gastar a análise, e o disparo só libera quando o quadro está utilizável.
 */
export function VisorDaCamera({ onCapturar, onFechar, instrucao }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fluxoRef = useRef<MediaStream | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const analisar = useAnaliseDoQuadro();

  const [estado, setEstado] = useState<"pedindo" | "ativa" | "negada">("pedindo");
  const [qualidade, setQualidade] = useState<QualidadeDoQuadro | null>(null);
  const [congelado, setCongelado] = useState(false);

  const veredito: Veredito = vereditoDe(qualidade);
  const pronto = veredito === "pronto";

  useEffect(() => {
    let vivo = true;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        audio: false,
      })
      .then((fluxo) => {
        if (!vivo) {
          fluxo.getTracks().forEach((t) => t.stop());
          return;
        }
        fluxoRef.current = fluxo;
        if (videoRef.current) videoRef.current.srcObject = fluxo;
        setEstado("ativa");
      })
      .catch(() => vivo && setEstado("negada"));

    return () => {
      vivo = false;
      fluxoRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Leitura de qualidade a ~6 Hz: suficiente para orientar, leve o bastante
  // para não esquentar o aparelho.
  useEffect(() => {
    if (estado !== "ativa" || congelado) return;
    const id = window.setInterval(() => {
      if (videoRef.current) setQualidade(analisar(videoRef.current));
    }, 160);
    return () => window.clearInterval(id);
  }, [estado, congelado, analisar]);

  const disparar = useCallback(() => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    setCongelado(true);

    const lado = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      video,
      (video.videoWidth - lado) / 2,
      (video.videoHeight - lado) / 2,
      lado,
      lado,
      0,
      0,
      lado,
      lado,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return setCongelado(false);
        onCapturar(new File([blob], `planta-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  }, [onCapturar]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* topo */}
      <div
        className="flex items-center justify-between px-4 pb-3 text-white"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <button
          onClick={onFechar}
          aria-label="Fechar câmera"
          className="tap-safe-square grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur"
        >
          <X className="h-5 w-5" />
        </button>
        {instrucao && <p className="mx-3 flex-1 text-center text-sm font-medium">{instrucao}</p>}
        <div className="h-9 w-9" />
      </div>

      {/* visor */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("h-full w-full object-cover transition-opacity", congelado && "opacity-70")}
        />

        {estado === "pedindo" && (
          <div className="absolute inset-0 grid place-items-center bg-black px-8 text-center text-white">
            <div>
              <Camera className="mx-auto mb-3 h-8 w-8 animate-pulse opacity-60" />
              <p className="text-sm">Abrindo a câmera…</p>
              <p className="mt-1 text-xs text-white/60">
                Se aparecer um pedido de permissão, toque em permitir.
              </p>
            </div>
          </div>
        )}

        {estado === "negada" && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 px-8 text-center text-white">
            <div>
              <Camera className="mx-auto mb-3 h-8 w-8 opacity-60" />
              <p className="text-sm">
                Não consegui abrir a câmera. Você pode escolher uma foto da galeria.
              </p>
            </div>
          </div>
        )}

        {estado === "ativa" && <Moldura pronto={pronto} congelado={congelado} />}
      </div>

      {/* rodapé */}
      <div
        className="bg-black px-6 pt-4 text-white"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
      >
        <div
          className={cn(
            "mx-auto mb-4 flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            pronto ? "bg-success/20 text-success" : "bg-warning/20 text-warning",
          )}
          role="status"
          aria-live="polite"
        >
          <Zap className="h-3.5 w-3.5" />
          {MENSAGEM[veredito]}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => arquivoRef.current?.click()}
            aria-label="Escolher da galeria"
            className="tap-safe-square grid h-11 w-11 place-items-center rounded-full bg-white/15"
          >
            <ImageUp className="h-5 w-5" />
          </button>

          <button
            onClick={disparar}
            disabled={!pronto || congelado || estado !== "ativa"}
            aria-label="Fotografar"
            className={cn(
              "grid h-[72px] w-[72px] place-items-center rounded-full ring-4 ring-white/30 transition",
              pronto && !congelado ? "bg-white active:scale-90" : "bg-white/40 ring-white/10",
            )}
          >
            <span className="h-14 w-14 rounded-full bg-white" />
          </button>

          <div className="h-11 w-11" />
        </div>

        <input
          ref={arquivoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onCapturar(f);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Cantos em colchete, não moldura fechada: a moldura inteira compete com a
 * planta e sugere que a foto será recortada ali. Os cantos só enquadram.
 */
function Moldura({ pronto, congelado }: { pronto: boolean; congelado: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="relative aspect-square w-[76%] max-w-sm">
        {(
          [
            "left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-2xl",
            "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
            "left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-2xl",
            "right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-2xl",
          ] as const
        ).map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute h-9 w-9 transition-colors duration-300",
              pos,
              pronto ? "border-success" : "border-white/70",
            )}
          />
        ))}

        {!congelado && (
          <span
            className="varredura absolute inset-x-2 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-success), transparent)",
              boxShadow: "0 0 12px 2px var(--color-success)",
            }}
          />
        )}
      </div>
    </div>
  );
}
