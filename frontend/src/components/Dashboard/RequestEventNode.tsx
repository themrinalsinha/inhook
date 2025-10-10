import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import MethodBadge from "@/components/Utils/Methods";
import type { IWebhookEvent } from "@/types/webhook";
import moment from "moment";

export const RequestEventNode = ({
  event, handleSelectEvent,
}: {
  event: IWebhookEvent;
  handleSelectEvent: (event: IWebhookEvent) => void;
}) => {
  const { bgColor, textColor, icon: Icon } = MethodBadge[event.method];
  return (
    <div onClick={() => handleSelectEvent(event)}>
      <div
        className={cn(
          "flex flex-col justify-between h-12 px-1 border-1 border-neutral-200 rounded-sm",
          bgColor,
          "hover:border-neutral-700 hover:border-1 hover:cursor-pointer",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-baseline justify-between">
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-bold",
              textColor
            )}
          >
            <Icon className="size-3" />
            {event.method}
          </div>
          <div className="text-xs text-neutral-500">
            {moment(event.created_at).fromNow()}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="tracking-wider text-xs text-neutral-500 ml-4 mb-2">
            {event.request_id.slice(0, 8)}
          </div>
          <ChevronRight className="size-4 hover:cursor-pointer text-neutral-500" />
        </div>
      </div>
    </div>
  );
};
