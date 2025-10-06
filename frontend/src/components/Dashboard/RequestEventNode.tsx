import { cn } from "@/libs/util";
import { ChevronRight, Plus, Trash, Circle, Pencil } from "lucide-react";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

const requestMethods: Record<RequestMethod, { color: string; icon: React.ElementType }> = {
  GET: {
    color: "green",
    icon: Circle,
  },
  POST: {
    color: "orange",
    icon: Plus,
  },
  PATCH: {
    color: "yellow",
    icon: Pencil,
  },
  DELETE: {
    color: "red",
    icon: Trash,
  },
  PUT: {
    color: "blue",
    icon: Pencil,
  },
};

export const RequestEventNode = ({ method }: { method: RequestMethod }) => {
  const { color, icon: Icon } = requestMethods[method];

  return (
    <div>
      <div
        className={cn(
          "flex flex-col justify-between h-12 px-1 border-1 border-neutral-200 rounded-sm",
          `bg-${color}-50 hover:border-neutral-700 hover:border-1 hover:cursor-pointer`,
          "transition-all duration-300"
        )}
      >
        <div className="flex items-baseline justify-between">
          <div className={`flex items-center gap-1 text-sm font-bold text-${color}-500`}>
            <Icon className="size-3" />
            {method}
          </div>
          <div className="text-xs text-neutral-500">TIMESTAMP</div>
        </div>
        <div className="flex justify-between">
          <div className="tracking-wider text-xs text-neutral-500 ml-4 mb-2">
            {Math.random().toString(36).substring(2, 16).toUpperCase()}
          </div>
          <ChevronRight className="size-4 hover:cursor-pointer text-blue-thm/50" />
        </div>
      </div>
    </div>
  );
};
