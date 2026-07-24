import { expect, type Page } from '@playwright/test'

/**
 * Clears app storage for an isolated E2E run
 * Uses CDP so IndexedDB delete does not race an open Dexie connection
 */
export async function clearAppStorage(page: Page): Promise<void> {
  await page.goto('/')
  const origin = new URL(page.url()).origin

  // Drop the live document so Dexie releases the IndexedDB connection
  await page.goto('about:blank')

  const session = await page.context().newCDPSession(page)
  await session.send('Storage.clearDataForOrigin', {
    origin,
    storageTypes: 'indexeddb,local_storage,session_storage',
  })
  await session.detach()
}

/** Clears storage and reloads so the app boots into onboarding */
export async function resetApp(page: Page): Promise<void> {
  await clearAppStorage(page)
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /Set up your workspace|Настройте пространство/ }),
  ).toBeVisible()
}

export async function completeOnboarding(
  page: Page,
  options: { workspaceName?: string; useDemo?: boolean } = {},
): Promise<void> {
  const { workspaceName = 'E2E Workspace', useDemo = true } = options

  await expect(page.getByRole('heading', { name: 'Set up your workspace' })).toBeVisible()
  await page.getByLabel('Workspace name').fill(workspaceName)

  const demoCheckbox = page.getByTestId('onboarding-load-demo')
  if (useDemo) {
    await demoCheckbox.check()
  } else {
    await demoCheckbox.uncheck()
  }

  await page.getByTestId('onboarding-submit').click()
  await expect(page.getByTestId('new-page-button')).toBeVisible({ timeout: 15_000 })
}

export async function openPageByTitle(page: Page, title: string): Promise<void> {
  await page.getByTestId('sidebar-page-item').filter({ hasText: title }).first().click()
  await expect(page.getByTestId('editor-title')).toHaveValue(title)
}

export function editorSurface(page: Page) {
  return page.getByTestId('editor-content').locator('.ProseMirror')
}

export async function typeInEditor(page: Page, text: string): Promise<void> {
  const surface = editorSurface(page)
  await expect(surface).toBeVisible()
  await expect
    .poll(async () => surface.getAttribute('contenteditable'), { timeout: 10_000 })
    .toBe('true')
  await surface.click()
  await surface.pressSequentially(text, { delay: 20 })
  await expect(surface).toContainText(text, { timeout: 5_000 })
}

export async function waitForEditorSaved(page: Page): Promise<void> {
  await expect(page.getByTestId('editor-status')).toHaveText('Saved', { timeout: 10_000 })
}
