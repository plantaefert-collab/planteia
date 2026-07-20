import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Camera, Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const options: Option[] = [
  { id: "identificar", title: "Identificar um problema", description: "Folhas amareladas, manchas, pragas...", icon: <Search className="h-5 w-5" /> },
  { id: "avaliacao", title: "Fazer avaliação completa", description: "Revisão de rega, luz e substrato", icon: <FileText className="h-5 w-5" /> },
  { id: "acompanhamento", title: "Acompanhar diagnóstico anterior", description: "Verifique a evolução do plano", icon: <Camera className="h-5 w-5" /> },
];

export function DiagnosisIntentSelector({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20"
        >
          <div className="rounded-xl bg-leaf-soft p-2.5 text-leaf">
            {opt.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{opt.title}</h3>
            <p className="text-xs text-muted-foreground">{opt.description}</p>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
