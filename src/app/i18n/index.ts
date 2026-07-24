/**
 * vue-i18n instance (en / ru); active locale is bound via useLocale
 */
import en from './locales/en.json'
import ru from './locales/ru.json'

import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ru },
})

export default i18n
