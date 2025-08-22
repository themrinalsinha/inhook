<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      methodColors[method] || methodColors.DEFAULT
    ]"
  >
    {{ method }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  method: string
}

defineProps<Props>()

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  HEAD: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
  OPTIONS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
}
</script>
