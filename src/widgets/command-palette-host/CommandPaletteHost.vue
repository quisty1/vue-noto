<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { CommandPalette } from '@features/search'

const props = defineProps<{
  workspaceId: string | undefined
  open?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  selectPage: [pageId: string]
}>()

const router = useRouter()

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
})

function onKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    isOpen.value = true
  }
}

function onSelectPage(pageId: string): void {
  emit('selectPage', pageId)
  if (props.workspaceId) {
    void router.push({
      name: 'page',
      params: { workspaceId: props.workspaceId, pageId },
    })
  }
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <CommandPalette v-model:open="isOpen" :workspace-id="workspaceId" @select="onSelectPage" />
</template>
