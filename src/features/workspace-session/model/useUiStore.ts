import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const MAX_RECENT = 8

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const sidebarCollapsed = ref(getStorageItem(STORAGE_KEYS.sidebarCollapsed, false))
  const recentPageIds = ref<string[]>([])

  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(open: boolean): void {
    sidebarOpen.value = open
  }

  function toggleSidebarCollapsed(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    setStorageItem(STORAGE_KEYS.sidebarCollapsed, sidebarCollapsed.value)
  }

  function pushRecentPage(pageId: string): void {
    const filtered = recentPageIds.value.filter((id) => id !== pageId)
    recentPageIds.value = [pageId, ...filtered].slice(0, MAX_RECENT)
  }

  return {
    sidebarOpen,
    sidebarCollapsed,
    recentPageIds,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    pushRecentPage,
  }
})
