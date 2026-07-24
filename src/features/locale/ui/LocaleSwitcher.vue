<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dropdown, IconButton, type DropdownItem } from '@shared/ui'
import type { Locale } from '@shared/types'

import { useLocale } from '../model/useLocale'

const { t } = useI18n()
const { locale, setLocale } = useLocale()

const items = computed<DropdownItem[]>(() => [
  { id: 'en', label: t('locale.en') },
  { id: 'ru', label: t('locale.ru') },
])

function onSelect(item: DropdownItem): void {
  setLocale(item.id as Locale)
}
</script>

<template>
  <Dropdown :items="items" align="end" @select="onSelect">
    <template #trigger="{ toggle }">
      <IconButton
        :aria-label="t('locale.switch')"
        size="sm"
        data-testid="locale-switcher"
        @click="toggle"
      >
        <span :class="$style.badge">{{ locale.toUpperCase() }}</span>
      </IconButton>
    </template>
  </Dropdown>
</template>

<style module lang="scss">
.badge {
  font-size: var(--noto-font-size-xs);
  font-weight: var(--noto-font-weight-semibold);
  letter-spacing: var(--noto-letter-spacing-wide);
}
</style>
