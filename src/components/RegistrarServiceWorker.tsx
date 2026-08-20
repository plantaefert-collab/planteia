import { useEffect } from "react";

/**
 * Registra o service worker que torna o app instalável e dá uma tela de
 * offline decente.
 *
 * Roda depois do `load` de propósito: registrar durante o carregamento
 * disputa banda com o próprio conteúdo, e o ganho do service worker só
 * aparece na visita seguinte.
 *
 * Em desenvolvimento não registra — service worker guardando `/assets/`
 * versionado atrapalha o hot reload.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (import.meta.env.DEV) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Falhar aqui não pode quebrar o app: sem service worker ele
        // continua funcionando, só não fica instalável.
      });
    };

    if (document.readyState === "complete") registrar();
    else {
      window.addEventListener("load", registrar);
      return () => window.removeEventListener("load", registrar);
    }
  }, []);

  return null;
}
