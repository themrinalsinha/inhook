import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RequestEventEmptyNode } from "@/components/Dashboard/RequestEventEmptyNode";
import { RequestEventNode } from "@/components/Dashboard/RequestEventNode";
import type { IWebhookEvent } from "@/types/webhook";
import { Archive } from "lucide-react";

export const SidePanel = ({
  className,
  webhookEvents,
  handleSelectEvent,
  selectedEvent,
  handleArchiveAllEvents,
}: {
  className?: string;
  webhookEvents: IWebhookEvent[];
  handleSelectEvent: (event: IWebhookEvent) => void;
  selectedEvent: IWebhookEvent | null;
  handleArchiveAllEvents: () => void;
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Recent Events</p>
        {webhookEvents.length === 0 ? (
          ""
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white bg-blue-thm">
              Total Events: <b className="font-bold">{webhookEvents.length}</b>
            </Badge>
            <Archive
              className={cn(
                "size-4 text-neutral-500 hover:cursor-pointer hover:text-red-500",
                "transition-colors duration-300"
              )}
              onClick={handleArchiveAllEvents}
            />
          </div>
        )}
      </div>
      <div
        className={cn(
          "bg-neutral-50/50 outline-1 outline-neutral-200 overscroll-contain",
          "rounded-lg mt-3 py-1"
        )}
      >
        <div
          className="rounded-lg p-2 h-[calc(100vh-262px)] overflow-y-auto flex flex-col gap-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "var(--color-neutral-200) var(--color-neutral-50/50)", // thumb color, track color
          }}
        >
          {webhookEvents.length === 0 ? (
            <RequestEventEmptyNode />
          ) : (
            webhookEvents.map((event) => (
              <RequestEventNode
                event={event}
                key={event.id}
                handleSelectEvent={handleSelectEvent}
                selectedEvent={selectedEvent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
