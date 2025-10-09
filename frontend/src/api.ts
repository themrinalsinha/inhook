import axios from "axios";
import type { IWebhookToken, IWebhookEvent } from "@/types/webhook";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000",
})

export const createWebhookToken = async () => {
  const response = await api.post("/api/webhook/");
  if (response.status !== 201) {
    throw new Error("Failed to create webhook token");
  }
  return response.data as IWebhookToken;
}

export const deleteWebhookToken = async (tokenId: string) => {
  const response = await api.delete(`/api/webhook/${tokenId}`);
  if (response.status !== 204) {
    throw new Error("Failed to delete webhook token");
  }
  return;
}

export const refreshWebhookToken = async (tokenId?: string) => {
  // first delete the token and then create a new one
  if (tokenId) {
    await deleteWebhookToken(tokenId);
  }
  const response = await createWebhookToken();
  return response;
}

export const getWebhookEvents = async (tokenId: string) => {
  const response = await api.get(`/api/webhook/${tokenId}/events/`);
  if (response.status !== 200) {
    throw new Error("Failed to get webhook events");
  }
  return response.data as IWebhookEvent[];
}
