<script setup lang="ts">
import { RouterView } from 'vue-router'

import { ToastHost, ToastProvider } from '@shared/ui'

import ErrorBoundary from './ErrorBoundary.vue'
</script>

<template>
  <ToastProvider>
    <ErrorBoundary>
      <RouterView />
      <ToastHost />
    </ErrorBoundary>
  </ToastProvider>
</template>
