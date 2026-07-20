import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo } from "../DemoState";
import { gardenerSuggestions } from "../mockData";

interface Msg { role: "user" | "ai"; text: string }

export function GardenerChatScreen() {
  const { state } = useDemo();
  const [plantId, setPlantId] = useState<string>(state.plants[0]?.id ?? "");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Olá! Sou o Jardineiro (demonstração). Escolha uma planta e me pergunte algo." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const plant = state.plants.find((p) => p.id === plantId);
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: `Resposta simulada para "${text}" sobre ${plant?.name ?? "sua planta"}. Este chat não usa IA real.` },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100dvh-160px)] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl">Jardineiro IA</h1>
        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning">Demonstração — sem IA real</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {state.plants.map((p) => (
          <Button key={p.id} size="sm" variant={plantId === p.id ? "default" : "outline"} onClick={() => setPlantId(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>

      <div role="log" aria-live="polite" className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-card p-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-leaf text-primary-foreground" : "bg-muted"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {gardenerSuggestions.map((s) => (
          <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>{s}</Button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2"
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva uma mensagem" aria-label="Mensagem" />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  );
}
