import { test, expect } from '@playwright/test'

import { completeOnboarding, resetApp } from './helpers'

test.describe('locale', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('switches UI to Russian', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    await page.getByTestId('locale-switcher').click()
    await page.getByRole('menuitem', { name: 'Русский' }).click()

    await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible()
    await expect(page.getByText('Язык')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
  })
})
