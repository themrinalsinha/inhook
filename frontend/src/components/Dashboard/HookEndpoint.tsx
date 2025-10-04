import { cn } from "@/libs/util";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { Copy, RefreshCcw, Webhook, Check } from "lucide-react";
import { useState } from "react";

export const HookEndpoint = () => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://inhook.mrinal.dev/webhook/your-webhook-id"; // Replace with actual URL

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-2 bg-white rounded-lg outline-1 outline-neutral-200">
      <Label htmlFor="webhook_url" className="text-sm font-semibold text-neutral-700">
        Your Webhook Endpoint
      </Label>
      <div className="flex items-center gap-2">
        <InputGroup className="bg-neutral-50 shadow-none">
          <InputGroupAddon align="inline-start">
            <Webhook />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
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
          </InputGroupAddon>
          <InputGroupInput
            disabled
            type="text"
            id="webhook_url"
            name="webhook_url"
            value={webhookUrl}
            placeholder="Webhook URL"
          />
        </InputGroup>

        {/* <Button variant={"outline"} onClick={handleCopy}>
          {copied ? <Check className="text-green-500" /> : <Copy />}
          {copied ? "Copied!" : "Copy"}
        </Button> */}
        <Button variant={"outline"} className="text-neutral-700 shadow-none">
          <RefreshCcw />
          Refresh Token
        </Button>
      </div>
      <p className="flex items-center text-[12px] text-neutral-400">
        Send POST, GET, or any HTTP requests to this endpoint
      </p>
    </div>
  );
}
