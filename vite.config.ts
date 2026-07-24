/**
 * Vite app config: Vue plugin, FSD path aliases, env-based base URL
 */
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  // Empty prefix loads all env keys (needed for VITE_BASE_URL in base)
  const env = loadEnv(mode, rootDir, '')

  return {
    // Supports GitHub Pages subpath deploys via VITE_BASE_URL
    base: env.VITE_BASE_URL || '/',
    plugins: [vue()],
    resolve: {
      // Mirrors tsconfig paths for Feature-Sliced Design layers
      alias: {
        '@app': path.resolve(rootDir, 'src/app'),
        '@pages': path.resolve(rootDir, 'src/pages'),
        '@widgets': path.resolve(rootDir, 'src/widgets'),
        '@features': path.resolve(rootDir, 'src/features'),
        '@entities': path.resolve(rootDir, 'src/entities'),
        '@shared': path.resolve(rootDir, 'src/shared'),
      },
    },
    server: {
      port: 5173,
      // Bind all interfaces for Docker / LAN access
      host: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      cssCodeSplit: true,
    },
  }
})
