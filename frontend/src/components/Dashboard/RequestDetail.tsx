import { cn } from "@/libs/util";
import MethodBadge from "@/components/Utils/Methods";
import { RequestDetailBody } from "@/components/Dashboard/RequestDetailBody";
import moment from "moment";
import { Library } from "lucide-react";
import type { IWebhookEvent } from "@/types/webhook";

export const RequestDetail = ({
  className,
  selectedEvent,
}: {
  className?: string;
  selectedEvent: IWebhookEvent | null;
}) => {
  return (
    <div className={className}>
      <p className="text-md font-semibold text-neutral-700">Request Details</p>
      {selectedEvent && (
        <div
          className={cn(
            "bg-neutral-50/50 outline-1 outline-neutral-200 overscroll-contain",
            "rounded-lg mt-3 py-1"
          )}
        >
          <div className="rounded-lg p-2 h-[calc(100vh-262px)] px-3">
            <div className="flex justify-between">
              {MethodBadge[selectedEvent.method].badge}
              <p className="text-sm font-normal text-neutral-500">
                {moment(selectedEvent.created_at).format(
                  "MMMM Do YYYY, h:mm:ss a"
                )}{" "}
                ({moment(selectedEvent.created_at).fromNow()})
              </p>
            </div>
            <RequestDetailBody selectedEvent={selectedEvent} />
          </div>
        </div>
      )}
      {!selectedEvent && (
        <div className="flex flex-col justify-center items-center h-full">
          <Library className="size-8 text-neutral-500" />
          <p className="text-md font-normal text-neutral-500">
            No events found
          </p>
          <p className="text-sm font-normal text-neutral-500">
            Select an event to view request details, if available
          </p>
        </div>
      )}
    </div>
  );
};
