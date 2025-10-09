import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Circle, Pencil } from "lucide-react";

const MethodBadge: Record<
  string,
  {
    badge: React.ReactNode;
    bgColor: string;
    textColor: string;
    icon: React.ElementType;
  }
> = {
  GET: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-green-500"
      >
        GET
      </Badge>
    ),
    bgColor: "bg-green-50",
    textColor: "text-green-500",
    icon: Circle,
  },
  POST: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-orange-500"
      >
        POST
      </Badge>
    ),
    bgColor: "bg-orange-50",
    textColor: "text-orange-500",
    icon: Plus,
  },
  PUT: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-blue-500"
      >
        PUT
      </Badge>
    ),
    bgColor: "bg-blue-50",
    textColor: "text-blue-500",
    icon: Pencil,
  },
  PATCH: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-yellow-500"
      >
        PATCH
      </Badge>
    ),
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-500",
    icon: Pencil,
  },
  DELETE: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-red-500"
      >
        DELETE
      </Badge>
    ),
    bgColor: "bg-red-50",
    textColor: "text-red-500",
    icon: Trash,
  },
  HEAD: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-purple-500"
      >
        HEAD
      </Badge>
    ),
    bgColor: "bg-purple-50",
    textColor: "text-purple-500",
    icon: Circle,
  },
  OPTIONS: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-pink-500"
      >
        OPTIONS
      </Badge>
    ),
    bgColor: "bg-pink-50",
    textColor: "text-pink-500",
    icon: Circle,
  },
  CONNECT: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-teal-500"
      >
        CONNECT
      </Badge>
    ),
    bgColor: "bg-teal-50",
    textColor: "text-teal-500",
    icon: Circle,
  },
  TRACE: {
    badge: (
      <Badge
        variant={"default"}
        className="text-sm text-white font-semibold bg-gray-500"
      >
        TRACE
      </Badge>
    ),
    bgColor: "bg-gray-50",
    textColor: "text-gray-500",
    icon: Circle,
  },
};

export default MethodBadge;
