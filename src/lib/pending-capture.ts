// Holder em memória para a foto capturada pelo botão da câmera (barra inferior)
// antes de navegar para a tela de diagnóstico. Como a navegação é client-side
// (SPA), o estado do módulo persiste através da troca de rota.
//
// Fluxo: BottomNavigation captura → pendingCapture.set(dataUrl) → navega para
// /app/diagnostico → a tela consome com pendingCapture.take() no mount.

let pending: string | null = null;

export const pendingCapture = {
  set(dataUrl: string) {
    pending = dataUrl;
  },
  /** Retorna a foto pendente e a limpa (consumo único). */
  take(): string | null {
    const value = pending;
    pending = null;
    return value;
  },
  peek(): string | null {
    return pending;
  },
};
