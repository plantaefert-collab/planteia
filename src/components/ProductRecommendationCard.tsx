import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function ProductRecommendationCard({ product }: { product: Product }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img src={product.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-foreground">
          {product.name}
        </h4>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {product.goal}
        </p>
        <p className="mt-1 text-xs text-leaf">Ideal: {product.moment}</p>
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" variant="outline">
            Ver produto
          </Button>
        </div>
      </div>
    </div>
  );
}
