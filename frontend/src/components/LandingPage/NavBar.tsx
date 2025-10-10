import { Link } from "react-router";
import appLogo from "@/assets/inhook.png";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const navbarLinks = [
    {
      label: "About",
      href: "#",
    },
    {
      label: "Docs",
      href: "#",
    },
    {
      label: "Github",
      href: "https://github.com/themrinalsinha/inhook",
    },
  ];

  return (
    <div
      className={cn(
        "flex justify-between items-center bg-neutral-50 rounded-xl p-5",
        "ring-1 shadow-sm shadow-blue-200 ring-blue-100",
        "max-w-5xl mx-auto"
      )}
    >
      <div>
        <Link to="/">
          <img
            src={appLogo}
            alt="InHook - Webhook Inspector & Debugger"
            className="w-25"
          />
        </Link>
      </div>
      <div className="flex gap-5">
        {navbarLinks.map((link) => (
          <Link
            to={link.href}
            key={link.label}
            target="_blank"
            rel="noopener"
            className={cn(
              "text-md font-mono text-blue-thm hover:text-blue-800 transition-colors",
              "duration-300"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
