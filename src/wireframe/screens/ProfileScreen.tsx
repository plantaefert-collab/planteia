import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemo } from "../DemoState";

export function ProfileScreen() {
  const { go, reset } = useDemo();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Perfil</h1>

      <Card>
        <CardContent className="space-y-1 pt-6">
          <p className="font-medium">Convidado(a) Demonstração</p>
          <p className="text-sm text-muted-foreground">demo@plantae.ai</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <Row label="Lembretes" value="Semanais" />
          <Row label="Nível de experiência" value="Intermediário" />
          <Row label="Privacidade" value="Dados locais desta sessão" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => alert("Exportação simulada (demonstração).")}>Exportar dados</Button>
        <Button variant="ghost" onClick={reset}>Reiniciar demonstração</Button>
        <Button variant="destructive" onClick={() => { reset(); go("welcome"); }}>Sair da demonstração</Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
