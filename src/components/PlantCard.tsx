import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Droplets, Stethoscope } from "lucide-react";
import type { Plant } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function PlantCard({ plant }: { plant: Plant }) {
  const navigate = useNavigate();

  return (
    <Link
      to="/app/plantas/$id"
      params={{ id: plant.id }}
      aria-label={`Abrir ficha de ${plant.nickname}`}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm outline-none transition hover:shadow-md hover:border-leaf/40 focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={plant.photo}
          alt={plant.nickname}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={plant.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {plant.nickname}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {plant.species}
            </p>
          </div>
          <ChevronRight
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-leaf"
          />
        </div>

        {plant.nextCare && (
          <div className="mt-3 flex items-center gap-2 text-sm text-leaf">
            <Droplets className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {plant.nextCare.label} · {plant.nextCare.whenLabel}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({
                to: "/app/diagnostico",
                search: { plantId: plant.id },
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-leaf hover:text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
            aria-label={`Diagnosticar ${plant.nickname}`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Diagnosticar
          </button>
          <span className="text-xs text-muted-foreground">
            Toque no card para ver a ficha
          </span>
        </div>
      </div>
    </Link>
  );
}
