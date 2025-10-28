import { createContext, useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { NavBar } from "@/components/Dashboard/NavBar";
import { HookEndpoint } from "@/components/Dashboard/HookEndpoint";
import { cn } from "@/lib/utils";
import { RequestInfo } from "@/components/Dashboard/RequestInfo";
import type { IWebhookToken, IWebhookConfig, IWebhookEvent } from "@/types/webhook";
import { createWebhookToken, getWebhookConfig } from "@/api";

export const inHookContext = createContext({});

export const Dashboard = () => {
  const [webhookToken, setWebhookToken] = useState<IWebhookToken | undefined>(
    undefined
  );
  const [webhookConfig, setWebhookConfig] = useState<IWebhookConfig | undefined>(
    undefined
  );
  const [selectedEvent, setSelectedEvent] = useState<IWebhookEvent | null>(
    null
  );

  useEffect(() => {
    document.title = "InHook - Dashboard";

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

  useEffect(() => {
    getWebhookConfig().then((config) => {
      setWebhookConfig(config);
    });
  }, [webhookConfig?.host]);

  return (
    <Container className="h-screen mx-auto bg-neutral-100 p-5">
      <inHookContext.Provider
        value={{
          webhookToken,
          setWebhookToken,
          webhookConfig,
          selectedEvent,
          setSelectedEvent,
        }}
      >
        <NavBar />
        <Container
          className={cn(
            "max-w-7xl mx-auto bg-white min-h-[calc(100vh-6rem)]",
            "border-1 border-neutral-200 rounded-b-lg"
          )}
        >
          <HookEndpoint />
          <RequestInfo />
        </Container>
      </inHookContext.Provider>
    </Container>
  );
};
