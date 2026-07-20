# micro:bit UI

**Experimental/WIP**

Design-system monorepo for micro:bit web apps: react-aria-components for
behaviour/accessibility and Panda CSS for styling, with a design language
ported from the apps' Chakra UI v2 themes.

Extracted from [ml-trainer](https://github.com/microbit-foundation/ml-trainer)
(see its RAC-MIGRATION.md for the migration and extraction history).

## Packages

One package for now:

- [`@microbit/ui`](./packages/ui) — the component library. It also exposes,
  as a subpath export, the **base preset** (`@microbit/ui/base-preset`): the
  complete micro:bit design system (Chakra scales, recipes, the micro:bit
  house vocabulary, and OSS default brand values). Used alone it renders in
  the OSS default look; a private brand preset (a sibling repo) merged after
  it overrides the `brand`/`brand2` ramps and `display` font for branded
  builds. Ships as source; see the package README for the consumption setup
  (preset stack, `styled-system` alias, cascade layers, react-intl
  messages).

(The monorepo layout anticipates more packages later — see ml-trainer's
RAC-MIGRATION.md extraction plan.)

## Storybook

Components are developed and browsed in Storybook, which lives in
`packages/ui` (config in `.storybook/`, stories in `packages/ui/stories/`).
It uses the base preset alone, so it shows the components in the OSS default
look (Chakra blue/gray) rather than a private brand, and is the CI build
target.

## Development

```bash
npm install
npm run storybook        # component browser
npm run build-storybook  # static build (CI target)
npm run typecheck        # all workspaces
npm run format
```

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.

## Code of Conduct

Trust, partnership, simplicity and passion are our core values we live and
breathe in our daily work life and within our projects. Our open-source
projects are no exception. We have an active community which spans the globe
and we welcome and encourage participation and contributions to our projects
by everyone. We work to foster a positive, open, inclusive and supportive
environment and trust that our community respects the micro:bit code of
conduct. Please see our [code of conduct](https://microbit.org/safeguarding/)
which outlines our expectations for all those that participate in our
community and details on how to report any concerns and what would happen
should breaches occur.
