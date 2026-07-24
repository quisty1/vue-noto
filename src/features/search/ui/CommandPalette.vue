<script setup lang="ts">
import { Search, X } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EmptyState, IconButton } from '@shared/ui'

import { useSearch } from '../model/useSearch'
import styles from './CommandPalette.module.scss'

const props = defineProps<{
  open: boolean
  workspaceId: string | undefined
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [pageId: string]
}>()

const { t } = useI18n()
const inputRef = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const { query, results, isSearching, getHighlightSegments } = useSearch(() => props.workspaceId)

const hasQuery = computed(() => query.value.trim().length > 0)
const showEmpty = computed(() => hasQuery.value && !isSearching.value && results.value.length === 0)

watch(
  () => props.open,
  async (open) => {
    if (open) {
      query.value = ''
      activeIndex.value = 0
      await nextTick()
      inputRef.value?.focus()
    }
  },
)

watch(results, () => {
  activeIndex.value = 0
})

function close(): void {
  emit('update:open', false)
}

function selectPage(pageId: string): void {
  emit('select', pageId)
  close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, Math.max(0, results.value.length - 1))
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }

  if (event.key === 'Enter' && results.value.length > 0) {
    event.preventDefault()
    const page = results.value[activeIndex.value]
    if (page) selectPage(page.id)
  }
}

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    close()
  }
}

onBeforeUnmount(() => {
  query.value = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="styles.overlay" @mousedown="onOverlayClick">
      <div :class="styles.palette" role="dialog" aria-modal="true" :aria-label="t('search.title')">
        <div :class="styles.inputRow">
          <Search :size="18" :class="styles.searchIcon" aria-hidden="true" />
          <input
            ref="inputRef"
            v-model="query"
            type="search"
            :class="styles.input"
            :placeholder="t('search.placeholder')"
            autocomplete="off"
            aria-label="Search pages"
            data-testid="command-palette-input"
            @keydown="onKeydown"
          />
          <IconButton :aria-label="t('common.close')" size="sm" @click="close">
            <X :size="16" />
          </IconButton>
        </div>

        <div v-if="isSearching" :class="styles.hint">
          {{ t('search.searching') }}
        </div>

        <ul v-else-if="results.length > 0" :class="styles.results" role="listbox">
          <li
            v-for="(page, index) in results"
            :key="page.id"
            role="option"
            :aria-selected="index === activeIndex"
            :class="[styles.result, index === activeIndex ? styles.resultActive : null]"
            @click="selectPage(page.id)"
            @mouseenter="activeIndex = index"
          >
            <span v-if="page.icon" :class="styles.resultIcon">{{ page.icon }}</span>
            <div :class="styles.resultBody">
              <span :class="styles.resultTitle">
                <template
                  v-for="(seg, si) in getHighlightSegments(page.title, query)"
                  :key="`t-${page.id}-${si}`"
                >
                  <mark v-if="seg.match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span v-if="page.plainText" :class="styles.resultSnippet">
                <template
                  v-for="(seg, si) in getHighlightSegments(page.plainText.slice(0, 120), query)"
                  :key="`s-${page.id}-${si}`"
                >
                  <mark v-if="seg.match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
            </div>
          </li>
        </ul>

        <EmptyState
          v-else-if="showEmpty"
          :title="t('search.noResults')"
          :description="t('search.noResultsHint')"
        />

        <p v-else :class="styles.hint">{{ t('search.hint') }}</p>
      </div>
    </div>
  </Teleport>
</template>
