import { test, expect } from '@playwright/test'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'

import { completeOnboarding, resetApp } from './helpers'

test.describe('import export', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page)
    await completeOnboarding(page, {
      workspaceName: 'Export Workspace',
      useDemo: true,
    })
  })

  test('exports workspace JSON and re-imports it', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('settings-export').click()
    const download = await downloadPromise

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'noto-e2e-'))
    const filePath = path.join(tmpDir, download.suggestedFilename())
    await download.saveAs(filePath)

    const raw = await fs.readFile(filePath, 'utf8')
    expect(raw).toContain('Export Workspace')
    expect(raw).toContain('Getting Started')

    await page.getByTestId('settings-import-input').setInputFiles(filePath)

    await expect(page.getByTestId('new-page-button')).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByTestId('sidebar-page-item').filter({ hasText: 'Getting Started' }),
    ).toBeVisible()

    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})
