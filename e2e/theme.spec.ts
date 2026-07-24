import { test, expect } from '@playwright/test'

import { completeOnboarding, resetApp } from './helpers'

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('switches theme and updates data-theme', async ({ page }) => {
    await page.getByTestId('theme-switcher').click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByTestId('theme-switcher').click()
    await page.getByRole('menuitem', { name: 'Light' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})
