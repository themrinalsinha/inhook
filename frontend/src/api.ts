import axios from "axios";
import type {
  IWebhookToken,
  IWebhookEvent,
  IWebhookConfig,
} from "@/types/webhook";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const createWebhookToken = async () => {
  const response = await api.post("/api/webhook/");
  if (response.status !== 201) {
    throw new Error("Failed to create webhook token");
  }
  return response.data as IWebhookToken;
};

export const deleteWebhookToken = async (tokenId: string) => {
  const response = await api.delete(`/api/webhook/${tokenId}`);
  if (response.status !== 204) {
    throw new Error("Failed to delete webhook token");
  }
  return;
};

export const refreshWebhookToken = async (tokenId?: string) => {
  // first delete the token and then create a new one
  if (tokenId) {
    await deleteWebhookToken(tokenId);
  }
  const response = await createWebhookToken();
  return response;
};

export const getWebhookEventsSocketURL = (tokenId: string) => {
  const base = import.meta.env.VITE_API_URL || window.location.origin;
  const url = new URL(`/api/webhook/${tokenId}/ws`, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
};

export const getWebhookEvents = async (tokenId: string) => {
  const response = await api.get(`/api/webhook/${tokenId}/events/`);
  if (response.status !== 200) {
    throw new Error("Failed to get webhook events");
  }
  return response.data as IWebhookEvent[];
};

export const getWebhookConfig = async () => {
  const response = await api.get("/api/webhook/config/");
  if (response.status !== 200) {
    throw new Error("Failed to get webhook config");
  }
  return response.data as IWebhookConfig;
};

export const markEventAsRead = async (eventId: number) => {
  const response = await api.post(`/api/webhook/event/${eventId}/read/`);
  if (response.status !== 200) {
    throw new Error("Failed to mark event as read");
  }
  return response.data;
};

export const archiveAllWebhookEventsByTokenID = async (tokenId: number) => {
  const response = await api.post(`/api/webhook/${tokenId}/archive-events/`);
  if (response.status !== 200) {
    throw new Error("Failed to archive all webhook events");
  }
  return;
};
