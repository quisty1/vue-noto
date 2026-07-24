/**
 * CRUD helpers for the IndexedDB meta table (app-level flags)
 */
import { db } from '@shared/lib/db'

export const META_KEYS = {
  onboardingComplete: 'onboardingComplete',
} as const

export type MetaKey = (typeof META_KEYS)[keyof typeof META_KEYS]

/** Read a meta value or return fallback when missing */
export async function getMeta<T>(key: MetaKey, fallback: T): Promise<T> {
  const record = await db.meta.get(key)
  if (!record) return fallback
  return record.value as T
}

export async function setMeta<T>(key: MetaKey, value: T): Promise<void> {
  await db.meta.put({ key, value })
}

export async function removeMeta(key: MetaKey): Promise<void> {
  await db.meta.delete(key)
}
