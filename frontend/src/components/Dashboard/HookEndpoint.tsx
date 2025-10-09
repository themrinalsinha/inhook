import { cn } from "@/libs/util";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Copy,
  RefreshCcw,
  SquareArrowOutUpRight,
  Check,
  Link,
} from "lucide-react";
import { useEffect, useState } from "react";

import { createWebhookToken, refreshWebhookToken } from "@/api";

interface IWebhookToken {
  id: number;
  token: string;
  created_at: Date;
}

export const HookEndpoint = () => {
  const [webhookToken, setWebhookToken] = useState<IWebhookToken | undefined>(
    undefined
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const tokenObject = localStorage.getItem("webhook_object");
    if (tokenObject) {
      setWebhookToken(JSON.parse(tokenObject));
    } else {
      createWebhookToken().then((token) => {
        setWebhookToken(token);
        localStorage.setItem("webhook_object", JSON.stringify(token));
      });
    }
  }, [localStorage.getItem("webhook_object")]);

  const handleRefreshToken = async () => {
    const newToken = await refreshWebhookToken(webhookToken?.token);
    setWebhookToken(newToken);
    localStorage.setItem("webhook_object", JSON.stringify(newToken));
  };

  const [copied, setCopied] = useState(false);
  const webhookUrl = `${import.meta.env.VITE_API_URL}/webhook/${webhookToken?.token}/`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex flex-col p-4 pb-6 gap-1 ">
      <Label
        htmlFor="webhook_url"
        className="text-md font-semibold text-neutral-700"
      >
        Incoming Webhook
      </Label>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <InputGroup className="bg-neutral-50 shadow-none">
          <InputGroupAddon align="inline-start">
            <Link />
            Your Unique URL
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="hover:cursor-pointer hover:text-blue-thm"
            onClick={() =>
              window.open(webhookUrl, "_blank", "noopener,noreferrer")
            }
          >
            <SquareArrowOutUpRight className="size-4 text-blue-thm" />
            <span className="lg:block hidden">Open in new tab</span>
          </InputGroupAddon>
          <InputGroupInput
            disabled
            type="text"
            id="webhook_url"
            name="webhook_url"
            value={webhookUrl}
            className="tracking-wider truncate"
            placeholder="Webhook URL"
          />
        </InputGroup>

        <div className="flex md:flex-row items-center gap-2 text-neutral-700">
          <Button
            className="hover:cursor-pointer"
            variant={"outline"}
            onClick={handleCopy}
          >
            {copied ? <Check className="text-green-500" /> : <Copy />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant={"outline"}
            className={cn(
              "bg-blue-thm/90 text-white shadow-none",
              "hover:bg-blue-thm hover:text-white hover:cursor-pointer",
              "transition-colors duration-300"
            )}
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await handleRefreshToken();
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={cn(
                isRefreshing && "transition-transform duration-300 animate-spin"
              )}
            />
            {isRefreshing ? "Refreshing" : "Refresh Token"}
          </Button>
        </div>
      </div>
    </div>
  );
};
