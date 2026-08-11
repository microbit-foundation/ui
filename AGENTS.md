# AI agent notes

- **Read `docs/hints.md` before component or styling work** — Panda
  extraction rules, cascade/recipe traps and RAC behaviours that fail
  silently. `packages/ui/README.md` holds the consumption setup and the
  CSS-variable contract (token names are API).
- Storybook is the dev harness: `npm run storybook`; CI is `npm run ci`
  (typecheck + build-storybook).
- Run `npm run format` (Prettier) after making changes.
- New files take a copyright header with the current year (2026):
  `(c) 2026, Micro:bit Educational Foundation and contributors` +
  `SPDX-License-Identifier: MIT` — copy from an existing file.
