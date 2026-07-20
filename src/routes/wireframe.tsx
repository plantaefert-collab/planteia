import { createFileRoute } from "@tanstack/react-router";
import { WireframeApp } from "@/wireframe/WireframeApp";

export const Route = createFileRoute("/wireframe")({
  head: () => ({
    meta: [
      { title: "Wireframe — Plantae AI" },
      { name: "description", content: "Wireframe interativo do Plantae AI para validação de fluxos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WireframeApp,
});
