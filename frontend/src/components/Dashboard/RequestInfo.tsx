import { useContext, useState } from "react";
import { SidePanel } from "@/components/Dashboard/SidePanel";
import { RequestDetail } from "@/components/Dashboard/RequestDetail";
import { getWebhookEvents } from "@/api";
import { useEffect } from "react";
import { inHookContext } from "@/components/Dashboard/Dashboard";
import type { IWebhookToken, IWebhookEvent } from "@/types/webhook";

export const RequestInfo = () => {
  const { webhookToken } = useContext(inHookContext) as {
    webhookToken: IWebhookToken;
  };

  const [webhookEvents, setWebhookEvents] = useState<IWebhookEvent[]>([]);

  useEffect(() => {
    if (!webhookToken?.token) return;

    // Initial fetch
    getWebhookEvents(webhookToken.token).then((events) => {
      setWebhookEvents(events);
    });

    // Polling interval
    const interval = setInterval(() => {
      getWebhookEvents(webhookToken.token).then((events) => {
        setWebhookEvents(events);
      });
    }, 2000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, [webhookToken?.token]);

  const [selectedEvent, setSelectedEvent] = useState<IWebhookEvent | null>(
    null
  );
  const handleSelectEvent = (event: IWebhookEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex">
      <SidePanel
        className="w-1/4 px-4 pr-0"
        webhookEvents={webhookEvents}
        handleSelectEvent={handleSelectEvent}
        selectedEvent={selectedEvent}
      />
      <RequestDetail className="w-3/4 px-4" selectedEvent={selectedEvent} />
    </div>
  );
};
