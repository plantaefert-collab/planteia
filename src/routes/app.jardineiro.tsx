import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSuggestions, mockPlants, mockDiagnosesByPlant } from "@/lib/mock-data";
import { ImagePlus, Send, Sprout, Loader2, X } from "lucide-react";
import { processImageForAi } from "@/lib/image-processing";
import { toast } from "sonner";

export const Route = createFileRoute("/app/jardineiro")({
  head: () => ({ meta: [{ title: "Jardineiro IA · Plantae AI" }] }),
  component: Chat,
});

function Chat() {
  const [input, setInput] = useState("");
  const [plantId, setPlantId] = useState<string>(mockPlants[0]?.id ?? "");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plantIdRef = useRef(plantId);
  useEffect(() => {
    plantIdRef.current = plantId;
  }, [plantId]);

  const activePlant = useMemo(
    () => mockPlants.find((p) => p.id === plantId) ?? mockPlants[0],
    [plantId],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => {
          const plant = mockPlants.find((p) => p.id === plantIdRef.current);
          const diag = plant ? mockDiagnosesByPlant[plant.id] : undefined;
          return {
            body: {
              ...body,
              messages,
              context: plant
                ? {
                    plant: {
                      nickname: plant.nickname,
                      species: plant.species,
                      scientific: plant.scientific,
                      environment: plant.environment,
                      light: plant.light,
                      potSize: plant.potSize,
                      wateringFrequencyDays: plant.wateringFrequencyDays,
                      lastWatered: plant.lastWatered,
                      lastFertilized: plant.lastFertilized,
                      status: plant.status,
                    },
                    lastDiagnosis: diag
                      ? {
                          mainSuspicion: diag.mainSuspicion,
                          status: diag.status,
                          createdAt: diag.createdAt,
                        }
                      : null,
                  }
                : undefined,
            },
          };
        },
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err) => {
      toast.error("Não consegui responder agora", {
        description: err.message.includes("429")
          ? "Muitas requisições. Aguarde alguns segundos."
          : err.message.includes("402")
            ? "Créditos de IA esgotados. Recarregue no workspace."
            : "Tente novamente em instantes.",
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && !attachment) || isLoading) return;
    const img = attachment;
    setInput("");
    setAttachment(null);
    await sendMessage({
      text: trimmed || "Segue a foto da minha planta. O que você observa?",
      ...(img
        ? { files: [{ type: "file" as const, mediaType: "image/jpeg", url: img }] }
        : {}),
    });
  };

  const onPickImage = async (file: File | undefined, input: HTMLInputElement) => {
    input.value = "";
    if (!file) return;
    setIsProcessingImg(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (!dataUrl) return;
      const processed = await processImageForAi(dataUrl);
      setAttachment(processed);
    } catch {
      toast.error("Não consegui carregar a imagem.");
    } finally {
      setIsProcessingImg(false);
    }
  };

  return (
    <AppShell title="Jardineiro IA">
      <div className="flex h-[calc(100vh-10rem)] flex-col md:h-[calc(100vh-9rem)]">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground/90">
              Olá! Sou o <strong>Jardineiro IA</strong>. Me conte um sintoma,
              descreva a rotina de cuidado ou peça orientação sobre sua planta.
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const images = m.parts.filter(
              (p: any) =>
                p.type === "file" &&
                typeof p.url === "string" &&
                (p.mediaType ?? "").startsWith("image/"),
            ) as any[];
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] space-y-2 overflow-hidden rounded-2xl px-3.5 py-2.5 text-sm ${
                    isUser
                      ? "bg-leaf text-primary-foreground"
                      : "border border-border bg-card text-foreground"
                  }`}
                >
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt="Foto enviada"
                      className="max-h-48 w-full rounded-lg object-cover"
                    />
                  ))}
                  {text && <p className="whitespace-pre-wrap">{text}</p>}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              O Jardineiro está pensando…
            </div>
          )}

          {messages.length === 0 && (
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
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Falando sobre:</span>
            {mockPlants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlantId(p.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                  activePlant?.id === p.id
                    ? "border-leaf bg-leaf-soft text-leaf"
                    : "border-border bg-card text-muted-foreground hover:border-leaf"
                }`}
              >
                <Sprout className="h-3.5 w-3.5" />
                {p.nickname}
              </button>
            ))}
          </div>
          {attachment && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <img
                  src={attachment}
                  alt="Prévia da foto"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  aria-label="Remover foto"
                  className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Foto anexada</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0], e.currentTarget)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isLoading || isProcessingImg}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Anexar foto"
            >
              {isProcessingImg ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
            </Button>
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ou envie uma foto…"
              rows={1}
              className="min-h-11 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!input.trim() && !attachment)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
