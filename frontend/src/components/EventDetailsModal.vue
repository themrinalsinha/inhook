<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Event Details
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ formatTimestamp(event.timestamp) }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Method and Status -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-4">
          <MethodBadge :method="event.method" />
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ event.status }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">IP:</span>
            <span class="text-sm font-mono text-gray-900 dark:text-white">{{ event.ip }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-auto p-6">
        <!-- Headers Tab -->
        <div v-if="activeTab === 'headers'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Request Headers</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div v-if="Object.keys(event.headers).length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              No headers
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(value, key) in event.headers"
                :key="key"
                class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ key }}</span>
                <span class="font-mono text-sm text-gray-900 dark:text-white break-all">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Body Tab -->
        <div v-if="activeTab === 'body'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Request Body</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div v-if="!event.body" class="text-gray-500 dark:text-gray-400 text-center py-4">
              No body content
            </div>
            <pre v-else class="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto"><code>{{ formatBody }}</code></pre>
          </div>
        </div>

        <!-- Query Tab -->
        <div v-if="activeTab === 'query'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Query Parameters</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div v-if="Object.keys(event.queryParams).length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              No query parameters
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(value, key) in event.queryParams"
                :key="key"
                class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ key }}</span>
                <span class="font-mono text-sm text-gray-900 dark:text-white break-all">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Response Tab -->
        <div v-if="activeTab === 'response'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Response</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Status</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ event.status }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Content-Type</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">application/json</span>
              </div>
            </div>
            <div class="mt-4">
              <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">Response Body:</div>
              <pre class="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded p-3"><code>{{ responseBody }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatTimestamp } from '@/lib/utils'
import MethodBadge from './MethodBadge.vue'
import type { Event } from '@/types'

interface Props {
  event: Event
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const activeTab = ref('headers')

const tabs = [
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'query', label: 'Query' },
  { id: 'response', label: 'Response' }
]

const formatBody = computed(() => {
  try {
    const parsed = JSON.parse(props.event.body)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return props.event.body
  }
})

const responseBody = computed(() => {
  return JSON.stringify({ success: true }, null, 2)
})
</script>
