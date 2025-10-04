import { cn } from "@/libs/util";
import appLogo from "../../assets/inhook.png";
import { GitPullRequest } from "lucide-react";
import { Link } from "react-router";

export const NavBar = ({ version }: { version?: string }) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center max-w-7xl mx-auto",
        "p-4 bg-white outline-1 outline-neutral-200 rounded-t-lg"
      )}
    >
      <Link to="/app">
        <img src={appLogo} alt="InHook" className="w-25" />
      </Link>
      <Link
        to="https://github.com/themrinalsinha/inhook"
        target="_blank"
        rel="noopener"
        className={cn(
          "flex items-center gap-1 text-sm text-neutral-500",
          "hover:cursor-pointer hover:text-blue-thm transition-colors duration-300"
        )}
      >
        <GitPullRequest className="size-4.5" />
        Version {version ? version : "0.1.0 (development)"}
      </Link>
    </div>
  );
};
