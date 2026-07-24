import { workspaceRepository } from '@entities/workspace'
import { seedDemoWorkspace } from '@entities/workspace'
import { getMeta, META_KEYS, setMeta } from '@shared/lib/meta'
import { STORAGE_KEYS } from '@shared/config'
import { setStorageItem } from '@shared/lib/storage'
import { useMutation } from '@tanstack/vue-query'

export function useOnboarding() {
  const completeMutation = useMutation({
    mutationFn: async ({ workspaceName, useDemo }: { workspaceName: string; useDemo: boolean }) => {
      let workspace
      if (useDemo) {
        const result = await seedDemoWorkspace(workspaceName || 'Demo Workspace')
        workspace = result.workspace
      } else {
        workspace = await workspaceRepository.create({
          name: workspaceName,
        })
      }

      await setMeta(META_KEYS.onboardingComplete, true)
      setStorageItem(STORAGE_KEYS.lastWorkspaceId, workspace.id)

      return workspace
    },
  })

  async function isOnboardingComplete(): Promise<boolean> {
    return getMeta(META_KEYS.onboardingComplete, false)
  }

  return {
    completeOnboarding: completeMutation.mutateAsync,
    isOnboardingComplete,
    isSubmitting: completeMutation.isPending,
  }
}
