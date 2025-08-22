<template>
  <div
    @click="$emit('click')"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-3 mb-2">
          <MethodBadge :method="event.method" />
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatTimestamp(event.timestamp) }}
          </span>
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center space-x-2 text-sm">
            <span class="text-gray-600 dark:text-gray-400">From:</span>
            <span class="text-gray-900 dark:text-white font-mono">{{ event.ip }}</span>
          </div>
          
          <div class="flex items-center space-x-2 text-sm">
            <span class="text-gray-600 dark:text-gray-400">URL:</span>
            <span class="text-gray-900 dark:text-white font-mono truncate">
              {{ event.url }}
            </span>
          </div>
        </div>

        <!-- Body Preview -->
        <div v-if="event.body" class="mt-3">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Body Preview:</div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <code class="text-xs text-gray-800 dark:text-gray-200">
              {{ truncateBody }}
            </code>
          </div>
        </div>

        <!-- Query Parameters -->
        <div v-if="Object.keys(event.queryParams).length > 0" class="mt-3">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Query Params:</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(value, key) in event.queryParams"
              :key="key"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            >
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end space-y-2 ml-4">
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ event.method }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ event.status }}
          </div>
        </div>
        
        <div class="text-xs text-gray-400 dark:text-gray-500">
          {{ formatBytes(event.body.length) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimestamp, truncateText, formatBytes } from '@/lib/utils'
import MethodBadge from './MethodBadge.vue'
import type { Event } from '@/types'

interface Props {
  event: Event
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const truncateBody = computed(() => {
  return truncateText(props.event.body, 150)
})
</script>
