# @microbit/ui

react-aria-components + Panda CSS primitives with a design language ported from
the Micro:bit Educational Foundation apps' original
[Chakra UI](https://chakra-ui.com/) v2 themes (see
[Chakra UI heritage](#chakra-ui-heritage-and-license)).

The package **ships as source**: components import `styled-system/*`, which
each consumer generates with its own Panda preset stack. There is no build
step and no CSS shipped — the consumer's Panda run produces exactly the styles
its tree uses (`panda codegen` for the `styled-system/*` helpers, the Panda
PostCSS plugin for the CSS).

## App-side installation

This package's own Storybook (`.storybook/` + `panda.config.ts`) is a
worked example of the setup below, minus the app/brand presets. Everything
an app must do:

1. **Panda preset stack** (`panda.config.ts`): `@pandacss/preset-base`, then
   the **base preset** (`@microbit/ui/base-preset` — the complete micro:bit
   design system), then optionally `@microbit/ui/dense-preset` (the × 0.88
   spacing / × 0.9 font-size density the information-dense apps use), then
   optionally the app's own preset, then optionally a **private brand
   preset** (Foundation colours, licensed fonts).

   Later presets override earlier ones token-by-token — the base recipes and
   semantic tokens reference the brand tokens, which is how a brand swap
   restyles everything without touching recipes. Set `eject: true` (the stack
   supplies the full token system). After changing an _external_ preset
   dependency, regenerate clean: `rm -rf styled-system && npm run panda` —
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
   both `tsconfig.json` `paths` and the bundler config (see the
   `viteFinal` in `.storybook/main.ts`).
4. **Generate and load the CSS** with Panda's PostCSS plugin. Keep Vite's
   default transformer — do **not** set `css.transformer: "lightningcss"`,
   which disables PostCSS. Add a `postcss.config.cjs`:

   ```js
   module.exports = { plugins: { "@pandacss/dev/postcss": {} } };
   ```

   Run `panda codegen` as a `prepare`/`predev` step so the `styled-system/*`
   helpers exist before `tsc`; the plugin generates the CSS during the bundle.
   Import **one** entry stylesheet — first, before app styles — that declares
   the cascade-layer order; the plugin injects the generated CSS into it (the
   declaration must list all of Panda's layers, hence ≥5 names):

   ```css
   /* e.g. src/layers.css, imported once at the app root */
   @layer reset, vendor, base, tokens, recipes, utilities;

   @import "@microbit/ui/reset.css" layer(reset);
   ```

   The `reset.css` import is **required**: it carries the Chakra-parity
   `* { border-color; word-wrap }` defaults, which must sit in the bottom
   layer (the legacy-Safari cascade-layer flattening specificity-boosts
   higher layers above CSS it can't see — runtime-injected styles, other
   files; playbook gotcha #28). Without it, elements that set a border
   width but no colour render `currentColor` borders.
   The `vendor` layer is for third-party stylesheets: import any vendor CSS
   with `@import "..." layer(vendor)` so it beats the preflight reset but
   loses to app styling. See `.storybook/{layers.css,preview.tsx,main.ts}` +
   `postcss.config.cjs` for the worked example.

5. **react-intl**: an `IntlProvider` above any shared-ui usage. English
   works with no setup (components carry inline `defaultMessage`); for
   other locales compile this package's `lang/ui.<locale>.json` into the
   app's per-locale catalogs as part of the app's formatjs compile step,
   e.g. `formatjs compile lang/ui.fr.json
node_modules/@microbit/ui/lang/ui.fr.json --ast --out-file ...` (multiple
   input files merge; ids are `ui.`-namespaced so they can't collide). This
   keeps the strings in the app's lazily loaded locale chunks rather than
   an eagerly bundled catalog-of-all-locales.
6. **`ToastProvider`** once near the root, inside the `IntlProvider`.
7. Optionally **`SharedUIProvider`** with an overlay-close registrar so the
   app can dismiss open menus from outside the tree (e.g. the Android
   hardware back button). Apps without one can omit the provider.

## Legacy browser support (Safari < 15) — temporary

Panda's output uses two things Safari below 15 mishandles. If an app must
support that far back (e.g. Safari 14.1 web views), add the app-side wiring
below. **All of it is meant to be deleted once the app's support floor rises
past these browsers** — it lives entirely in the consuming app's build config,
never in shipped component source. This package's own Storybook does _not_ use
any of it (it targets modern browsers, where these work natively).

Two concerns:

1. **`@layer`** — Safari < 15.4 drops `@layer` blocks wholesale, leaving the
   app unstyled. Flatten them with `@csstools/postcss-cascade-layers` (which
   rewrites layers into `:not(#\#)` specificity fallbacks; ~+8% gzipped CSS,
   mostly compressible).
2. **Logical shorthands + `var()`** — Safari 14.x silently drops
   `padding-inline: var(--…)` and friends (a literal value, or the -start/-end
   longhands, both work). Panda emits these shorthands for its px/py/mx/my
   utilities, so most token spacing collapses. Expand them to longhands with
   this package's `postcss-legacy-safari` plugin (kept logical, so RTL flips).

```bash
npm i -D @csstools/postcss-cascade-layers
```

```js
// postcss.config.cjs — the two legacy plugins run AFTER Panda's (step 4), so
// switch that config to array form:
const {
  expandLogicalShorthands,
} = require("@microbit/ui/postcss-legacy-safari");

module.exports = {
  plugins: [
    require("@pandacss/dev/postcss")(),
    expandLogicalShorthands(),
    require("@csstools/postcss-cascade-layers"),
  ],
};
```

```ts
// vite.config.ts — pin the CSS/JS floor. Otherwise the lightningcss minifier
// inherits build.target and downlevels logical longhands into fragile
// :lang()-based physical rules. Keep in sync with package.json "browserslist".
const BUILD_TARGETS = ["safari14.1", "ios14.5", "chrome90", "edge90", "firefox88"];
// ...
build: {
  target: BUILD_TARGETS,
  cssTarget: BUILD_TARGETS,
  cssMinify: "lightningcss", // lightningcss as minifier only, not the transformer
},
```

To drop it all: raise `BUILD_TARGETS`/`browserslist` past the affected
browsers, then remove the two PostCSS plugins (and this package's
`postcss-legacy-safari` export).

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
`button.*`, `controlCheckedBg`, `focusBorder`, …) are the extension points
brand presets override; they resolve through var indirection, so overrides
apply wherever the token is consumed.

## Runtime token lookups

For values that feed _computation_ rather than stylesheets (canvas painting,
colour math, inline `style` for data-driven values — see gotcha #9 in the
repo's [migration playbook](../../docs/migration-playbook.md)), import the
runtime lookup:

```ts
import { token } from "@microbit/ui"; // re-exports styled-system/tokens

token("colors.brand.500"); // "#007dbc" — raw value, safe for colour math
token("colors.statusBarBg"); // "var(--colors-gray-500)" — CSS contexts only
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
of truth and are shipped as-is (exported at `./lang/*`); consuming apps
compile them into their own per-locale catalogs (see the consumption setup
above). Components also carry the English text inline as `defaultMessage`,
so an app that compiles no catalogs still renders English.

`en` is hand-edited; `en-US` is maintained manually. Other locales come from
Crowdin via the repo-root `npm run update-translations -- <path to extracted
Crowdin ZIP>` (config-driven over packages in
`bin/update-translations.cjs`), after which you run `npm run i18n:tidy`
from the root.

## Chakra UI heritage and license

This package's design language began as a faithful port of
[Chakra UI](https://chakra-ui.com/) v2's, done so the apps it serves could
leave Chakra without a redesign: `src/base-tokens.ts` was snapshotted from
`@chakra-ui/theme`'s default token scales, and the `*.recipe.ts` files were
ported from Chakra's component styles onto Panda config recipes.
However far it evolves from that starting point, it owes its foundations to
Chakra. Thanks to Segun Adebayo and the Chakra UI contributors.

The package is [MIT](LICENSE.md) © Micro:bit Educational Foundation and
contributors; Chakra UI is MIT © Segun Adebayo, and its notice is carried
in [LICENSE.md](LICENSE.md).
