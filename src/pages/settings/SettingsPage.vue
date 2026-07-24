<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button, ConfirmDialog, useToast } from '@shared/ui'
import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import { workspaceRepository } from '@entities/workspace'
import { seedDemoWorkspace } from '@entities/workspace'

import { ThemeSwitcher } from '@features/theme'
import { LocaleSwitcher } from '@features/locale'
import { exportWorkspace, importWorkspace, workspaceExportToJson } from '@features/import-export'
import styles from './SettingsPage.module.scss'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const resetOpen = ref(false)
const isResetting = ref(false)
const isImporting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function goBack(): void {
  const wsId = getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null)
  if (wsId) {
    void router.push({ name: 'workspace', params: { workspaceId: wsId } })
  } else {
    void router.push({ name: 'workspace' })
  }
}

async function onExport(): Promise<void> {
  const wsId = getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null)
  if (!wsId) return

  const data = await exportWorkspace(wsId)
  const json = workspaceExportToJson(data)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `noto-workspace-${wsId.slice(0, 8)}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.push({ title: t('settings.exportSuccess'), tone: 'success' })
}

function onImportClick(): void {
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isImporting.value = true
  try {
    const text = await file.text()
    const result = await importWorkspace(text, { mode: 'merge' })
    setStorageItem(STORAGE_KEYS.lastWorkspaceId, result.workspace.id)
    toast.push({ title: t('settings.importSuccess'), tone: 'success' })
    void router.push({ name: 'workspace', params: { workspaceId: result.workspace.id } })
  } catch {
    toast.push({ title: t('settings.importError'), tone: 'danger' })
  } finally {
    isImporting.value = false
    input.value = ''
  }
}

async function onResetConfirm(): Promise<void> {
  isResetting.value = true
  try {
    const wsId = getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null)
    if (wsId) {
      await workspaceRepository.delete(wsId)
    }
    const { workspace } = await seedDemoWorkspace()
    setStorageItem(STORAGE_KEYS.lastWorkspaceId, workspace.id)
    toast.push({ title: t('settings.resetSuccess'), tone: 'success' })
    resetOpen.value = false
    void router.push({ name: 'workspace', params: { workspaceId: workspace.id } })
  } finally {
    isResetting.value = false
  }
}
</script>

<template>
  <div :class="styles.page">
    <header :class="styles.header">
      <Button variant="ghost" @click="goBack">{{ t('common.back') }}</Button>
      <h1 :class="styles.title">{{ t('settings.title') }}</h1>
    </header>

    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">{{ t('settings.appearance') }}</h2>
      <div :class="styles.row">
        <span>{{ t('theme.switch') }}</span>
        <ThemeSwitcher />
      </div>
      <div :class="styles.row">
        <span>{{ t('settings.language') }}</span>
        <LocaleSwitcher />
      </div>
    </section>

    <section :class="styles.section">
      <h2 :class="styles.sectionTitle">{{ t('settings.data') }}</h2>
      <p :class="styles.hint">{{ t('settings.resetDemoDesc') }}</p>
      <div :class="styles.actions">
        <Button variant="secondary" data-testid="settings-export" @click="onExport">
          {{ t('settings.exportJson') }}
        </Button>
        <Button
          variant="secondary"
          :loading="isImporting"
          data-testid="settings-import"
          @click="onImportClick"
        >
          {{ t('settings.importJson') }}
        </Button>
        <input
          ref="fileInputRef"
          type="file"
          accept="application/json,.json"
          hidden
          data-testid="settings-import-input"
          @change="onFileSelected"
        />
        <Button variant="danger" @click="resetOpen = true">
          {{ t('settings.resetDemo') }}
        </Button>
      </div>
    </section>

    <ConfirmDialog
      v-model:open="resetOpen"
      :title="t('settings.resetConfirm')"
      :description="t('settings.resetConfirmDesc')"
      :confirm-label="t('settings.resetDemo')"
      danger
      :loading="isResetting"
      @confirm="onResetConfirm"
    />
  </div>
</template>
