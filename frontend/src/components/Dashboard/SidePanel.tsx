import { cn } from "@/libs/util";
import { Badge } from "../ui/badge";
import { RequestEventEmptyNode } from "./RequestEventEmptyNode";
import { RequestEventNode } from "./RequestEventNode";

export const SidePanel = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Request Info</p>
        <Badge variant="outline" className="text-white bg-blue-thm">Events</Badge>
      </div>
      <div className={cn(
        "bg-neutral-50/50 outline-1 outline-neutral-200 overscroll-contain",
        "rounded-lg mt-3 py-1"
      )}>
        <div
          className=" rounded-lg p-2 h-[calc(100vh-262px)] overflow-y-auto flex flex-col gap-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "var(--color-neutral-200) var(--color-neutral-50/50)", // thumb color, track color
          }}
        >
          {/* <RequestEventEmptyNode /> */}
          <RequestEventNode />
          <RequestEventNode />
          <RequestEventNode />
          <RequestEventNode />
          <RequestEventNode />
          <RequestEventNode />
        </div>
      </div>
    </div>
  );
};
