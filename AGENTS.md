# AI agent notes

- **Read `docs/hints.md` before component or styling work** — Panda
  extraction rules, cascade/recipe traps and RAC behaviours that fail
  silently. `packages/ui/README.md` holds the consumption setup and the
  CSS-variable contract (token names are API).
- Storybook is the dev harness: `npm run storybook`; CI is `npm run ci`
  (typecheck + lint + tests + build-storybook). Every story is also a
  test (`npm test -w @microbit/ui-storybook`, headless Chromium): it must
  render, pass its play function and have no axe violations (colour
  contrast is review-only for now; see `preview.tsx`). Opt a story out
  of a rule with `parameters.a11y.config.rules`, not by disabling the
  test.
- Run `npm run format` (Prettier) after making changes.
- New files take a copyright header with the current year (2026):
  `(c) 2026, Micro:bit Educational Foundation and contributors` +
  `SPDX-License-Identifier: MIT` — copy from an existing file.
