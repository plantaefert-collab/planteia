import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Camera, Calendar, Sparkles, Check, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plantae AI — Seu jardineiro inteligente" },
      {
        name: "description",
        content:
          "Diagnóstico assistido por IA, plano personalizado e calendário de cuidados para suas plantas — começando por orquídeas.",
      },
      { property: "og:title", content: "Plantae AI — Seu jardineiro inteligente" },
      {
        property: "og:description",
        content:
          "Diagnóstico assistido por IA, plano personalizado e calendário de cuidados para suas plantas — começando por orquídeas.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-leaf text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">Plantae AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth/signup">Criar conta</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:pt-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-leaf">
              <Sparkles className="h-3.5 w-3.5" /> PlantaeFert · MVP
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Seu jardineiro inteligente para cuidar melhor de cada planta.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              Diagnóstico assistido por fotos, plano personalizado e lembretes
              claros. Começamos por orquídeas — com carinho e conhecimento
              técnico.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth/signup">
                  Começar gratuitamente <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app/inicio">Ver demonstração</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-leaf" />
              Diagnóstico provável, não substitui inspeção presencial.
            </p>
          </div>

          <div className="relative">
            <div className="mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&auto=format&fit=crop"
                alt="Orquídea Phalaenopsis em ambiente iluminado"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-4 rounded-2xl border border-border bg-card p-4 shadow-lg md:-left-6">
              <p className="text-xs text-muted-foreground">Hoje</p>
              <p className="text-sm font-semibold">Verificar raízes 🌱</p>
              <p className="text-xs text-leaf">Orquídea da sala</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Feito para quem cuida.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { icon: Camera, t: "Diagnóstico assistido", d: "Envie fotos e receba hipóteses claras com sinais observados." },
            { icon: Sparkles, t: "Plano personalizado", d: "Ações imediatas, o que evitar e reavaliação sugerida." },
            { icon: Calendar, t: "Calendário", d: "Regar, adubar, podar — no ritmo certo da sua planta." },
            { icon: Leaf, t: "Acompanhamento", d: "Linha do tempo e comparação de fotos ao longo do tempo." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-soft text-leaf">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-display text-3xl font-semibold">Como funciona</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Cadastre sua planta", d: "Nome, espécie (ou 'não sei'), foto e ambiente." },
            { n: "2", t: "Envie fotos ou pergunte", d: "Diagnóstico por fotos ou chat com o Jardineiro IA." },
            { n: "3", t: "Siga seu plano", d: "Ações claras, lembretes e evolução ao longo do tempo." },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground font-semibold">
                {s.n}
              </div>
              <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Segurança */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-border bg-leaf-soft/40 p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold">Diagnóstico provável, com transparência.</h2>
          <p className="mt-2 text-sm text-foreground/80 md:text-base">
            O Plantae AI apresenta hipóteses, nível de confiança e sinais observados. Ele
            <strong> não substitui</strong> inspeção presencial de um profissional. Sempre
            respeite o rótulo dos produtos utilizados.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Confiança baixa, moderada ou alta em cada análise",
              "Outras possibilidades listadas para você comparar",
              "Sinais de urgência destacados quando necessário",
            ].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-leaf" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-3xl font-semibold">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-4">
          {[
            {
              q: "O Plantae AI substitui um especialista?",
              a: "Não. Ele oferece hipóteses assistidas por IA para ajudar suas decisões. Casos graves devem ser avaliados presencialmente.",
            },
            {
              q: "Preciso pagar para usar?",
              a: "O plano Gratuito permite cadastrar plantas, receber lembretes e usar o diagnóstico com limites.",
            },
            {
              q: "Funciona só para orquídeas?",
              a: "Começamos com orquídeas, mas a arquitetura está preparada para outras espécies.",
            },
            {
              q: "Meus dados ficam seguros?",
              a: "Sim. Suas fotos e dados são usados apenas para melhorar as recomendações da sua conta.",
            },
          ].map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PlantaeFert · Plantae AI</p>
          <p>Feito com 🌿 no Brasil</p>
        </div>
      </footer>
    </div>
  );
}
