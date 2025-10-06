import { LoaderCircle } from "lucide-react";

export const RequestEventEmptyNode = () => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center h-full text-neutral-400">
      <LoaderCircle className="size-6 animate-spin" strokeWidth={2} />
      <div className="font-semibold">Waiting for Events</div>
      <p className="text-sm px-4 text-center leading-4">
        Send POST, GET, or any HTTP requests to the above endpoint.
      </p>
    </div>
  );
};
