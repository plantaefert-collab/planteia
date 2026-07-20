import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  label: string;
  type: "select" | "radio" | "text";
  options?: { value: string; label: string }[];
}

const questionsBySymptom: Record<string, Question[]> = {
  folhas_amarelas: [
    { 
      id: "quando", 
      label: "Quando o problema começou?", 
      type: "select", 
      options: [
        { value: "dias", label: "Nos últimos dias" },
        { value: "semanas", label: "Há algumas semanas" },
        { value: "meses", label: "Há meses" }
      ] 
    },
    { 
      id: "onde", 
      label: "O amarelamento começou onde?", 
      type: "radio", 
      options: [
        { value: "antigas", label: "Folhas antigas (base)" },
        { value: "novas", label: "Folhas novas (topo)" }
      ] 
    },
    { 
      id: "substrato", 
      label: "O substrato está como?", 
      type: "select", 
      options: [
        { value: "seco", label: "Seco" },
        { value: "umido", label: "Úmido" },
        { value: "encharcado", label: "Encharcado" }
      ] 
    },
    { id: "obs", label: "Observações adicionais", type: "text" }
  ],
  default: [
    { 
      id: "quando", 
      label: "Quando começou?", 
      type: "select", 
      options: [
        { value: "dias", label: "Recentemente" },
        { value: "semanas", label: "Algum tempo" }
      ] 
    },
    { id: "obs", label: "Observações", type: "text" }
  ]
};

export function DynamicQuestionnaire({ symptom, answers, onChange }: { symptom: string; answers: any; onChange: (id: string, val: any) => void }) {
  const questions = questionsBySymptom[symptom] || questionsBySymptom.default;

  return (
    <div className="space-y-5">
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <Label className="text-sm font-medium">{q.label}</Label>
          
          {q.type === "select" && (
            <Select onValueChange={(v) => onChange(q.id, v)} value={answers[q.id]}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {q.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {q.type === "radio" && (
            <RadioGroup onValueChange={(v) => onChange(q.id, v)} value={answers[q.id]} className="flex flex-col gap-2">
              {q.options?.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2 rounded-xl border border-border p-3">
                  <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                  <Label htmlFor={`${q.id}-${opt.value}`} className="flex-1 cursor-pointer font-normal">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.type === "text" && (
            <Textarea 
              placeholder="Digite aqui..." 
              value={answers[q.id] || ""} 
              onChange={(e) => onChange(q.id, e.target.value)}
              className="min-h-[80px]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
