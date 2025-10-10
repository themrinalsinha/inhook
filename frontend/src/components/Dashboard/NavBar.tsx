import { cn } from "@/lib/utils";
import appLogo from "@/assets/inhook.png";
import { GitPullRequest } from "lucide-react";
import { Link } from "react-router";

export const NavBar = () => {
  return (
    <div
      className={cn(
        "flex justify-between items-center max-w-7xl mx-auto",
        "p-4 bg-white border-1 border-neutral-200 border-b-0 rounded-t-lg"
      )}
    >
      <Link to="/app">
        <img src={appLogo} alt="InHook" className="w-25" />
      </Link>
      <Link
        to={`https://github.com/themrinalsinha/inhook/tree/${
          import.meta.env.VITE_BUILD_COMMIT_HASH
        }`}
        target="_blank"
        rel="noopener"
        className={cn(
          "flex items-center gap-1 text-sm text-neutral-500",
          "hover:cursor-pointer hover:text-blue-thm transition-colors duration-300"
        )}
      >
        <GitPullRequest className="size-4.5" />
        {import.meta.env.VITE_APP_VERSION}
      </Link>
    </div>
  );
};
