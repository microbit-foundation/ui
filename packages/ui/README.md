# @microbit/ui

react-aria-components + Panda CSS primitives with a design language ported from
the Micro:bit Educational Foundation apps' original Chakra UI v2 themes.

The package **ships as source**: components import `styled-system/*`, which
each consumer generates with its own Panda preset stack. There is no build
step and no CSS shipped — the consumer's codegen produces exactly the styles
its tree uses.

## App-side installation

This package's own Storybook (`.storybook/` + `panda.config.ts`) is a
worked example of the setup below, minus the app/brand presets. Everything
an app must do:

1. **Panda preset stack** (`panda.config.ts`): `@pandacss/preset-base`, then
   the **base preset** (`@microbit/ui/base-preset` — the complete micro:bit
   design system , then optionally the app's own preset, then optionally a
   **private brand preset** (these are used for Foundation colours, licensed
   fonts).

   Later presets override earlier ones token-by-token — the base recipes and
   semantic tokens reference the brand tokens, which is how a brand swap
   restyles everything without touching recipes. Set `eject: true` (the stack
   supplies the full token system). After changing an _external_ preset
   dependency, regenerate clean: `rm -rf styled-system styled-system.css &&
npm run panda` — incremental codegen does not detect external preset
   changes.

2. **Include this package's source** in `panda.config.ts` so Panda extracts
   the styles the components use:
   ```ts
   include: [
     "./src/**/*.{ts,tsx}",
     "./node_modules/@microbit/ui/src/**/*.{ts,tsx}",
   ],
   ```
3. **Resolve `styled-system/*` onto the generated output** for all
   importers, this package's source included — a `styled-system` alias in
   both `tsconfig.json` `paths` and the bundler config (see the
   `viteFinal` in `.storybook/main.ts`).
4. **Cascade layers** (`src/layers.css`, imported first): declares the
   document-wide layer order including the `vendor` layer for third-party
   stylesheets — import any vendor CSS with `@import "..." layer(vendor)`
   so it beats the preflight but loses to app styling.
5. **react-intl**: an `IntlProvider` above any shared-ui usage. English
   works with no setup (components carry inline `defaultMessage`); for
   other locales merge this package's catalogs into the provider's
   `messages` (`import { messages } from "@microbit/ui/messages"`).
6. **`ToastProvider`** once near the root, inside the `IntlProvider`.
7. Optionally **`SharedUIProvider`** with an overlay-close registrar so the
   app can dismiss open menus from outside the tree (e.g. the Android
   hardware back button). Apps without one can omit the provider.

## The CSS-variable contract

Panda emits every token as a CSS custom property with its default naming —
`{category}-{path}` with dots become dashes, camelCase becomes kebab-case:

- `colors.brand.500` → `var(--colors-brand-500)`
- `colors.statusBarBg` → `var(--colors-status-bar-bg)`
- `fonts.display` → `var(--fonts-display)`

These names are **API** for styling that lives outside React/Panda — e.g.
CodeMirror highlight styles or xterm themes written as raw CSS. Two rules
keep them stable:

- Never set `hashing` or `prefix` in `panda.config.ts`.
- Brand/app presets may change token _values_, never token _names_.

Semantic tokens (`languageText`, `statusBarBg`, `danger.*`, `toast*Bg`,
`controlCheckedBg`, `focusBorder`, …) are the extension points brand presets
override; they resolve through var indirection, so overrides apply wherever
the token is consumed.

## Runtime token lookups

For values that feed _computation_ rather than stylesheets (canvas painting,
colour math, inline `style` for data-driven values — see gotcha #9 in
RAC-MIGRATION.md), import the runtime lookup:

```ts
import { token } from "@microbit/ui"; // re-exports styled-system/tokens

token("colors.brand.500"); // "#007dbc" — raw value, safe for colour math
token("colors.statusBarBg"); // "var(--colors-brand2-500)" — CSS contexts only
```

Base tokens resolve to raw values; **semantic tokens resolve to `var()`
references**, which are only meaningful where the browser interprets CSS.
For computation, look up the base token the semantic one points at, or read
the computed style. `token.var("colors.x.y")` returns the variable reference
form explicitly.

## Strings

Components never hardcode user-facing text. The few strings this package
needs internally (close-button labels, toast status announcements) are
react-intl messages with ids in the `ui.` namespace; everything else is
passed in by the caller as already-localized content.

The `lang/ui.<locale>.json` files (formatjs extracted format) are the source
of truth, compiled with `npm run i18n:compile` into
`src/messages/ui.<locale>.json` (formatjs AST, committed) and shipped via
the `@microbit/ui/messages` export. Components also carry the English text
inline as `defaultMessage`, so an app that merges no catalogs still renders
English.

`en` is hand-edited; `en-US` is maintained manually. Other locales come from
Crowdin via the repo-root `npm run update-translations -- <path to extracted
Crowdin ZIP>` (config-driven over packages in
`bin/update-translations.cjs`), after which you run `npm run i18n:compile`
from the root.
