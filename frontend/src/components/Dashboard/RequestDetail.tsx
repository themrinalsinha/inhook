import { cn } from "@/libs/util";
import MethodBadge from "@/components/Utils/Methods";
import { RequestDetailBody } from "@/components/Dashboard/RequestDetailBody";
import moment from "moment";
import type { IWebhookEvent } from "@/types/webhook";

export const RequestDetail = ({
  className,
  selectedEvent,
}: {
  className?: string;
  selectedEvent: IWebhookEvent | null;
}) => {
  console.log("SELECTED EVENT ---->>> ", selectedEvent);
  return (
    <div className={className}>
      <div>
        <p className="text-md font-semibold text-neutral-700">
          Request Details - {selectedEvent?.request_id.slice(0, 8)}
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
                {moment("2025-10-01 12:00:00", "YYYY-MM-DD HH:mm:ss").format(
                  "MMMM Do YYYY, h:mm:ss a"
                )}{" "}
                (
                {moment("2025-10-01 12:00:00", "YYYY-MM-DD HH:mm:ss").fromNow()}
                )
              </p>
            </div>
            <RequestDetailBody />
          </div>
        </div>
      </div>
    </div>
  );
};
