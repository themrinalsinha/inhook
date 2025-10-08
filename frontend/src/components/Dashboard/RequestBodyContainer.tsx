import { cn } from "@/libs/util"

export const RequestBodyContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "bg-white outline-1 outline-neutral-200 overscroll-contain",
        "rounded-lg mt-2 py-[2px]"
      )}
    >
      <div
        className="p-2 rounded-lg bg-white h-[calc(100vh-400px)] overflow-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-neutral-200) var(--color-neutral-50/50)", // thumb color, track color
        }}
      >
        {children}
      </div>
    </div>
  )
}
