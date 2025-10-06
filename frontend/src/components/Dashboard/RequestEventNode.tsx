import { cn } from "@/libs/util";
import { ChevronRight, Plus, Trash, Circle, Pencil } from "lucide-react";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";

const requestMethods: Record<RequestMethod, {
  bgColor: string;
  textColor: string;
  icon: React.ElementType
}> = {
  GET: {
    bgColor: "bg-green-50",
    textColor: "text-green-500",
    icon: Circle,
  },
  POST: {
    bgColor: "bg-orange-50",
    textColor: "text-orange-500",
    icon: Plus,
  },
  PATCH: {
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-500",
    icon: Pencil,
  },
  DELETE: {
    bgColor: "bg-red-50",
    textColor: "text-red-500",
    icon: Trash,
  },
  PUT: {
    bgColor: "bg-blue-50",
    textColor: "text-blue-500",
    icon: Pencil,
  },
  HEAD: {
    bgColor: "bg-purple-50",
    textColor: "text-purple-500",
    icon: Circle,
  },
  OPTIONS: {
    bgColor: "bg-pink-50",
    textColor: "text-pink-500",
    icon: Circle,
  },
  CONNECT: {
    bgColor: "bg-teal-50",
    textColor: "text-teal-500",
    icon: Circle,
  },
  TRACE: {
    bgColor: "bg-gray-50",
    textColor: "text-gray-500",
    icon: Circle,
  },
};

export const RequestEventNode = ({ method }: { method: RequestMethod }) => {
  const { bgColor, textColor, icon: Icon } = requestMethods[method];

  return (
    <div>
      <div
        className={cn(
          "flex flex-col justify-between h-12 px-1 border-1 border-neutral-200 rounded-sm",
          bgColor,
          "hover:border-neutral-700 hover:border-1 hover:cursor-pointer",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-baseline justify-between">
          <div className={cn("flex items-center gap-1 text-sm font-bold", textColor)}>
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
