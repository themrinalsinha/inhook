import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import heroImage from "@/assets/splash.png";
// import { Circle } from "lucide-react";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <h1
        className={cn(
          "relative",
          "py-5 md:text-6xl text-4xl font-semibold tracking-tight max-w-2xl text-center",
          "bg-clip-text text-transparent bg-gradient-to-b from-neutral-700 to-neutral-500"
        )}
      >
        {/* <Circle
          className="absolute -top-2 right-0 size-10 animate-pulse stroke-blue-thm/20"
          strokeWidth={3}
        /> */}
        Self-hosted webhook inspector and debugger
      </h1>
      <p
        className={cn(
          "md:text-[25px] text-lg tracking-normal font-normal max-w-2xl text-center",
          "text-neutral-500 mt-2 leading-tight"
        )}
      >
        A single binary tool to capture, inspect and debug incoming webhooks in
        real time.
      </p>
      <p className="text-2xl font-bold text-center text-blue-thm mt-10">
        Free and open source
      </p>
      <Link
        to="/app"
        className={cn(
          "rounded-2xl mt-10 text-white",
          "bg-blue-thm/90 p-3 px-6 shadow-lg shadow-blue-thm/20",
          "hover:bg-blue-thm/100 hover:cursor-pointer transition-colors duration-300"
        )}
      >
        <div className="flex items-center">
          <span>Get Started</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </div>
      </Link>
      <div className="relative mt-10 max-w-5xl mx-auto p-2">
        {/* <Circle
          className="absolute -top-35 -left-15 size-20 animate-pulse stroke-blue-thm/20"
          strokeWidth={2}
        /> */}
        <img
          src={heroImage}
          alt="InHook - Webhook Inspector & Debugger"
          className={cn(
            "shadow-sm rounded-lg mb-10 mx-auto w-full outline-1 mask-b-from-75% mask-b-to-95%"
          )}
          loading="eager"
        />
      </div>
    </div>
  );
};
