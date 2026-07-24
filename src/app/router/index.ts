/**
 * Vue Router: workspace routes + onboarding gate
 */
import { createRouter, createWebHistory } from 'vue-router'

import { getMeta, META_KEYS } from '@shared/lib/meta'

const router = createRouter({
  // BASE_URL comes from Vite `base` / VITE_BASE_URL
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => ({ name: 'workspace' }),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@pages/onboarding/OnboardingPage.vue'),
      meta: { public: true },
    },
    {
      path: '/w/:workspaceId?',
      name: 'workspace',
      component: () => import('@pages/workspace/WorkspacePage.vue'),
      props: (route) => ({
        workspaceId: route.params.workspaceId as string | undefined,
      }),
    },
    {
      path: '/w/:workspaceId/page/:pageId',
      name: 'page',
      component: () => import('@pages/workspace/WorkspacePage.vue'),
      props: (route) => ({
        workspaceId: route.params.workspaceId as string,
        pageId: route.params.pageId as string,
      }),
    },
    {
      path: '/trash',
      name: 'trash',
      component: () => import('@pages/trash/TrashPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@pages/settings/SettingsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@pages/not-found/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const onboardingComplete = await getMeta(META_KEYS.onboardingComplete, false)
  if (!onboardingComplete && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }

  if (onboardingComplete && to.name === 'onboarding') {
    return { name: 'workspace' }
  }

  return true
})

export default router
