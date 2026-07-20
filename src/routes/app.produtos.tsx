import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProductRecommendationCard } from "@/components/ProductRecommendationCard";
import { mockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/app/produtos")({
  head: () => ({ meta: [{ title: "Produtos · Plantae AI" }] }),
  component: Products,
});

function Products() {
  return (
    <AppShell title="Produtos recomendados">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Recomendações contextuais para os cuidados da sua planta. Sempre
          respeite o rótulo do produto.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {mockProducts.map((p) => (
            <ProductRecommendationCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
