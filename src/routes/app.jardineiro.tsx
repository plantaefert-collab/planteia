import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AIMessage } from "@/components/AIMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatService } from "@/lib/services";
import { chatSuggestions, mockPlants } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";
import { ImagePlus, Send, Sprout, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/jardineiro")({
  head: () => ({ meta: [{ title: "Jardineiro IA · Plantae AI" }] }),
  component: Chat,
});

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.initial().then(setMessages);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, user]);
    setInput("");
    setLoading(true);
    const reply = await chatService.ask(text);
    setMessages((m) => [...m, reply]);
    setLoading(false);
  };

  return (
    <AppShell title="Jardineiro IA">
      <div className="flex h-[calc(100vh-10rem)] flex-col md:h-[calc(100vh-9rem)]">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.map((m) => (
            <AIMessage key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              O Jardineiro está pensando…
            </div>
          )}

          {messages.length <= 1 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sugestões
              </p>
              <div className="flex flex-wrap gap-2">
                {chatSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/90 transition hover:border-leaf"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background pt-3">
          <div className="mb-2 flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <Sprout className="h-3.5 w-3.5" />
              {mockPlants[0].nickname}
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" />
              Anexar foto
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao Jardineiro IA…"
              rows={1}
              className="min-h-11 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
