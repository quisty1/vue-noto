/**
 * App entry: wire Pinia, router, i18n, Vue Query, then mount
 */
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import { bindI18n } from '@features/locale'
import { useTheme } from '@features/theme'

import App from './App.vue'
import { bootstrapApp } from './bootstrap'
import i18n from './i18n'
import { installGlobalErrorHandler } from './providers/error-handler'
import { createAppQueryClient } from './providers/query-client'
import router from './router'
import './styles/index.scss'

async function main(): Promise<void> {
  const app = createApp(App)
  const pinia = createPinia()
  const queryClient = createAppQueryClient()

  // Locale / theme must bind before first paint consumers run
  bindI18n(i18n)
  useTheme()

  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(VueQueryPlugin, { queryClient })
  installGlobalErrorHandler(app)

  await bootstrapApp()

  app.mount('#app')
}

void main()
