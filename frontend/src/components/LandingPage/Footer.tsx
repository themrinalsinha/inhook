export const Footer = ({ version }: { version?: string }) => {
  return (
    <div className="absolute bottom-0 w-full border-t border-t-neutral-200">
      <div className="flex justify-between items-center pb-8 m-4">
        <div>
          <p className="text-neutral-500 text-sm">
            © 2025 InHook /{" "}
            <a
              href="https://themrinalsinha.com"
              target="_blank"
              rel="noopener"
              className="text-blue-500 hover:text-blue-600 hover:cursor-pointer"
            >
              {" "}
              Mrinal Sinha
            </a>{" "}
          </p>
          <a
            className="text-neutral-500 hover:text-blue-500 text-xs absolute"
            target="_blank"
            rel="noopener"
            href="https://github.com/themrinalsinha/inhook/commits/main/"
          >
            {version ? `Version ${version}` : "Version 0.0.1 (development)"}
          </a>
        </div>

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
  );
}
