import { cn } from "@/libs/util";
import MethodBadge from "@/components/Utils/Methods";
import { RequestDetailBody } from "@/components/Dashboard/RequestDetailBody";

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
              {MethodBadge.GET.badge}
              <p className="text-sm font-normal text-neutral-500">
                2025-01-01 12:00:00 (a day ago)
              </p>
            </div>
            <RequestDetailBody />
          </div>
        </div>
      </div>
    </div>
  );
}
