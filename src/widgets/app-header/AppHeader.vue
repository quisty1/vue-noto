<script setup lang="ts">
import { ChevronRight, MoreHorizontal, Search, Star } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dropdown, IconButton, type DropdownItem } from '@shared/ui'
import type { Page } from '@entities/page'
import { getBreadcrumbs } from '@entities/page'
import { exportPageMarkdown } from '@features/import-export'

import { ThemeSwitcher } from '@features/theme'
import { EditorStatus } from '@features/editor'
import type { AutosaveStatus } from '@features/editor'
import { SnapshotPanel } from '@features/snapshots'
import styles from './AppHeader.module.scss'

const props = defineProps<{
  pages: Page[]
  currentPage: Page | null
  saveStatus: AutosaveStatus
}>()

const emit = defineEmits<{
  openSearch: []
  toggleFavorite: []
  duplicate: []
  delete: []
  restoreSnapshot: [content: Page['content']]
}>()

const { t } = useI18n()

const breadcrumbs = computed(() => {
  if (!props.currentPage) return []
  return getBreadcrumbs(props.pages, props.currentPage.id)
})

const moreItems = computed<DropdownItem[]>(() => [
  { id: 'export', label: t('header.exportMd') },
  { id: 'duplicate', label: t('header.duplicate') },
  { id: 'delete', label: t('header.delete'), danger: true },
])

function onMoreSelect(item: DropdownItem): void {
  switch (item.id) {
    case 'export':
      if (props.currentPage) {
        const { markdown, filename } = exportPageMarkdown(props.currentPage)
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
      break
    case 'duplicate':
      emit('duplicate')
      break
    case 'delete':
      emit('delete')
      break
    default:
      break
  }
}
</script>

<template>
  <header :class="styles.header">
    <div :class="styles.left">
      <slot name="menu" />

      <nav v-if="breadcrumbs.length > 0" :class="styles.breadcrumbs" aria-label="Breadcrumb">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
          <ChevronRight v-if="index > 0" :size="14" aria-hidden="true" />
          <span
            :class="[styles.crumb, index === breadcrumbs.length - 1 ? styles.crumbCurrent : null]"
          >
            <span v-if="crumb.icon" aria-hidden="true">{{ crumb.icon }}</span>
            {{ crumb.title }}
          </span>
        </template>
      </nav>
    </div>

    <div :class="styles.right">
      <EditorStatus :status="saveStatus" />

      <IconButton :aria-label="t('search.open')" size="sm" @click="emit('openSearch')">
        <Search :size="16" />
      </IconButton>

      <template v-if="currentPage">
        <IconButton
          :aria-label="currentPage.isFavorite ? t('header.unfavorite') : t('header.favorite')"
          size="sm"
          data-testid="favorite-toggle"
          @click="emit('toggleFavorite')"
        >
          <Star
            :size="16"
            :fill="currentPage.isFavorite ? 'currentColor' : 'none'"
            :class="currentPage.isFavorite ? styles.favoriteActive : null"
          />
        </IconButton>

        <SnapshotPanel :page-id="currentPage.id" @restore="emit('restoreSnapshot', $event)" />
      </template>

      <ThemeSwitcher />

      <Dropdown v-if="currentPage" :items="moreItems" align="end" @select="onMoreSelect">
        <template #trigger="{ toggle }">
          <IconButton :aria-label="t('header.more')" size="sm" @click="toggle">
            <MoreHorizontal :size="16" />
          </IconButton>
        </template>
      </Dropdown>
    </div>
  </header>
</template>
