<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dropdown, IconButton, type DropdownItem } from '@shared/ui'
import type { ThemeMode } from '@shared/types'

import { useTheme } from '../model/useTheme'

const { t } = useI18n()
const { themeMode, setTheme } = useTheme()

const items = computed<DropdownItem[]>(() => [
  { id: 'light', label: t('theme.light') },
  { id: 'dark', label: t('theme.dark') },
  { id: 'system', label: t('theme.system') },
])

const currentIcon = computed(() => {
  switch (themeMode.value) {
    case 'dark':
      return Moon
    case 'light':
      return Sun
    default:
      return Monitor
  }
})

function onSelect(item: DropdownItem): void {
  setTheme(item.id as ThemeMode)
}
</script>

<template>
  <Dropdown :items="items" align="end" @select="onSelect">
    <template #trigger="{ toggle }">
      <IconButton
        :aria-label="t('theme.switch')"
        size="sm"
        data-testid="theme-switcher"
        @click="toggle"
      >
        <component :is="currentIcon" :size="16" />
      </IconButton>
    </template>
  </Dropdown>
</template>
