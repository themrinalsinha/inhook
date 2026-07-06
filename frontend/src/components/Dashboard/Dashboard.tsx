import { createContext, useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { NavBar } from "@/components/Dashboard/NavBar";
import { HookEndpoint } from "@/components/Dashboard/HookEndpoint";
import { cn } from "@/lib/utils";
import { RequestInfo } from "@/components/Dashboard/RequestInfo";
import type {
  IWebhookToken,
  IWebhookConfig,
  IWebhookEvent,
  ITunnelStatus,
} from "@/types/webhook";
import { createWebhookToken, getWebhookConfig, getTunnelStatus } from "@/api";

export const inHookContext = createContext({});

const WEBHOOK_STORAGE_KEY = "webhook_object";

const readStoredWebhookToken = () => {
  const tokenObject = localStorage.getItem(WEBHOOK_STORAGE_KEY);
  if (!tokenObject) {
    return undefined;
  }

  try {
    const parsedToken = JSON.parse(tokenObject) as Partial<IWebhookToken>;
    if (typeof parsedToken?.token !== "string" || parsedToken.token.trim() === "") {
      localStorage.removeItem(WEBHOOK_STORAGE_KEY);
      return undefined;
    }

    return {
      id: typeof parsedToken.id === "number" ? parsedToken.id : 0,
      token: parsedToken.token,
      created_at: parsedToken.created_at ?? new Date(),
    } as IWebhookToken;
  } catch {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    return undefined;
  }
};

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
  const [tunnelStatus, setTunnelStatus] = useState<ITunnelStatus | undefined>(
    undefined
  );

  useEffect(() => {
    document.title = "InHook - Dashboard";

    const storedToken = readStoredWebhookToken();
    if (storedToken) {
      setWebhookToken(storedToken);
      return;
    }

    createWebhookToken().then((token) => {
      setWebhookToken(token);
      localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(token));
    });
  }, []);

  useEffect(() => {
    getWebhookConfig().then((config) => {
      setWebhookConfig(config);
    });
    getTunnelStatus()
      .then(setTunnelStatus)
      .catch(() => {});
  }, []);

  return (
    <Container className="h-screen mx-auto bg-neutral-100 p-5">
      <inHookContext.Provider
        value={{
          webhookToken,
          setWebhookToken,
          webhookConfig,
          selectedEvent,
          setSelectedEvent,
          tunnelStatus,
          setTunnelStatus,
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
