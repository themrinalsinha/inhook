import { cn } from "@/libs/util";
import { Badge } from "../ui/badge";
import { RequestEventEmptyNode } from "./RequestEventEmptyNode";
import { RequestEventNode } from "./RequestEventNode";
import type { IWebhookEvent } from "@/types/webhook";
import moment from "moment";

export const SidePanel = ({
  className,
  webhookEvents,
  handleSelectEvent,
}: {
  className?: string;
  webhookEvents: IWebhookEvent[];
  handleSelectEvent: (event: IWebhookEvent) => void;
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Recent Events</p>
        {webhookEvents.length === 0 ? (
          ""
        ) : (
          <Badge variant="outline" className="text-white bg-blue-thm">
            Total Events - {webhookEvents.length}
          </Badge>
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
                key={event.id}
                method={event.method}
                eventId={event.request_id.slice(0, 8)}
                timestamp={moment(event.created_at).fromNow()}
                handleSelectEvent={handleSelectEvent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
