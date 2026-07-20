import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import type { Plant } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      to="/app/plantas/$id"
      params={{ id: plant.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
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
        <h3 className="truncate text-base font-semibold text-foreground">
          {plant.nickname}
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {plant.species}
        </p>
        {plant.nextCare && (
          <div className="mt-3 flex items-center gap-2 text-sm text-leaf">
            <Droplets className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {plant.nextCare.label} · {plant.nextCare.whenLabel}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
