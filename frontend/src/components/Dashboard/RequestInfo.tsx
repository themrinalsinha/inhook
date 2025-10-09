import { useContext, useState } from 'react';
import { SidePanel } from '@/components/Dashboard/SidePanel'
import { RequestDetail } from '@/components/Dashboard/RequestDetail'
import { getWebhookEvents } from '@/api';
import { useEffect } from 'react';
import { inHookContext } from '@/components/Dashboard/Dashboard';
import type { IWebhookToken, IWebhookEvent } from '@/types/webhook';

export const RequestInfo = () => {
  const { webhookToken } = useContext(inHookContext) as {
    webhookToken: IWebhookToken;
  };

  const [webhookEvents, setWebhookEvents] = useState<IWebhookEvent[]>([]);

  useEffect(() => {
    getWebhookEvents(webhookToken?.token).then((events) => {
      setWebhookEvents(events);
      console.log("FETCHING EVENTS ---->>> ", events)
      console.log("WEBHOOK TOKEN ---->>> ", webhookToken?.token)
    });
  }, [webhookToken?.token]);

  const [selectedEvent, setSelectedEvent] = useState<IWebhookEvent | null>(null);
  const handleSelectEvent = (event: IWebhookEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex">
      <SidePanel className="w-1/4 px-4 pr-0" webhookEvents={webhookEvents} handleSelectEvent={handleSelectEvent}/>
      <RequestDetail className="w-3/4 px-4" selectedEvent={selectedEvent}/>
    </div>
  )
}
