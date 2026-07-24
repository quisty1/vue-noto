/** App-wide constants and localStorage key names */

export const APP_NAME = 'Noto'

/** Prefixed keys used with safe localStorage helpers */
export const STORAGE_KEYS = {
  theme: 'noto:theme',
  locale: 'noto:locale',
  sidebarCollapsed: 'noto:sidebar-collapsed',
  lastWorkspaceId: 'noto:last-workspace-id',
} as const

/** Max size for imported files (5MB) */
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

/** Debounce interval for autosave */
export const AUTOSAVE_MS = 1000

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
