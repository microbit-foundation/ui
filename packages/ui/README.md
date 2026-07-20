# @microbit/ui

react-aria-components + Panda CSS primitives with a design language ported
from the micro:bit Foundation apps' Chakra UI v2 themes. Visuals match the
Chakra v2 theme; behaviour follows react-aria patterns. Extracted from
[ml-trainer](https://github.com/microbit-foundation/ml-trainer) — see its
RAC-MIGRATION.md for the migration history, conventions and hard-won gotchas
(start with "Styles must be literals").

The package **ships as source**: components import `styled-system/*`, which
each consumer generates with its own Panda preset stack. There is no build
step and no CSS shipped — the consumer's codegen produces exactly the styles
its tree uses.

## App-side installation

The [demo app](../../apps/demo) is the reference setup. Everything an app
must do:

1. **Panda preset stack** (`panda.config.ts`): `@pandacss/preset-base`, then
   the brand-agnostic core preset (`@microbit/ui/panda-preset`), then the
   micro:bit foundation preset (`@microbit/ui/microbit-preset` — the
   house vocabulary the family's app censuses found in every app: pill
   `radii.button`, `outline*` focus shadows, Helvetica with a `display`
   marketing-font slot, the `language`/`toolbar` button variants, toast
   status colours, the status-bar background; brand values are OSS
   placeholders), then the app preset, then an optional private brand
   preset. Later presets override earlier ones token-by-token — core
   recipes consume tokens whose values the outer presets define, which is
   how private brand presets restyle everything without touching recipes. `eject: true` (the stack supplies the full token
   system). After changing an _external_ preset dependency, regenerate
   clean: `rm -rf styled-system src/styled-system.css && npm run panda` —
   incremental codegen does not detect external preset changes.
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
   both `tsconfig.json` `paths` and the bundler config (see the demo app's
   `vite.config.ts`).
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

Translations follow the ml-trainer pipeline shape: `lang/ui.<locale>.json`
files (formatjs extracted format) are the source of truth, compiled with
`npm run i18n:compile` into `src/messages/ui.<locale>.json` (formatjs AST,
committed) and shipped via the `@microbit/ui/messages` export. Components
also carry the English text inline as `defaultMessage`, so an app that
merges no catalogs still renders English.

`en` is hand-edited; `en-US` is maintained manually. Other locales come
from Crowdin via the repo-root `npm run update-translations -- <path to
extracted Crowdin ZIP>` (config-driven over packages in
`bin/update-translations.cjs`), after which you run `npm run i18n:compile`
(root, across packages). Adding or changing a message before Crowdin has
the translation means editing every `lang/*.json` (English text stands in)
and recompiling. The Crowdin project itself is not wired up yet — the
export path in the script is a placeholder.
