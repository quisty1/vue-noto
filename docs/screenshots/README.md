# Screenshots

Product screenshots referenced from the root [README.md](../../README.md) live in this folder.

## Expected files

| File             | Suggested capture                                     |
| ---------------- | ----------------------------------------------------- |
| `workspace.png`  | Desktop workspace with sidebar + editor (light theme) |
| `onboarding.png` | First-run onboarding form                             |
| `search.png`     | Command palette open with results                     |
| `settings.png`   | Settings appearance / data section                    |
| `mobile.png`     | Viewport ~375×812 with drawer open                    |

Filenames above are recommendations. Update README image paths if you use different names.

## How to capture

1. Start the app: `npm run dev` (or `npm run build && npm run preview`)
2. Complete onboarding with **Load demo content** for a realistic tree
3. Use a clean browser profile or private window so chrome UI does not clutter the shot
4. Capture at a consistent width (for example 1440×900 desktop, 375×812 mobile)
5. Prefer PNG; avoid heavy compression that blurs text
6. Do **not** invent marketing GIFs or fake performance badges for the README

### Playwright helper (optional)

```bash
npx playwright screenshot http://localhost:4173 docs/screenshots/workspace.png --viewport-size=1440,900
```

Ensure the app is running and onboarding is already complete in that browser context, or script storage seeding yourself.

## Checklist before committing images

- [ ] No personal data or real secrets in page content
- [ ] UI language matches the README audience (English default)
- [ ] Cropped consistently; no accidental OS notifications
- [ ] Files are reasonably sized (aim under ~1 MB each)
