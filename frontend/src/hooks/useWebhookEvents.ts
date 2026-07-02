import { useEffect, useState } from "react";
import { getWebhookEvents, getWebhookEventsSocketURL } from "@/api";
import type { IWebhookEvent } from "@/types/webhook";

// Matches the backend's LIMIT 50 on the events query.
const MAX_EVENTS = 50;

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

type WSMessage =
  | { type: "new_event"; data: IWebhookEvent }
  | { type: "event_read"; data: { id: number } }
  | { type: "events_archived" }
  | { type: "token_deleted" };

// Streams webhook events for a token. Loads the current list over REST, then
// applies live updates pushed over the WebSocket; on every (re)connect the
// list is refetched so nothing missed while disconnected is lost.
export const useWebhookEvents = (token?: string) => {
  const [webhookEvents, setWebhookEvents] = useState<IWebhookEvent[]>([]);

  useEffect(() => {
    if (!token) return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let retryDelay = INITIAL_RETRY_DELAY_MS;

    const fetchEvents = () => {
      getWebhookEvents(token)
        .then((events) => {
          if (!disposed) setWebhookEvents(events);
        })
        .catch(() => {
          // Ignore; the socket lifecycle retriggers the fetch.
        });
    };

    const applyMessage = (message: WSMessage) => {
      switch (message.type) {
        case "new_event":
          setWebhookEvents((events) =>
            events.some((event) => event.id === message.data.id)
              ? events
              : [message.data, ...events].slice(0, MAX_EVENTS)
          );
          break;
        case "event_read":
          setWebhookEvents((events) =>
            events.map((event) =>
              event.id === message.data.id ? { ...event, is_read: true } : event
            )
          );
          break;
        case "events_archived":
        case "token_deleted":
          setWebhookEvents([]);
          break;
      }
    };

    const connect = () => {
      socket = new WebSocket(getWebhookEventsSocketURL(token));

      socket.onopen = () => {
        retryDelay = INITIAL_RETRY_DELAY_MS;
        // Sync anything that changed while disconnected.
        fetchEvents();
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          applyMessage(JSON.parse(event.data) as WSMessage);
        } catch {
          // Ignore malformed frames.
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        const jitter = Math.random() * 0.3 * retryDelay;
        reconnectTimer = window.setTimeout(connect, retryDelay + jitter);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
      };
    };

    // Load the list immediately so events show even if the socket never
    // connects.
    fetchEvents();
    connect();

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [token]);

  return { webhookEvents, setWebhookEvents };
};
