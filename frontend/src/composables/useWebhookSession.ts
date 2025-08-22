import { ref, computed, onUnmounted } from 'vue'
import { apiService } from '@/services/api'
import { WebSocketService } from '@/services/websocket'
import type { WebhookSession, Event, WebSocketMessage } from '@/types'

export function useWebhookSession() {
  const session = ref<WebhookSession | null>(null)
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const wsService = ref<WebSocketService | null>(null)

  const webhookUrl = computed(() => session.value?.url || '')
  const eventCount = computed(() => events.value.length)

  const createSession = async () => {
    try {
      loading.value = true
      error.value = null
      
      const newSession = await apiService.createSession()
      session.value = newSession
      events.value = newSession.events || []
      
      // Connect to WebSocket
      connectWebSocket(newSession.id)
      
      return newSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create session'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadSession = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const existingSession = await apiService.getSession(id)
      session.value = existingSession
      events.value = existingSession.events || []
      
      // Connect to WebSocket
      connectWebSocket(id)
      
      return existingSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load session'
      throw err
    } finally {
      loading.value = false
    }
  }

  const connectWebSocket = (sessionId: string) => {
    const wsUrl = `ws://localhost:8080/ws/${sessionId}`
    
    wsService.value = new WebSocketService(
      wsUrl,
      handleWebSocketMessage,
      handleWebSocketError,
      handleWebSocketClose
    )
    
    wsService.value.connect()
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_event':
        if (message.event) {
          events.value.unshift(message.event)
        }
        break
      case 'initial_events':
        if (message.events) {
          events.value = message.events
        }
        break
    }
  }

  const handleWebSocketError = (error: Event) => {
    console.error('WebSocket error:', error)
  }

  const handleWebSocketClose = () => {
    console.log('WebSocket connection closed')
  }

  const copyWebhookUrl = async () => {
    if (webhookUrl.value) {
      try {
        await navigator.clipboard.writeText(webhookUrl.value)
        return true
      } catch (err) {
        console.error('Failed to copy URL:', err)
        return false
      }
    }
    return false
  }

  const clearEvents = () => {
    events.value = []
  }

  onUnmounted(() => {
    if (wsService.value) {
      wsService.value.disconnect()
    }
  })

  return {
    session,
    events,
    loading,
    error,
    webhookUrl,
    eventCount,
    createSession,
    loadSession,
    copyWebhookUrl,
    clearEvents,
  }
}
