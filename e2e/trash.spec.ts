import { test, expect } from '@playwright/test'

import { completeOnboarding, openPageByTitle, resetApp } from './helpers'

test.describe('trash', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: true })
  })

  test('deletes a page and restores it from trash', async ({ page }) => {
    await openPageByTitle(page, 'Markdown Tips')

    await page.locator('header').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete page' }).click()

    await expect(
      page.getByTestId('sidebar-page-item').filter({ hasText: 'Markdown Tips' }),
    ).toHaveCount(0)

    await page.getByRole('button', { name: 'Trash' }).click()
    await expect(page.getByRole('heading', { name: 'Trash' })).toBeVisible()
    await expect(page.getByText('Markdown Tips')).toBeVisible()

    await page.getByTestId('trash-restore').click()
    await expect(page.getByText('Markdown Tips')).toHaveCount(0)

    await page.getByRole('button', { name: 'Back' }).click()
    await expect(
      page.getByTestId('sidebar-page-item').filter({ hasText: 'Markdown Tips' }),
    ).toBeVisible({
      timeout: 10_000,
    })
  })
})
