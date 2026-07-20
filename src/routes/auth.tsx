import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <div className="hidden md:block">
        <div className="relative h-full w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=1200&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-leaf/40" />
          <div className="absolute bottom-8 left-8 max-w-sm text-primary-foreground">
            <p className="font-display text-2xl leading-tight">
              "Cada planta tem um ritmo. A gente ajuda você a ouvi-lo."
            </p>
            <p className="mt-2 text-sm opacity-80">Plantae AI · PlantaeFert</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-leaf text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-semibold">Plantae AI</span>
        </Link>
        <div className="mx-auto mt-10 w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
