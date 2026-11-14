# Noto

[English](#english) · [Русский](#русский)

## English

[![CI](https://github.com/quisty1/vue-noto/actions/workflows/ci.yml/badge.svg)](https://github.com/quisty1/vue-noto/actions/workflows/ci.yml)
[![Deploy](https://github.com/quisty1/vue-noto/actions/workflows/deploy.yml/badge.svg)](https://github.com/quisty1/vue-noto/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

**Local-first notes and documents workspace** — hierarchical pages, rich editing, favorites, trash, snapshots, and portable JSON/Markdown export. Data stays in your browser (IndexedDB) until you choose to export.

Run the app locally with the instructions below. Use the [screenshot guide](docs/screenshots/README.md) to capture the workspace states.

---

### Features

- **Local-first persistence** — workspaces, pages, and snapshots stored in IndexedDB via Dexie
- **Hierarchical page tree** — nest, reorder, and drag pages in the sidebar
- **Rich text editor** — TipTap/ProseMirror with headings, lists, tasks, quotes, code, links, slash commands, and bubble menu
- **Autosave** — debounced saves with a live status indicator
- **Favorites & recent pages** — quick access from the sidebar
- **Soft delete & trash** — restore or permanently purge deleted pages
- **Version snapshots** — short history per page with restore
- **Command palette search** — find pages by title and plain text (`Ctrl/⌘ + K`)
- **Import / export** — workspace JSON backup and per-page Markdown export
- **Themes** — light, dark, and system preference (`data-theme` on `<html>`)
- **i18n** — English and Russian UI
- **Responsive layout** — desktop sidebar and mobile drawer
- **Onboarding** — optional demo workspace with sample pages

---

### Architecture

Noto follows **Feature-Sliced Design (FSD)** with clear layers: `app` → `pages` → `widgets` → `features` → `entities` → `shared`.

```mermaid
flowchart TB
  subgraph UI
    Pages[pages]
    Widgets[widgets]
    Features[features]
  end

  subgraph Domain
    Entities[entities]
    Shared[shared]
  end

  subgraph Runtime
    Router[Vue Router]
    Query[TanStack Query]
    Pinia[Pinia UI store]
    I18n[vue-i18n]
    DB[(IndexedDB / Dexie)]
  end

  Pages --> Widgets
  Pages --> Features
  Widgets --> Features
  Features --> Entities
  Entities --> Shared
  Features --> Shared
  Pages --> Router
  Features --> Query
  Features --> Pinia
  Entities --> DB
  Shared --> DB
  App[app bootstrap] --> Router
  App --> I18n
  App --> Query
  App --> Pinia
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for data flow, persistence, and state details.

---

### Project structure

```text
src/
  app/           # bootstrap, router, i18n, providers, global styles
  pages/         # route-level screens (workspace, onboarding, settings, trash)
  widgets/       # composed UI blocks (sidebar, header, editor workspace, palette)
  features/      # user scenarios (editor, page-tree, search, theme, locale, …)
  entities/      # domain models & repositories (workspace, page, snapshot)
  shared/        # UI kit, config, IndexedDB, utilities
e2e/             # Playwright end-to-end specs
docs/            # documentation assets (screenshots guide)
.storybook/      # Storybook for shared UI
.github/         # CI, deploy, issue/PR templates
```

---

### Tech stack

| Area         | Choice                                                |
| ------------ | ----------------------------------------------------- |
| UI           | Vue 3, TypeScript, Vite, SCSS modules                 |
| State / data | Pinia (UI session), TanStack Query, Dexie (IndexedDB) |
| Editor       | TipTap 2 / ProseMirror                                |
| Forms        | VeeValidate + Zod                                     |
| i18n         | vue-i18n (EN / RU)                                    |
| Testing      | Vitest + Vue Test Utils, Playwright                   |
| Quality      | ESLint, Prettier, Husky, commitlint, Storybook        |
| Delivery     | Docker (nginx), GitHub Actions, GitHub Pages          |

---

### Requirements

- **Node.js** ≥ 22 (see `.nvmrc`)
- npm (lockfile committed)

---

### Getting started

```bash
git clone https://github.com/quisty1/vue-noto.git
cd vue-noto
npm ci
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

#### Useful scripts

| Script                      | Description                                   |
| --------------------------- | --------------------------------------------- |
| `npm run dev`               | Vite development server                       |
| `npm run build`             | Typecheck + production build                  |
| `npm run preview`           | Preview the production build                  |
| `npm run lint` / `lint:fix` | ESLint                                        |
| `npm run format`            | Prettier write                                |
| `npm run typecheck`         | `vue-tsc`                                     |
| `npm run test`              | Vitest unit tests                             |
| `npm run test:coverage`     | Vitest with coverage                          |
| `npm run test:e2e`          | Playwright E2E (builds + previews on `:4173`) |
| `npm run storybook`         | Storybook on port 6006                        |

Environment variables are documented in [`.env.example`](./.env.example) (`VITE_BASE_URL`, `VITE_APP_TITLE`).

---

### Docker

Build and run the production image locally:

```bash
docker compose up --build
```

The app is served by nginx on **http://localhost:8080** (see `Dockerfile` and `docker/nginx.conf`). Health check: `/healthz`.

---

### Testing

- **Unit / component:** Vitest (`npm run test`, `npm run test:coverage`)
- **E2E:** Playwright specs in `e2e/*.spec.ts`
  - Each scenario clears `localStorage`, `sessionStorage`, and IndexedDB via `e2e/helpers.ts`
  - Stable selectors prefer `getByRole`, `getByLabel`, and `data-testid`
  - Install browsers once: `npx playwright install chromium`

```bash
npm run test:e2e
```

---

### Accessibility

- Semantic landmarks, labels, and dialogs for search and menus
- Icon-only controls expose accessible names (`aria-label`)
- Live region for autosave status (`role="status"`, `aria-live="polite"`)
- Keyboard support for command palette and dropdown menus
- Storybook a11y addon available for shared UI reviews

---

### Performance notes

- Route-level code splitting via dynamic imports in the router
- Debounced autosave (`AUTOSAVE_MS`) to limit IndexedDB writes
- Local-first model avoids network latency for CRUD
- Production build served as static assets (Vite + nginx)

_No fabricated Lighthouse scores are claimed in this README. Measure locally or in CI when you need numbers._

---

### CI / CD

- **CI** ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)): lint, typecheck, unit tests with coverage, production build, Storybook build, Playwright E2E
- **Deploy** ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)): publishes `dist` to GitHub Pages after a successful CI run on `main`/`master`
- **Dependabot** keeps npm and Actions dependencies current

---

### Roadmap

- [ ] Cloud sync / multi-device accounts (opt-in)
- [ ] Realtime collaboration
- [ ] Offline service worker / PWA install prompts
- [ ] Richer Markdown round-trip and attachments
- [ ] Shared templates gallery
- [ ] Additional locales

---

### Known limitations

- Data lives in the **browser profile**; clearing site data removes workspaces unless you export first
- No multi-user auth or server sync in v1
- Snapshots are capped per page; not a full version-control system
- Demo seed content is English-only
- Import size is bounded (see `MAX_IMPORT_BYTES` in import-export)

---

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Architecture details: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

### License

[MIT](./LICENSE) © 2026 Noto Contributors

## Русский

Локальное рабочее пространство для заметок и документов. В нём есть дерево страниц, редактор TipTap, поиск, избранное, корзина и снимки версий. Данные хранятся в IndexedDB текущего браузера. Экспортируйте резервную копию перед очисткой данных сайта или переносом на другое устройство.

### Локальный запуск

Требуются Node.js 22+ и npm:

```sh
npm ci
npm run dev
```

Откройте адрес от Vite и создайте рабочее пространство или загрузите учебные заметки. В меню доступны экспорт копии в JSON и страницы в Markdown. Поиск открывается по **Ctrl/⌘+K**; темы и язык можно изменить в настройках.

### Устройство и проверки

Vue 3, TypeScript и Vite; Dexie для IndexedDB, Pinia для состояния UI, TanStack Query для запросов к локальным репозиториям. Слои и потоки данных описаны в [ARCHITECTURE.md](ARCHITECTURE.md). Используйте `npm run typecheck`, `npm test`, `npm run build` и `npm run test:e2e`; для Playwright нужно предварительно установить браузеры. Лицензия — [MIT](LICENSE).
