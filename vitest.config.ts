/**
 * Vitest unit tests: jsdom, FSD aliases, focused coverage thresholds
 */
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
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
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Limit gates to core domain / shared logic, not every UI file
      include: [
        'src/entities/page/model/**/*.ts',
        'src/entities/page/api/page-repository.ts',
        'src/entities/workspace/model/**/*.ts',
        'src/entities/snapshot/model/**/*.ts',
        'src/features/import-export/model/**/*.ts',
        'src/features/import-export/lib/export-markdown.ts',
        'src/features/import-export/lib/import-markdown.ts',
        'src/features/editor/model/useAutosave.ts',
        'src/features/theme/model/useTheme.ts',
        'src/features/locale/model/useLocale.ts',
        'src/features/search/model/highlight.ts',
        'src/shared/lib/markdown/**/*.ts',
        'src/shared/ui/Button/Button.vue',
        'src/shared/ui/Input/Input.vue',
      ],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
})
