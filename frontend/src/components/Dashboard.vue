<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          inHook
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Webhook Inspector & Debugger
        </p>
      </div>

      <!-- Webhook URL Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your Webhook URL
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Send HTTP requests to this URL to capture and inspect them in real-time.
            </p>
          </div>
          <button
            v-if="!session"
            @click="createSession"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Generate URL</span>
          </button>
        </div>

        <div v-if="webhookUrl" class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md p-3">
              <code class="text-sm text-gray-800 dark:text-gray-200 break-all">
                {{ webhookUrl }}
              </code>
            </div>
            <button
              @click="copyWebhookUrl"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </span>
            <span>{{ eventCount }} events captured</span>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Events Section -->
      <div v-if="session" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Incoming Events
          </h2>
          <button
            @click="clearEvents"
            class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>

        <!-- Events List -->
        <div v-if="events.length === 0" class="text-center py-12">
          <div class="text-gray-400 dark:text-gray-500 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            No events captured yet. Send a request to your webhook URL to see it here.
          </p>
        </div>

        <div v-else class="space-y-4">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
            @click="selectEvent(event)"
          />
        </div>
      </div>

      <!-- Event Details Modal -->
      <EventDetailsModal
        v-if="selectedEvent"
        :event="selectedEvent"
        @close="selectedEvent = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebhookSession } from '@/composables/useWebhookSession'
import EventCard from './EventCard.vue'
import EventDetailsModal from './EventDetailsModal.vue'
import type { Event } from '@/types'

const {
  session,
  events,
  loading,
  error,
  webhookUrl,
  eventCount,
  createSession,
  copyWebhookUrl,
  clearEvents,
} = useWebhookSession()

const selectedEvent = ref<Event | null>(null)

const selectEvent = (event: Event) => {
  selectedEvent.value = event
}
</script>
