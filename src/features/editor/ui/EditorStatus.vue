<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AutosaveStatus } from '../model/useAutosave'
import styles from './EditorStatus.module.scss'

const props = defineProps<{
  status: AutosaveStatus
}>()

const { t } = useI18n()

const label = computed(() => {
  switch (props.status) {
    case 'saving':
      return t('editor.status.saving')
    case 'saved':
      return t('editor.status.saved')
    case 'error':
      return t('editor.status.error')
    default:
      return ''
  }
})
</script>

<template>
  <span
    v-if="label"
    :class="[styles.root, styles[status]]"
    role="status"
    aria-live="polite"
    data-testid="editor-status"
  >
    {{ label }}
  </span>
</template>
