/**
 * Safe localStorage JSON helpers (prototype-pollution resistant)
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Rejects prototype-polluting keys during JSON.parse
 */
function safeReviver(key: string, value: unknown): unknown {
  if (DANGEROUS_KEYS.has(key)) {
    return undefined
  }
  return value
}

/**
 * Rebuilds values without inherited prototypes
 */
function toNullPrototype<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toNullPrototype(item)) as T
  }

  if (!isPlainObject(value)) {
    return value
  }

  const clean = Object.create(null) as Record<string, unknown>
  for (const [key, nested] of Object.entries(value)) {
    if (DANGEROUS_KEYS.has(key)) {
      continue
    }
    clean[key] = toNullPrototype(nested)
  }
  return clean as T
}

function parseJsonSafe<T>(raw: string): T {
  const parsed: unknown = JSON.parse(raw, safeReviver)
  const sanitized = toNullPrototype(parsed)
  return structuredClone(sanitized) as T
}

/** Read JSON from localStorage; returns fallback on miss or parse failure */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return parseJsonSafe<T>(raw)
  } catch {
    return fallback
  }
}

/** Persist JSON; returns false when quota / private mode blocks write */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore quota / private-mode failures
  }
}

export function hasStorageItem(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}
