# micro:bit UI

Design-system monorepo for micro:bit web apps: react-aria-components for
behaviour/accessibility and Panda CSS for styling, with a design language
ported from the apps' Chakra UI v2 themes.

Extracted from [ml-trainer](https://github.com/microbit-foundation/ml-trainer)
(see its RAC-MIGRATION.md for the migration and extraction history).

## Packages

One package for now:

- [`@microbit/ui`](./packages/ui) — the component library. It also exposes,
  as subpath exports, the two Panda presets that style the components: the
  brand-agnostic core preset (`@microbit/ui/panda-preset`) and the micro:bit
  house vocabulary layered over it (`@microbit/ui/microbit-preset`, OSS
  placeholder brand values — private brand presets override the colour ramps
  and display font). Ships as source; see the package README for the
  consumption setup (preset stack, `styled-system` alias, cascade layers,
  react-intl messages).

(The monorepo layout anticipates more packages later — see ml-trainer's
RAC-MIGRATION.md extraction plan.)

## Storybook

Components are developed and browsed in Storybook, which lives in
`packages/ui` (config in `.storybook/`, stories in `packages/ui/stories/`).
It assembles the core + micro:bit foundation preset stack (OSS placeholder
brand values, so it shows the foundation look rather than a private brand)
and is the CI build target.

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
