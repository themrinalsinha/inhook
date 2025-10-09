import axios from "axios";

interface IWebhookToken {
  id: number;
  token: string;
  created_at: Date;
}

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
