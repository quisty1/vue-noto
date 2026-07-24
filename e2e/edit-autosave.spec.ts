import { test, expect } from '@playwright/test'

import {
  completeOnboarding,
  editorSurface,
  resetApp,
  typeInEditor,
  waitForEditorSaved,
} from './helpers'

test.describe('edit autosave', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, { useDemo: false })
  })

  test('edits content and shows saved indicator', async ({ page }) => {
    await page.getByTestId('new-page-button').click()
    await expect(page.getByTestId('editor-title')).toBeVisible()

    await typeInEditor(page, 'Autosave probe text')
    await waitForEditorSaved(page)
    await expect(editorSurface(page)).toContainText('Autosave probe text')
  })
})
