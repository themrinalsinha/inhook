import { cn } from "@/libs/util";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Label } from "../ui/label";
import {
  Copy,
  RefreshCcw,
  SquareArrowOutUpRight,
  Check,
  Link,
} from "lucide-react";
import { useState } from "react";

export const HookEndpoint = () => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://inhook.mrinal.xyz/webhook/your-webhook-id"; // Replace with actual URL

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
          {/* <InputGroupAddon align="inline-end">
            {copied ? (
              <Check className="text-green-500" />
            ) : (
              <Copy
                className={cn(
                  "text-neutral-500 hover:cursor-pointer hover:text-neutral-900",
                  "transition-colors duration-300"
                )}
                onClick={handleCopy}
              />
            )}
          </InputGroupAddon> */}
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
          >
            <RefreshCcw />
            Refresh Token
          </Button>
        </div>
      </div>
    </div>
  );
};
