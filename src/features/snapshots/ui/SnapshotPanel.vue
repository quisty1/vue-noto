<script setup lang="ts">
import { History } from '@lucide/vue'
import { format } from 'date-fns'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dropdown, IconButton, type DropdownItem } from '@shared/ui'
import type { Snapshot } from '@entities/snapshot'

import { useSnapshots } from '../model/useSnapshots'

const props = defineProps<{
  pageId: string
}>()

const emit = defineEmits<{
  restore: [content: Snapshot['content']]
}>()

const { t } = useI18n()
const { snapshots, restoreSnapshot } = useSnapshots(() => props.pageId)

const items = computed<DropdownItem[]>(() =>
  snapshots.value.map((s) => ({
    id: s.id,
    label: format(new Date(s.createdAt), 'PPp'),
  })),
)

async function onSelect(item: DropdownItem): Promise<void> {
  const snapshot = await restoreSnapshot(item.id)
  emit('restore', snapshot.content)
}
</script>

<template>
  <Dropdown v-if="snapshots.length > 0" :items="items" align="end" @select="onSelect">
    <template #trigger="{ toggle }">
      <IconButton :aria-label="t('snapshots.title')" size="sm" @click="toggle">
        <History :size="16" />
      </IconButton>
    </template>
  </Dropdown>
</template>

<style module lang="scss">
/* panel styles reserved for future expanded view */
</style>
