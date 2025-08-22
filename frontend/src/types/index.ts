export interface Event {
  id: string
  method: string
  url: string
  headers: Record<string, string>
  body: string
  queryParams: Record<string, string>
  ip: string
  timestamp: string
  status: number
}

export interface WebhookSession {
  id: string
  url: string
  events: Event[]
}

export interface WebSocketMessage {
  type: 'new_event' | 'initial_events'
  event?: Event
  events?: Event[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
