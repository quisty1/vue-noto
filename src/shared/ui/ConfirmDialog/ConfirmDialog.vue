<script setup lang="ts">
import { Button } from '../Button'
import { Dialog } from '../Dialog'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false,
    loading: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function onUpdateOpen(value: boolean): void {
  emit('update:open', value)
}

function onCancel(): void {
  emit('update:open', false)
  emit('cancel')
}

function onConfirm(): void {
  emit('confirm')
}
</script>

<template>
  <Dialog
    :open="open"
    :title="title"
    :description="description"
    @update:open="onUpdateOpen"
    @close="emit('cancel')"
  >
    <slot />
    <template #footer>
      <Button variant="ghost" :disabled="loading" @click="onCancel">
        {{ cancelLabel }}
      </Button>
      <Button :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="onConfirm">
        {{ confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
