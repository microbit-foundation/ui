# @microbit/ui-code-view

Read-only, syntax-highlighted code views for micro:bit web apps, styled to
match the editors the code comes from. Successor to
`@microbit-foundation/react-code-view`.

## What's here

- **`PythonEditorCodeView`** — Python, styled like the micro:bit Python
  Editor.
- **`MakeCodeJavaScriptCodeView`** — MakeCode JavaScript, styled like
  MakeCode's JavaScript view.

Both take a `code` prop and show line numbers. An optional `className` goes on
the outermost element, for example to make the background transparent.
Highlighting is done by [highlight.js](https://highlightjs.org/), which is a
regular dependency.

The view is always left to right (`dir="ltr"`), whatever the page direction,
and marked `translate="no"` so browser translation leaves the code alone.
While the code is too wide for the view, it is a focusable group named
"Python code" or "JavaScript code", so keyboard users can scroll it; code
that fits adds no tab stop. Line numbers are hidden from screen readers.

## Consumption

Unlike the other packages in this repo, this one **ships built** (ES modules
plus type declarations) and is styled by a **plain stylesheet**, so it works
in apps with or without Panda CSS. It supports React 17, 18 and 19, and
needs `react-intl` (6 or 7), a peer dependency, for its accessible names.

1. Install the package, and `react-intl` if the app doesn't already have it.
2. Import the stylesheet once.

   In an app set up as the [`@microbit/ui` README](../ui/README.md)
   describes, import it into the `vendor` cascade layer of your entry
   stylesheet, so it beats Panda's preflight but loses to your own styling:

   ```css
   @layer reset, vendor, base, tokens, recipes, utilities;

   @import "@microbit/ui/reset.css" layer(reset);
   @import "@microbit/ui-code-view/style.css" layer(vendor);
   ```

   Elsewhere, import it as you would any other stylesheet:

   ```ts
   import "@microbit/ui-code-view/style.css";
   ```

3. Render the components:

   ```tsx
   import { PythonEditorCodeView } from "@microbit/ui-code-view";

   <PythonEditorCodeView code={"from microbit import *\n"} />;
   ```

   They must be inside an `IntlProvider`.

4. **Strings**: the components carry no inline English, so compile this
   package's catalogs into your per-locale catalogs alongside your own,
   **English included** (message ids are namespaced `ui-code-view.`). With
   [`@microbit/i18n-tools`](../i18n-tools), list the package in your catalog
   config and `microbit-i18n compile` merges it, backfilling English for
   locales without a translation:

   ```js
   catalogs: [
     {
       source: "lang/ui.en.json",
       out: "app/messages/ui.{lang}.json",
       packages: ["@microbit/ui-code-view"],
     },
   ],
   ```

   Without the catalog, the accessible names render as message ids.

The stylesheet loads Source Code Pro from `fonts.microbit.org` for the Python
view. Its class names (`mb-code-view…` and highlight.js's `hljs-…`) are part
of this package's API.

## Colours

The Python view's syntax colours are CSS variables shared with the Python
Editor's CodeMirror theme:

| Variable                    | Used for                         | OSS default            |
| --------------------------- | -------------------------------- | ---------------------- |
| `--colors-code-default`     | Plain text                       | `black`                |
| `--colors-code-keyword`     | Keywords                         | `darkblue`             |
| `--colors-code-string`      | Strings                          | `green`                |
| `--colors-code-comment`     | Comments                         | `gray`                 |
| `--colors-code-literal`     | `True`, `False`, `None`, numbers | `darkgreen`            |
| `--colors-code-line-number` | Line numbers                     | `#b4b4b4` (`gray.350`) |

In a Panda app they come from the `code.*` tokens in `@microbit/ui`'s base
preset, so a brand preset that sets those tokens restyles this view and the
editor together. Without Panda, the stylesheet falls back to the OSS defaults;
set the variables in your own CSS (for example on `:root`) to change them.

The MakeCode view's colours are fixed: they copy MakeCode's own look.

## Migrating from `@microbit-foundation/react-code-view`

- `PythonCodeRendering` is now `PythonEditorCodeView`, and
  `MakeCodeJavaScriptRendering` is now `MakeCodeJavaScriptCodeView`.
- The stylesheet is `@microbit/ui-code-view/style.css`.
- The components now need an `IntlProvider` and this package's compiled
  catalogs (see [Consumption](#consumption)).
- Style the view through `className` rather than by targeting its inner
  elements. The old package rendered a single `<pre>`; the new markup is
  different, so selectors such as `& pre` no longer reach the background.
- The Python view's colours are now the OSS defaults unless the app sets
  them (see [Colours](#colours)). To keep the micro:bit palette, set the
  `code.*` tokens in your brand preset or the variables in your CSS.
- Line numbers stay in place when long lines scroll sideways.
- The view has no outer margin. The old one rendered a bare `<pre>`, so it
  picked up the browser's default margin unless the app reset it.

## Development

Stories live in `stories/` here but are rendered by the repo's Storybook
harness, [`apps/storybook`](../../apps/storybook). Run it from the repo root:

```bash
npm run storybook
```

`npm run build -w @microbit/ui-code-view` compiles to `dist/`; it also runs on
`npm install` and before packing.

## Releases

Create a GitHub release with a tag of the form `ui-code-view-vX.Y.Z`. The
build workflow routes the release to this package by the tag prefix and
publishes it. This package is versioned independently of `@microbit/ui`.

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.
