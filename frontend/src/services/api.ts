import type { WebhookSession, Event } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  async createSession(): Promise<WebhookSession> {
    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    return response.json()
  }

  async getSession(id: string): Promise<WebhookSession> {
    const response = await fetch(`${this.baseUrl}/api/sessions/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    return response.json()
  }

  async getEvents(id: string): Promise<Event[]> {
    const response = await fetch(`${this.baseUrl}/api/events/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get events: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiService = new ApiService()
