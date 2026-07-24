/// <reference types="vite/client" />

/** Ambient types for Vite env, Vue SFCs, and SCSS modules */

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  /** Public base path (e.g. `/noto/` for GitHub Pages) */
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.scss' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}
