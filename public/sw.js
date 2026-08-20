/*
 * Service worker do Plantae AI.
 *
 * Postura conservadora, e de propósito: o app tem SSR e autenticação.
 * Um service worker que cacheia navegação pode servir a página de um
 * usuário para outro depois da troca de conta, ou mostrar dado velho de
 * planta como se fosse atual — num app de diagnóstico isso é pior que
 * ficar offline.
 *
 * Portanto:
 *   - Estático versionado (/assets/*, ícones): cache primeiro. São imutáveis
 *     por hash, então não envelhecem.
 *   - Navegação: rede primeiro, com uma página de offline como último recurso.
 *     Nunca guardamos HTML autenticado.
 *   - /api/*: jamais tocado. Diagnóstico e chat precisam ser ao vivo.
 */

const VERSAO = "plantae-v1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO).then((c) => c.addAll([OFFLINE])).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const ehEstatico = (url) =>
  url.pathname.startsWith("/assets/") ||
  url.pathname.startsWith("/_build/") ||
  /\.(png|svg|ico|webmanifest|woff2?)$/.test(url.pathname);

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Diagnóstico, chat e qualquer rota de dados: sempre ao vivo.
  if (url.pathname.startsWith("/api/")) return;

  if (ehEstatico(url)) {
    evento.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copia = res.clone();
              caches.open(VERSAO).then((c) => c.put(req, copia));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Navegação: rede primeiro. Sem rede, a página de offline —
  // nunca uma versão guardada da tela pedida.
  if (req.mode === "navigate") {
    evento.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
  }
});
