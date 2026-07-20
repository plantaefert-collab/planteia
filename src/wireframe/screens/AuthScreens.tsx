import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Sparkles } from "lucide-react";
import { useDemo } from "../DemoState";

export function WelcomeScreen() {
  const { go, setGuided } = useDemo();
  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf-soft">
        <Leaf className="h-10 w-10 text-leaf" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-foreground">Plantae AI</h1>
        <p className="text-muted-foreground">
          Assistente inteligente de cuidados com plantas. Demonstração navegável.
        </p>
      </div>
      <div className="space-y-2">
        <Button className="w-full" onClick={() => { setGuided(true); go("login"); }}>
          <Sparkles className="mr-2 h-4 w-4" /> Iniciar demonstração guiada
        </Button>
        <Button variant="outline" className="w-full" onClick={() => { setGuided(false); go("dashboard"); }}>
          Explorar telas livremente
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => go("login")}>
          Já tenho conta
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Wireframe de demonstração. Nenhum dado é enviado a serviços externos.
      </p>
    </div>
  );
}

export function LoginScreen() {
  const { go } = useDemo();
  return (
    <AuthCard title="Entrar" subtitle="Login demonstrativo — qualquer valor é aceito.">
      <FormField id="email" label="E-mail" defaultValue="demo@plantae.ai" />
      <FormField id="senha" label="Senha" type="password" defaultValue="********" />
      <Button className="w-full" onClick={() => go("onboarding")}>Entrar</Button>
      <div className="flex justify-between text-sm">
        <button className="text-leaf underline" onClick={() => go("recover")}>Recuperar senha</button>
        <button className="text-leaf underline" onClick={() => go("signup")}>Criar conta</button>
      </div>
    </AuthCard>
  );
}

export function SignupScreen() {
  const { go } = useDemo();
  return (
    <AuthCard title="Criar conta" subtitle="Cadastro demonstrativo.">
      <FormField id="nome" label="Nome" defaultValue="Convidado" />
      <FormField id="email" label="E-mail" defaultValue="novo@plantae.ai" />
      <FormField id="senha" label="Senha" type="password" defaultValue="********" />
      <Button className="w-full" onClick={() => go("onboarding")}>Criar conta</Button>
      <button className="w-full text-sm text-leaf underline" onClick={() => go("login")}>Já tenho conta</button>
    </AuthCard>
  );
}

export function RecoverScreen() {
  const { go } = useDemo();
  const [sent, setSent] = useState(false);
  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos instruções para seu e-mail (simulado).">
      <FormField id="email" label="E-mail" defaultValue="demo@plantae.ai" />
      {sent ? (
        <p role="status" aria-live="polite" className="rounded-lg bg-success-soft p-3 text-sm text-success">
          Instruções enviadas (simulado).
        </p>
      ) : (
        <Button className="w-full" onClick={() => setSent(true)}>Enviar instruções</Button>
      )}
      <button className="w-full text-sm text-leaf underline" onClick={() => go("login")}>Voltar para o login</button>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3">{children}</CardContent>
      </Card>
    </div>
  );
}

function FormField({ id, label, type = "text", defaultValue }: { id: string; label: string; type?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} defaultValue={defaultValue} />
    </div>
  );
}
