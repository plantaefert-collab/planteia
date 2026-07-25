import { useRef, useState, useEffect } from "react";
import { Camera, X, Settings2, ShieldAlert, Sparkles, Loader2, Lightbulb, Focus, Maximize, Sliders, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { processImageForAi, calculateBlurriness } from "@/lib/image-processing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";


export function PhotoUploader({
  label,
  hint,
  className,
  onUpload,
  initialPreview,
}: {
  label: string;
  hint?: string;
  className?: string;
  onUpload?: (url: string) => void;
  initialPreview?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brightness, setBrightness] = useState(1.1);
  const [contrast, setContrast] = useState(1.15);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [isBlurry, setIsBlurry] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  const applyAdjustments = async (sourceUrl: string, b: number, c: number) => {
    setIsProcessing(true);
    const processedUrl = await processImageForAi(sourceUrl, { brightness: b, contrast: c });
    setPreview(processedUrl);
    onUpload?.(processedUrl);
    setIsProcessing(false);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (dataUrl) {
        setRawImage(dataUrl);
        
        // Detecção de foto borrada
        const blurScore = await calculateBlurriness(dataUrl);
        if (blurScore < 8) {
          setIsBlurry(true);
          toast.warning("Foto possivelmente borrada. Tente focar melhor para um diagnóstico mais preciso.");
        } else {
          setIsBlurry(false);
        }

        // Processamento inicial automático
        await applyAdjustments(dataUrl, brightness, contrast);
      }
      setIsProcessing(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-leaf transition-colors">
                  <Lightbulb className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] p-3 text-xs">
                <p className="font-semibold mb-1">Dicas para uma foto perfeita:</p>
                <ul className="space-y-1.5">
                  <li className="flex gap-2">
                    <Maximize className="h-3 w-3 shrink-0 text-leaf" />
                    <span><strong>Ângulo:</strong> Mostre a planta inteira ou o detalhe frontal.</span>
                  </li>
                  <li className="flex gap-2">
                    <Focus className="h-3 w-3 shrink-0 text-leaf" />
                    <span><strong>Foco:</strong> Evite tremer e espere a câmera focar na mancha.</span>
                  </li>
                  <li className="flex gap-2">
                    <Sparkles className="h-3 w-3 shrink-0 text-leaf" />
                    <span><strong>Luz:</strong> Prefira luz natural. Evite sombras fortes ou contra-luz.</span>
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
                  setRawImage(null);
                  setIsBlurry(false);
                }}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow z-10"
              >
                <X className="h-4 w-4" />
              </span>
              
              {/* Ajustes manuais */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdjustments(!showAdjustments);
                }}
                className={cn(
                  "absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow z-10 transition-colors",
                  showAdjustments && "text-leaf"
                )}
              >
                <Sliders className="h-4 w-4" />
              </button>

              {isBlurry && !showAdjustments && (
                <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-yellow-500/90 p-2 text-[10px] text-white backdrop-blur flex items-center gap-1.5 z-10">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>Foto borrada detectada</span>
                </div>
              )}

              {showAdjustments && (
                <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm p-4 flex flex-col justify-center gap-6 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span>Brilho</span>
                      <span>{Math.round(brightness * 100)}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      onValueChange={([val]) => {
                        setBrightness(val);
                        if (rawImage) applyAdjustments(rawImage, val, contrast);
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span>Contraste</span>
                      <span>{Math.round(contrast * 100)}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      onValueChange={([val]) => {
                        setContrast(val);
                        if (rawImage) applyAdjustments(rawImage, brightness, val);
                      }}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 h-8 text-xs" 
                    onClick={() => setShowAdjustments(false)}
                  >
                    Pronto
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-leaf" />
                  <span className="text-sm font-medium text-leaf">Processando...</span>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Toque para enviar uma foto</span>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-leaf/70">
                    <Sparkles className="h-3 w-3" />
                    Otimização automática ativada
                  </div>
                </>
              )}
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
