import { Link } from 'react-router'
import { cn } from '../../libs/util';
import { ChevronRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <h1
        className={cn(
          "py-5 text-6xl font-semibold tracking-tight max-w-2xl text-center",
          "bg-clip-text text-transparent bg-gradient-to-b from-neutral-700 to-neutral-500"
        )}
      >
        Self-hosted webhook inspector and debugger
      </h1>
      <p className="text-[25px] tracking-normal font-light max-w-2xl text-center text-neutral-400 mt-2">
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
    </div>
  );
}
