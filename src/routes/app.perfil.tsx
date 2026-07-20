import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, LogOut, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Plantae AI" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell title="Perfil e configurações">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Dados pessoais</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="n">Nome</Label>
              <Input id="n" defaultValue="Maria" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e">E-mail</Label>
              <Input id="e" type="email" defaultValue="maria@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c">Cidade</Label>
              <Input id="c" defaultValue="São Paulo, SP" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Notificações</h3>
          <div className="mt-3 space-y-3">
            {[
              "Lembretes de rega",
              "Alertas de plantas em atenção",
              "Dica do dia",
              "Novidades da PlantaeFert",
            ].map((n) => (
              <div key={n} className="flex items-center justify-between">
                <span className="text-sm">{n}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-bloom-soft to-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Plano atual
            </span>
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold">Gratuito</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre plantas, use lembretes e diagnóstico com limites.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Privacidade</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4" /> Exportar meus dados
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. Todos os seus dados serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.info("Demonstração: exclusão simulada.")}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <Separator />

        <Button asChild variant="outline" className="w-full">
          <Link to="/">
            <LogOut className="h-4 w-4" /> Sair
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
