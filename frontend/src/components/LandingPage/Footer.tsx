export const Footer = ({ version }: { version?: string }) => {
  return (
    <div className="mx-4 mt-10 fixed bottom-0 min-w-6xl">
      <div className="flex justify-between items-center py-4 border-t border-t-gray-200">
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
            className="text-neutral-500 hover:text-blue-500 text-sm"
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
