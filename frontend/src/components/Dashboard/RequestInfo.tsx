import { useContext, useEffect } from "react";
import { SidePanel } from "@/components/Dashboard/SidePanel";
import { RequestDetail } from "@/components/Dashboard/RequestDetail";
import { archiveAllWebhookEventsByTokenID } from "@/api";
import { useWebhookEvents } from "@/hooks/useWebhookEvents";
import { inHookContext } from "@/components/Dashboard/Dashboard";
import type { IWebhookToken, IWebhookEvent } from "@/types/webhook";

export const RequestInfo = () => {
  const { webhookToken, selectedEvent, setSelectedEvent } = useContext(inHookContext) as {
    webhookToken: IWebhookToken;
    selectedEvent: IWebhookEvent | null;
    setSelectedEvent: (event: IWebhookEvent | null) => void;
  };

  const { webhookEvents, setWebhookEvents } = useWebhookEvents(webhookToken?.token);

  // Clear the selection when its event leaves the list — covers archives and
  // token deletions made from other tabs or by other viewers of a shared token.
  useEffect(() => {
    if (selectedEvent && !webhookEvents.some((event) => event.id === selectedEvent.id)) {
      setSelectedEvent(null);
    }
  }, [webhookEvents, selectedEvent, setSelectedEvent]);

  const handleSelectEvent = (event: IWebhookEvent) => {
    setSelectedEvent(event);
  };

  const handleArchiveAllEvents = () => {
    if (!webhookToken?.id) {
      return;
    }

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
        canArchiveAllEvents={Boolean(webhookToken?.id)}
        handleSelectEvent={handleSelectEvent}
        selectedEvent={selectedEvent}
        handleArchiveAllEvents={handleArchiveAllEvents}
      />
      <RequestDetail className="w-3/4 px-4" selectedEvent={selectedEvent} />
    </div>
  );
};
