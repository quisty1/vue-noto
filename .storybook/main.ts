/**
 * Storybook (Vue 3 + Vite): story globs and FSD aliases via viteFinal
 */
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import type { StorybookConfig } from '@storybook/vue3-vite'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')

    // Align Storybook Vite resolve with app vite.config.ts
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@app': path.resolve(rootDir, 'src/app'),
          '@pages': path.resolve(rootDir, 'src/pages'),
          '@widgets': path.resolve(rootDir, 'src/widgets'),
          '@features': path.resolve(rootDir, 'src/features'),
          '@entities': path.resolve(rootDir, 'src/entities'),
          '@shared': path.resolve(rootDir, 'src/shared'),
        },
      },
    })
  },
}

export default config
