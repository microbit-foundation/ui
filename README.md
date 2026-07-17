# micro:bit UI

Design-system monorepo for micro:bit web apps: react-aria-components for
behaviour/accessibility and Panda CSS for styling, with a design language
ported from the apps' Chakra UI v2 themes.

Extracted from [ml-trainer](https://github.com/microbit-foundation/ml-trainer)
(see its RAC-MIGRATION.md for the migration and extraction history).

## Packages

- [`@microbit/ui`](./packages/ui) — the component library and its Panda
  presets: the brand-agnostic core preset (`@microbit/ui/panda-preset`) and
  the micro:bit house vocabulary layered over it
  (`@microbit/ui/microbit-preset`, OSS placeholder brand values — private
  brand presets override the colour ramps and display font). Ships as
  source; see the package README for the consumption setup (preset stack,
  `styled-system` alias, cascade layers, react-intl messages).

## Apps

- [`apps/demo`](./apps/demo) — a kitchen-sink Vite app that consumes the
  packages the way a real app does. It is the reference consumption setup and
  the CI build target.

## Development

```bash
npm install
npm run dev        # demo app
npm run typecheck  # all workspaces
npm run format
```

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.
