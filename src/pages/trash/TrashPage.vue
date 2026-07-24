<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'

import { Button, ConfirmDialog, EmptyState } from '@shared/ui'
import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem } from '@shared/lib/storage'

import { useTrash } from '@features/trash'
import styles from './TrashPage.module.scss'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const workspaceId = computed(() => {
  const fromQuery = route.query.workspaceId as string | undefined
  return fromQuery ?? getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null) ?? undefined
})

const { deletedPages, restore, purge, isPurging } = useTrash(() => workspaceId.value)

const purgeTarget = ref<string | null>(null)
const purgeOpen = ref(false)

function confirmPurge(pageId: string): void {
  purgeTarget.value = pageId
  purgeOpen.value = true
}

async function onPurgeConfirm(): Promise<void> {
  if (!purgeTarget.value) return
  await purge(purgeTarget.value)
  purgeTarget.value = null
  purgeOpen.value = false
}

async function onRestore(pageId: string): Promise<void> {
  await restore(pageId)
}

function goBack(): void {
  const wsId = workspaceId.value
  if (wsId) {
    void router.push({ name: 'workspace', params: { workspaceId: wsId } })
  } else {
    void router.push({ name: 'workspace' })
  }
}
</script>

<template>
  <div :class="styles.page">
    <header :class="styles.header">
      <Button variant="ghost" @click="goBack">{{ t('common.back') }}</Button>
      <h1 :class="styles.title">{{ t('trash.title') }}</h1>
    </header>

    <EmptyState
      v-if="deletedPages.length === 0"
      :title="t('trash.empty')"
      :description="t('trash.emptyDescription')"
    />

    <ul v-else :class="styles.list">
      <li v-for="page in deletedPages" :key="page.id" :class="styles.item">
        <div :class="styles.itemInfo">
          <span v-if="page.icon">{{ page.icon }}</span>
          <span :class="styles.itemTitle">{{ page.title }}</span>
          <span v-if="page.deletedAt" :class="styles.itemDate">
            {{ t('trash.deletedAt', { date: format(new Date(page.deletedAt), 'PPp') }) }}
          </span>
        </div>
        <div :class="styles.itemActions">
          <Button
            variant="secondary"
            size="sm"
            data-testid="trash-restore"
            @click="onRestore(page.id)"
          >
            {{ t('trash.restore') }}
          </Button>
          <Button
            variant="danger"
            size="sm"
            data-testid="trash-delete"
            @click="confirmPurge(page.id)"
          >
            {{ t('trash.purge') }}
          </Button>
        </div>
      </li>
    </ul>

    <ConfirmDialog
      v-model:open="purgeOpen"
      :title="t('trash.confirmPurge')"
      :description="t('trash.confirmPurgeDesc')"
      :confirm-label="t('trash.purge')"
      danger
      :loading="isPurging"
      @confirm="onPurgeConfirm"
    />
  </div>
</template>
