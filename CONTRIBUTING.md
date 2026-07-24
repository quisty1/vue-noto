# Contributing to Noto

Thanks for helping improve Noto. This guide covers local setup, coding standards, commits, and pull requests.

## Code of conduct

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By contributing, you agree to uphold it.

## Prerequisites

- Node.js **22+** (matches `.nvmrc`)
- npm
- For E2E: Playwright browsers (`npx playwright install chromium`)

## Setup

```bash
git clone https://github.com/PLACEHOLDER_GITHUB_OWNER/noto.git
cd noto
npm ci
npm run dev
```

Optional checks before opening a PR:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Project conventions

- Follow **Feature-Sliced Design** boundaries described in [ARCHITECTURE.md](./ARCHITECTURE.md)
- Prefer existing shared UI (`@shared/ui`) over one-off controls
- Keep comments short; no trailing periods in code comments (project style)
- Use TypeScript strictly; avoid `any` unless justified
- Add `data-testid` only where E2E needs stable hooks that roles/labels cannot cover
- Do not commit secrets, `.env` with real values, or generated `dist/` / coverage artifacts

## Branching

1. Fork (or create a branch from `main` / `master`)
2. Use a descriptive branch name: `feat/command-palette-a11y`, `fix/autosave-race`, `docs/readme-demo-link`
3. Keep PRs focused; split unrelated changes when possible

## Commit messages (Conventional Commits)

This repository uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint + Husky.

Format:

```text
type(scope): short summary

optional body
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Examples:

```text
feat(editor): show saved status after autosave flush
fix(trash): restore page into previous parent
docs(readme): document docker compose healthcheck
test(e2e): cover locale switch to Russian
```

## Pull request process

1. Ensure lint, typecheck, unit tests, and relevant E2E scenarios pass locally
2. Fill out the PR template (summary + test plan)
3. Link related issues when applicable
4. Keep the diff reviewable; include screenshots for UI changes when helpful (`docs/screenshots/`)
5. Request review; address feedback with new commits (avoid force-pushing shared branches unless agreed)
6. Squash or rebase only if maintainers ask and it is safe

CI must be green before merge (see `.github/workflows/ci.yml`).

## Reporting bugs / proposing features

Use the GitHub issue templates under `.github/ISSUE_TEMPLATE/`. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser / OS
- Whether data was exported / imported

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
