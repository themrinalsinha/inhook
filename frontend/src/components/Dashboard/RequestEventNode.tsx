import { cn } from "@/libs/util";
import { ChevronRight, Plus, Trash, Circle } from "lucide-react";



export const RequestEventNode = () => {
  return (
    <div>
      <div
        className={cn(
          "flex flex-col justify-between px-1 border-1 border-neutral-200 rounded-sm",
          "bg-orange-50 h-12 hover:border-blue-thm hover:border-1 hover:cursor-pointer",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1 font-bold text-orange-500">
            <Plus className="size-4" />
            POST
          </div>
          <div className="text-xs text-neutral-500">TIMESTAMP</div>
        </div>
        <div className="flex justify-between">
          <div className="tracking-wider text-sm text-neutral-500 ml-5 mb-2">
            {Math.random().toString(36).substring(2, 16).toUpperCase()}
          </div>
          <ChevronRight className="size-4 hover:cursor-pointer text-blue-thm/50" />
        </div>
      </div>
    </div>
  );
};
