import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Transição entre rotas pela View Transitions API — plataforma aprovada em
    // design/motion-system.md § 0.1. As curvas e durações ficam no CSS
    // (styles.css, ::view-transition), não aqui.
    defaultViewTransition: true,
  });

  return router;
};
