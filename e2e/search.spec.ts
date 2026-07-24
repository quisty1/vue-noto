import { test, expect } from '@playwright/test'

import { completeOnboarding, openPageByTitle, resetApp } from './helpers'

test.describe('search', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: true })
  })

  test('command palette finds a page by title', async ({ page }) => {
    await openPageByTitle(page, 'Product Spec')

    await page.getByRole('button', { name: 'Open search' }).click()
    const input = page.getByTestId('command-palette-input')
    await expect(input).toBeVisible()
    await input.fill('Markdown Tips')

    const option = page.getByRole('option').filter({ hasText: 'Markdown Tips' })
    await expect(option).toBeVisible({ timeout: 10_000 })
    await option.click()

    await expect(page.getByTestId('editor-title')).toHaveValue('Markdown Tips')
  })
})
