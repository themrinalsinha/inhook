import { cn } from "@/libs/util";
import { Badge } from "../ui/badge";
// import { RequestEventEmptyNode } from "./RequestEventEmptyNode";
import { RequestEventNode } from "./RequestEventNode";

export const SidePanel = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Recent Events</p>
        {/* TODO: Don't show badge if there are no events */}
        <Badge variant="outline" className="text-white bg-blue-thm">
          Total Events - 100
        </Badge>
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
          {/* <RequestEventEmptyNode /> */}
          <RequestEventNode
            method="GET"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="POST"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="PUT"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="PATCH"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="DELETE"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="HEAD"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="OPTIONS"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="CONNECT"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
          <RequestEventNode
            method="TRACE"
            eventId="01HXQ2YQK7J8"
            timestamp="2025-01-01 12:00:00"
          />
        </div>
      </div>
    </div>
  );
};
