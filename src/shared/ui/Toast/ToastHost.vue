<script setup lang="ts">
import { X } from '@lucide/vue'

import { IconButton } from '../IconButton'
import styles from './Toast.module.scss'
import { useToast } from './useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div :class="styles.host" aria-live="polite" aria-relevant="additions text">
    <TransitionGroup name="noto-toast" tag="div" :class="styles.list">
      <div
        v-for="item in toasts"
        :id="item.id"
        :key="item.id"
        :class="[styles.toast, styles[item.tone]]"
        role="status"
      >
        <div>
          <p :class="styles.title">{{ item.title }}</p>
          <p v-if="item.description" :class="styles.description">
            {{ item.description }}
          </p>
        </div>
        <IconButton
          :class="styles.dismiss"
          aria-label="Dismiss notification"
          size="sm"
          @click="dismiss(item.id)"
        >
          <X :size="14" />
        </IconButton>
      </div>
    </TransitionGroup>
  </div>
</template>
