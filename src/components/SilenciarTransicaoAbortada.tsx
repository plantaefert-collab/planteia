import { useEffect } from "react";

/**
 * Silencia a rejeição de promessa que a View Transitions API produz quando
 * uma transição é interrompida por outra.
 *
 * O que acontece: o router chama `document.startViewTransition()` a cada
 * navegação. Se o usuário toca em outra aba antes de a anterior terminar —
 * ou se o próprio router redireciona durante a hidratação — a transição em
 * curso é abortada e a promessa dela rejeita com InvalidStateError. O
 * router não a captura, então cai como "Uncaught (in promise)".
 *
 * Nada quebra: a transição nova assume e a tela aparece certa. Mas o erro
 * polui o console em toda navegação, e console poluído esconde erro de
 * verdade — que é o custo real.
 *
 * Só esta rejeição específica é engolida. Qualquer outra continua visível.
 */
export function SilenciarTransicaoAbortada() {
  useEffect(() => {
    const aoRejeitar = (e: PromiseRejectionEvent) => {
      const motivo = e.reason as { name?: string; message?: string } | undefined;
      if (
        motivo?.name === "InvalidStateError" &&
        /transition was aborted/i.test(motivo.message ?? "")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", aoRejeitar);
    return () => window.removeEventListener("unhandledrejection", aoRejeitar);
  }, []);

  return null;
}
