import { useContext, useState } from "react";
import { SidePanel } from "@/components/Dashboard/SidePanel";
import { RequestDetail } from "@/components/Dashboard/RequestDetail";
import { getWebhookEvents, archiveAllWebhookEventsByTokenID } from "@/api";
import { useEffect } from "react";
import { inHookContext } from "@/components/Dashboard/Dashboard";
import type { IWebhookToken, IWebhookEvent } from "@/types/webhook";

export const RequestInfo = () => {
  const { webhookToken, selectedEvent, setSelectedEvent } = useContext(inHookContext) as {
    webhookToken: IWebhookToken;
    selectedEvent: IWebhookEvent | null;
    setSelectedEvent: (event: IWebhookEvent | null) => void;
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

  const handleSelectEvent = (event: IWebhookEvent) => {
    setSelectedEvent(event);
  };

  const handleArchiveAllEvents = () => {
    archiveAllWebhookEventsByTokenID(webhookToken.id).then(() => {
      setWebhookEvents([]);
      setSelectedEvent(null);
    });
  };

  return (
    <div className="flex">
      <SidePanel
        className="w-1/4 px-4 pr-0"
        webhookEvents={webhookEvents}
        handleSelectEvent={handleSelectEvent}
        selectedEvent={selectedEvent}
        handleArchiveAllEvents={handleArchiveAllEvents}
      />
      <RequestDetail className="w-3/4 px-4" selectedEvent={selectedEvent} />
    </div>
  );
};
