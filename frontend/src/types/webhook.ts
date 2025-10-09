export interface IWebhookToken {
  id: number;
  token: string;
  created_at: Date;
}

export interface IWebhookEvent {
  id: number;
  token_id: string;
  request_id: string;
  created_at: Date;
  method: string;
  remote_addr: string;
  query_params: string | null;
  headers: string;
  form_data: string | null;
  body: string | null;
  raw_data: string;
  is_read: boolean;
}
