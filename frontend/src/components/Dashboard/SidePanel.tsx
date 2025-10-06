import { Badge } from "../ui/badge";

export const SidePanel = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Request Info</p>
        <Badge variant="outline">Events</Badge>
      </div>
      <div className="bg-neutral-50/50 outline-1 outline-neutral-200 overscroll-contain rounded-lg mt-3 py-1">
        <div
          className=" rounded-lg p-2 h-[calc(100vh-262px)] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "var(--color-neutral-200) var(--color-neutral-50/50)", // thumb color, track color
          }}
        >
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
          <div className="border-1 border-neutral-200 rounded-sm mt-2 h-10"></div>
        </div>
      </div>
    </div>
  );
};
