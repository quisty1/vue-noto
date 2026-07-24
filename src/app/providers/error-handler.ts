/**
 * Global Vue / window error logging (no remote reporting yet)
 */
import type { App } from 'vue'

export function installGlobalErrorHandler(app: App): void {
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Noto]', info, err, instance)
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Noto] Unhandled rejection', event.reason)
  })
}
