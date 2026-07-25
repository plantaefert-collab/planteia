import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { diagnosisHistory, type DiagnosisFeedbackRating } from "@/lib/diagnosis-history";
import { toast } from "sonner";

export function DiagnosisFeedback({ diagnosisId }: { diagnosisId: string }) {
  const [rating, setRating] = useState<DiagnosisFeedbackRating | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = diagnosisHistory.getByDiagnosisId(diagnosisId)?.feedback;
    if (existing) {
      setRating(existing.rating);
      setNote(existing.note ?? "");
      setSaved(true);
    }
  }, [diagnosisId]);

  const pick = (r: DiagnosisFeedbackRating) => {
    setRating(r);
    setSaved(false);
    setShowNote(true);
    const result = diagnosisHistory.setFeedback(diagnosisId, { rating: r });
    if (result) {
      toast.success(r === "acertou" ? "Obrigado pelo retorno!" : "Anotado — vamos melhorar.");
    }
  };

  const saveNote = () => {
    if (!rating) return;
    diagnosisHistory.setFeedback(diagnosisId, { rating, note: note.trim() || undefined });
    setSaved(true);
    setShowNote(false);
    toast.success("Comentário salvo.");
  };

  const reset = () => {
    diagnosisHistory.setFeedback(diagnosisId, null);
    setRating(null);
    setNote("");
    setShowNote(false);
    setSaved(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Este diagnóstico foi útil?</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Seu retorno ajuda a calibrar as próximas análises.
          </p>
        </div>
        {saved && rating && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Alterar
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant={rating === "acertou" ? "default" : "outline"}
          size="sm"
          disabled={saved && rating !== "acertou"}
          onClick={() => pick("acertou")}
          className={cn("flex-1", rating === "acertou" && "bg-success hover:bg-success/90 text-white")}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Acertou
        </Button>
        <Button
          type="button"
          variant={rating === "errou" ? "default" : "outline"}
          size="sm"
          disabled={saved && rating !== "errou"}
          onClick={() => pick("errou")}
          className={cn("flex-1", rating === "errou" && "bg-destructive hover:bg-destructive/90 text-white")}
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          Errou
        </Button>
      </div>

      {rating && showNote && !saved && (
        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Textarea
            placeholder={
              rating === "acertou"
                ? "O que ajudou mais? (opcional)"
                : "O que o diagnóstico deixou passar? (opcional)"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveNote} className="flex-1">
              <Check className="mr-1.5 h-3.5 w-3.5" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNote(false)}>
              <X className="mr-1.5 h-3.5 w-3.5" /> Pular
            </Button>
          </div>
        </div>
      )}

      {saved && rating && note && (
        <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
          "{note}"
        </p>
      )}
    </section>
  );
}
