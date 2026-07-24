<script setup lang="ts">
import { computed } from 'vue'

import styles from './Skeleton.module.scss'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

const props = withDefaults(
  defineProps<{
    variant?: SkeletonVariant
    width?: string | number
    height?: string | number
    ariaLabel?: string
  }>(),
  {
    variant: 'text',
    ariaLabel: 'Loading',
  },
)

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const rootStyle = computed(() => ({
  width: toCssSize(props.width) ?? (props.variant === 'circle' ? '2.5rem' : '100%'),
  height:
    toCssSize(props.height) ??
    (props.variant === 'text' ? undefined : props.variant === 'circle' ? '2.5rem' : '6rem'),
}))

const variantClass = computed(() => {
  if (props.variant === 'circle') return styles.circle
  if (props.variant === 'rect') return styles.rect
  return styles.text
})
</script>

<template>
  <span
    :class="[styles.root, variantClass]"
    :style="rootStyle"
    role="status"
    :aria-label="ariaLabel"
    aria-busy="true"
  />
</template>
