import { useContext, useState } from "react";
import { cn } from "@/lib/utils";
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

import { refreshWebhookToken } from "@/api";
import { inHookContext } from "@/components/Dashboard/Dashboard";
import type { IWebhookToken, IWebhookConfig } from "@/types/webhook";

export const HookEndpoint = () => {
  const { webhookToken, setWebhookToken, webhookConfig, setSelectedEvent } = useContext(
    inHookContext
  ) as {
    webhookToken: IWebhookToken;
    setWebhookToken: (token: IWebhookToken) => void;
    webhookConfig: IWebhookConfig;
    setSelectedEvent: (event: any) => void;
  };
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const webhookUrl = `${
    webhookConfig?.host || import.meta.env.VITE_API_URL
  }/webhook/${webhookToken?.token}/`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const newToken = await refreshWebhookToken(webhookToken?.token);
      setTimeout(() => {
        setIsRefreshing(false);
        setWebhookToken(newToken);
        setSelectedEvent(null);
      }, 500);
      localStorage.setItem("webhook_object", JSON.stringify(newToken));
    } catch (err) {
      console.error("Failed to refresh token: ", err);
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
            onClick={handleRefreshToken}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCcw className="animate-spin" />
            ) : (
              <RefreshCcw />
            )}
            {isRefreshing ? "Refreshing Token" : "Refresh Token"}
          </Button>
        </div>
      </div>
    </div>
  );
};
