<script setup lang="ts">
import styles from './EmptyState.module.scss'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div :class="styles.root" role="status">
    <div v-if="$slots.icon" :class="styles.icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <h2 :class="styles.title">{{ title }}</h2>
    <p v-if="description" :class="styles.description">{{ description }}</p>
    <div v-if="$slots.action" :class="styles.action">
      <slot name="action" />
    </div>
  </div>
</template>
