import { cn } from "../../libs/util";

export const Footer = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full">
      <div className="max-w-4xl mx-auto p-2">
        <div className={cn(
          "flex justify-between items-center bg-white rounded-xl p-4",
          "ring-1 ring-blue-100"
        )}>
          <div>
            <p className="text-neutral-500 text-sm">
              © 2025 InHook /{" "}
              <a
                href="https://themrinalsinha.com"
                target="_blank"
                rel="noopener"
                className="text-blue-500 hover:text-blue-600 hover:cursor-pointer"
              >
                Mrinal Sinha
              </a>
            </p>
          </div>
          <div>
            <a
              className="text-blue-500 hover:text-blue-600 text-sm"
              target="_blank"
              rel="noopener"
              href="https://buymeacoffee.com/themrinalsinha"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
