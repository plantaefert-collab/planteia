import { useRef, useState, useEffect } from "react";
import { Camera, X, Settings2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export function PhotoUploader({
  label,
  hint,
  className,
  onUpload,
}: {
  label: string;
  hint?: string;
  className?: string;
  onUpload?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);


  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setPreview(dataUrl);
      onUpload?.(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  // Check permissions on mount for better DX if possible
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        if (result.state === "denied") {
          setPermissionDenied(true);
        }
        result.onchange = () => {
          if (result.state === "denied") {
            setPermissionDenied(true);
          } else {
            setPermissionDenied(false);
          }
        };
      }).catch(() => {
        // Many browsers don't support 'camera' query in permissions.query yet
      });
    }
  }, []);

  return (

    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {permissionDenied ? (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Câmera bloqueada</AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed space-y-3">
            <p>
              Não conseguimos acessar sua câmera porque a permissão foi negada. 
              Para diagnosticar sua planta com fotos, você precisa permitir o acesso.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-medium border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  setPermissionDenied(false);
                  inputRef.current?.click();
                }}
              >
                Tentar novamente
              </Button>
              <div className="rounded-lg bg-background/50 p-2 text-[10px] text-muted-foreground border border-border/50">
                <p className="font-semibold text-foreground/70 mb-1 flex items-center gap-1">
                  <Settings2 className="h-3 w-3" /> Como ajustar:
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Toque no ícone de cadeado/ajustes ao lado da URL</li>
                  <li>Ative o interruptor da "Câmera"</li>
                  <li>Recarregue esta página</li>
                </ol>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <button
          type="button"
          onClick={() => {
            // No mobile, se o usuário já negou, alguns navegadores não abrem o seletor de novo
            // sem intervenção manual, mas tentamos abrir o input file que é o fallback padrão.
            inputRef.current?.click();
          }}
          className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-leaf hover:bg-leaf-soft/40"
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                }}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow"
              >
                <X className="h-4 w-4" />
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <Camera className="h-6 w-6" />
              <span className="text-sm">Toque para enviar uma foto</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                // Se o usuário cancelou o seletor após um erro anterior, podemos manter o estado ou resetar
                return;
              }
              onFile(file);
            }}
            // Tenta detectar quando o navegador não consegue abrir a câmera nativa
            onError={() => setPermissionDenied(true)}
          />
        </button>
      )}

    </div>
  );
}
