import { cn } from "@/libs/util";
import { Badge } from "../ui/badge";

export const RequestDetail = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div>
        <p className="text-md font-semibold text-neutral-700">
          Request Details
        </p>
        <div
          className={cn(
            "bg-neutral-50/50 outline-1 outline-neutral-200 overscroll-contain",
            "rounded-lg mt-3 py-1"
          )}
        >
          <div className="rounded-lg p-2 h-[calc(100vh-262px)] px-3">
            <div className="flex justify-between">
              <Badge
                variant={"default"}
                className="text-md text-white font-semibold bg-green-500"
              >
                GET
              </Badge>
              <p className="text-md font-medium text-neutral-700">
                2025-01-01 12:00:00 (a day ago)
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
