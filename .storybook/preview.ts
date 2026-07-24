/**
 * Storybook preview: global styles, theme toolbar, a11y defaults
 */
import type { Preview } from '@storybook/vue3-vite'

import '@app/styles/index.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Track violations without failing the storybook build yet
      test: 'todo',
    },
    layout: 'centered',
    // Theme decorator owns background via CSS variables
    backgrounds: {
      disable: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      // Mirror app theme attribute used by design tokens
      const theme = (context.globals.theme as string) || 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.style.colorScheme = theme
        document.body.style.background = 'var(--noto-color-bg)'
        document.body.style.color = 'var(--noto-color-ink)'
        document.body.style.minHeight = '100vh'
      }
      return {
        components: { story },
        template: '<story />',
      }
    },
  ],
}

export default preview
