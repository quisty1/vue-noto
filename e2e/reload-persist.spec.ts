import { test, expect } from '@playwright/test'

import {
  completeOnboarding,
  editorSurface,
  resetApp,
  typeInEditor,
  waitForEditorSaved,
} from './helpers'

test.describe('reload persistence', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('reload restores title and content', async ({ page }) => {
    await page.getByTestId('new-page-button').click()
    await expect(page.getByTestId('editor-title')).toBeVisible()

    await page.getByTestId('editor-title').fill('Persisted Page')
    await typeInEditor(page, 'Content that must survive reload')
    await waitForEditorSaved(page)
    // Title debounce is 500ms; give IndexedDB a moment after Saved
    await page.waitForTimeout(700)

    await page.reload()
    await expect(page.getByTestId('editor-title')).toHaveValue('Persisted Page', {
      timeout: 15_000,
    })
    await expect(editorSurface(page)).toContainText('Content that must survive reload')
  })
})
