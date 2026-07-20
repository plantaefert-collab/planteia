import { Card, CardContent } from "@/components/ui/card";
import { demoProducts } from "../mockData";

export function ProductsScreen() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-2xl">Produtos recomendados</h1>
        <p className="text-sm text-muted-foreground">
          Sugestões contextuais de apoio — nunca substituem o diagnóstico. Respeite sempre o rótulo.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {demoProducts.map((p) => (
          <li key={p.id}>
            <Card>
              <CardContent className="space-y-2 pt-6">
                <p className="font-display text-lg">{p.name}</p>
                <p className="text-sm"><span className="font-medium">Motivo:</span> {p.reason}</p>
                <p className="text-sm"><span className="font-medium">Quando usar:</span> {p.when}</p>
                <p className="text-sm"><span className="font-medium">Quando evitar:</span> {p.avoid}</p>
                <p className="rounded-lg bg-warning-soft p-2 text-xs text-warning">
                  Sem checkout — demonstração apenas.
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
