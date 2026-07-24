import { test, expect } from '@playwright/test'

import { completeOnboarding, resetApp } from './helpers'

test.describe('create page', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('creates a new untitled page from the sidebar', async ({ page }) => {
    await page.getByTestId('new-page-button').click()

    await expect(page.getByTestId('editor-title')).toBeVisible()
    await expect(page.getByTestId('editor-title')).toHaveValue('Untitled')
    await expect(
      page.getByTestId('sidebar-page-item').filter({ hasText: 'Untitled' }),
    ).toBeVisible()
    await expect(page.getByTestId('editor-content')).toBeVisible()
  })
})
