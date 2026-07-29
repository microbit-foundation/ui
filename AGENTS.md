# AI agent notes

- **Read `docs/migration-playbook.md` before component or styling work** —
  the gotcha catalog (Panda extraction rules, CSS layers, RAC behaviours)
  applies to library code too, and the family roadmap says what belongs in
  the library vs app-side. `packages/ui/README.md` holds the consumption
  setup and the CSS-variable contract (token names are API).
- Storybook is the dev harness: `npm run storybook`; CI is `npm run ci`
  (typecheck + build-storybook).
- Run `npm run format` (Prettier) after making changes.
- New files take a copyright header with the current year (2026):
  `(c) 2026, Micro:bit Educational Foundation and contributors` +
  `SPDX-License-Identifier: MIT` — copy from an existing file.
