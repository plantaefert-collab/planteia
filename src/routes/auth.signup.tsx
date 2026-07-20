import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Criar sua conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gratuito para começar. Sem cartão.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/onboarding" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Como podemos te chamar?</Label>
          <Input id="name" placeholder="Seu nome" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@email.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full">
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/auth/login" className="font-medium text-leaf hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
