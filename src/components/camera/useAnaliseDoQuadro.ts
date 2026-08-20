import { useCallback, useRef } from "react";

export interface QualidadeDoQuadro {
  /** 0 a 1. Abaixo de 0.18 está escuro; acima de 0.92 está estourado. */
  luz: number;
  /** Variância do laplaciano normalizada. Abaixo de 0.12 está fora de foco. */
  nitidez: number;
  /** Quanto o quadro mudou desde o anterior. Perto de 0 significa mão parada. */
  movimento: number;
}

export type Veredito = "escuro" | "estourado" | "desfocado" | "tremendo" | "pronto";

/**
 * Lê a qualidade do quadro no próprio navegador, sem modelo e sem rede.
 *
 * Existe para não gastar uma análise inteira numa foto ruim: hoje o usuário
 * espera o diagnóstico para só então descobrir que a foto estava escura.
 * Medir antes custa alguns milissegundos.
 *
 * Trabalha sobre um recorte reduzido a 64x64 — resolução cheia não melhora
 * a medida e derruba a taxa de quadros em aparelho modesto.
 */
export function useAnaliseDoQuadro() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const anteriorRef = useRef<Float32Array | null>(null);

  const analisar = useCallback((video: HTMLVideoElement): QualidadeDoQuadro | null => {
    if (!video.videoWidth) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 64;
      canvasRef.current.height = 64;
    }
    const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    // Recorta o centro — é onde a moldura pede que a planta esteja.
    const lado = Math.min(video.videoWidth, video.videoHeight) * 0.7;
    const sx = (video.videoWidth - lado) / 2;
    const sy = (video.videoHeight - lado) / 2;
    ctx.drawImage(video, sx, sy, lado, lado, 0, 0, 64, 64);

    const { data } = ctx.getImageData(0, 0, 64, 64);
    const cinza = new Float32Array(64 * 64);
    let soma = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const v = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      cinza[p] = v;
      soma += v;
    }
    const luz = soma / cinza.length;

    // Nitidez por variância do laplaciano: imagem borrada tem poucas bordas.
    let somaLap = 0;
    let somaLap2 = 0;
    let n = 0;
    for (let y = 1; y < 63; y++) {
      for (let x = 1; x < 63; x++) {
        const i = y * 64 + x;
        const lap = 4 * cinza[i] - cinza[i - 1] - cinza[i + 1] - cinza[i - 64] - cinza[i + 64];
        somaLap += lap;
        somaLap2 += lap * lap;
        n++;
      }
    }
    const media = somaLap / n;
    const nitidez = Math.min(1, Math.sqrt(somaLap2 / n - media * media) * 8);

    let movimento = 0;
    const anterior = anteriorRef.current;
    if (anterior) {
      let dif = 0;
      for (let i = 0; i < cinza.length; i++) dif += Math.abs(cinza[i] - anterior[i]);
      movimento = dif / cinza.length;
    }
    anteriorRef.current = cinza;

    return { luz, nitidez, movimento };
  }, []);

  return analisar;
}

/** Traduz a medida em um único veredito, na ordem em que importa ao usuário. */
export function vereditoDe(q: QualidadeDoQuadro | null): Veredito {
  if (!q) return "tremendo";
  if (q.luz < 0.18) return "escuro";
  if (q.luz > 0.92) return "estourado";
  if (q.nitidez < 0.12) return "desfocado";
  if (q.movimento > 0.045) return "tremendo";
  return "pronto";
}

export const MENSAGEM: Record<Veredito, string> = {
  escuro: "Está escuro — leve a planta para perto de uma janela",
  estourado: "Muita luz direta — vire de costas para o sol",
  desfocado: "Aproxime ou afaste até a folha ficar nítida",
  tremendo: "Segure firme por um instante",
  pronto: "Pode fotografar",
};
