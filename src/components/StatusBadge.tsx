import { cn } from "@/lib/utils";
import type { PlantStatus } from "@/lib/types";

const map: Record<PlantStatus, { label: string; className: string }> = {
  saudavel: {
    label: "Saudável",
    className: "bg-success-soft text-success border border-success/20",
  },
  atencao: {
    label: "Atenção",
    className: "bg-warning-soft text-warning border border-warning/20",
  },
  acompanhamento: {
    label: "Acompanhar",
    className: "bg-leaf-soft text-leaf border border-leaf/20",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: PlantStatus;
  className?: string;
}) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        s.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
