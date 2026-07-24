import { test, expect } from '@playwright/test'

import { completeOnboarding, resetApp } from './helpers'

test.describe('onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
  })

  test('first launch completes onboarding with demo content', async ({ page }) => {
    await completeOnboarding(page, {
      workspaceName: 'Demo Notes',
      useDemo: true,
    })

    await expect(page.getByRole('heading', { name: 'Demo Notes' })).toBeVisible()
    await expect(
      page.getByTestId('sidebar-page-item').filter({ hasText: 'Getting Started' }),
    ).toBeVisible()
    await expect(page.getByTestId('new-page-button')).toBeVisible()
  })
})
