import { test, expect } from '@playwright/test'

import { completeOnboarding, resetApp } from './helpers'

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('opens drawer and creates a page', async ({ page }) => {
    // UI store defaults sidebarOpen=true; close via the right-side backdrop area
    const backdrop = page.getByTestId('sidebar-backdrop')
    if (await backdrop.count()) {
      await backdrop.click({ position: { x: 360, y: 400 }, force: true })
    }
    await expect(page.getByTestId('sidebar-backdrop')).toHaveCount(0)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByTestId('new-page-button')).toBeVisible()

    await page.getByTestId('new-page-button').click()

    await expect(page.getByTestId('editor-title')).toHaveValue('Untitled')
    await expect(page.getByTestId('editor-content')).toBeVisible()
  })
})
