import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

export function AIMessage({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai";
  return (
    <div className={cn("flex gap-2", isAi ? "justify-start" : "justify-end")}>
      {isAi && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf">
          <Leaf className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isAi
            ? "rounded-tl-sm bg-card text-foreground border border-border"
            : "rounded-tr-sm bg-primary text-primary-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
