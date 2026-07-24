import { test, expect } from '@playwright/test'

import { completeOnboarding, openPageByTitle, resetApp } from './helpers'

test.describe('favorite', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: true })
  })

  test('adds a page to favorites', async ({ page }) => {
    await openPageByTitle(page, 'Product Spec')

    const toggle = page.getByTestId('favorite-toggle')
    await expect(toggle).toHaveAttribute('aria-label', 'Add to favorites')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-label', 'Remove from favorites')

    await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible()
    await expect(
      page
        .locator('nav')
        .filter({ hasText: 'Favorites' })
        .getByRole('button', {
          name: /Product Spec/,
        }),
    ).toBeVisible()
  })
})
