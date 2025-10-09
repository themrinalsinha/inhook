import { createContext, useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { NavBar } from "@/components/Dashboard/NavBar";
import { HookEndpoint } from "@/components/Dashboard/HookEndpoint";
import { cn } from "@/libs/util";
import { RequestInfo } from "@/components/Dashboard/RequestInfo";
import type { IWebhookToken } from "@/types/webhook";
import { createWebhookToken } from "@/api";

export const inHookContext = createContext({});

export const Dashboard = () => {
  const [webhookToken, setWebhookToken] = useState<IWebhookToken | undefined>(
    undefined
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

  return (
    <Container className="h-screen mx-auto bg-neutral-100 p-5">
      <inHookContext.Provider
        value={{
          webhookToken,
          setWebhookToken,
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
