import { Badge } from "../ui/badge";

export const SidePanel = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-700">Request Info</p>
        <Badge variant="outline">Events</Badge>
      </div>
      <div className="outline-1 outline-neutral-100 overscroll-contain rounded-lg">
        <div className="bg-neutral-50/50 rounded-lg mt-2 p-2 h-[calc(100vh-250px)] border-1 border-neutral-100 overflow-y-auto">
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
