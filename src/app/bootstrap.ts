/**
 * Post-plugin boot: ensure a workspace exists after onboarding
 */
import { getMeta, META_KEYS } from '@shared/lib/meta'
import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import { workspaceRepository } from '@entities/workspace'
import { seedDemoWorkspace } from '@entities/workspace'

/** Returns the active workspace id, or null when onboarding is still pending */
export async function bootstrapApp(): Promise<string | null> {
  const onboardingComplete = await getMeta(META_KEYS.onboardingComplete, false)
  if (!onboardingComplete) return null

  const workspaces = await workspaceRepository.list()
  if (workspaces.length === 0) {
    // First completed onboarding with empty DB → seed demo content
    const { workspace } = await seedDemoWorkspace()
    setStorageItem(STORAGE_KEYS.lastWorkspaceId, workspace.id)
    return workspace.id
  }

  const lastId = getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null)
  const exists = lastId && workspaces.some((w) => w.id === lastId)
  const workspaceId = exists ? lastId! : workspaces[0]!.id
  setStorageItem(STORAGE_KEYS.lastWorkspaceId, workspaceId)
  return workspaceId
}
