<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@shared/ui'

import styles from './ErrorBoundary.module.scss'

const { t } = useI18n()
const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <slot v-if="!error" />
  <div v-else :class="styles.root" role="alert">
    <h1 :class="styles.title">{{ t('errorBoundary.title') }}</h1>
    <p :class="styles.description">{{ t('errorBoundary.description') }}</p>
    <Button @click="reload">{{ t('errorBoundary.reload') }}</Button>
  </div>
</template>
