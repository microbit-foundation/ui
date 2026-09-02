# @microbit/ui-patterns

Higher-level UI patterns for micro:bit web apps, composed from
[`@microbit/ui`](../ui) primitives. Where `@microbit/ui` provides the
design-system building blocks (buttons, fields, overlays), this package holds
the larger assemblies apps share — recurring page furniture built from those
blocks.

## What's here

- **`LanguageDialog`** — the language settings dialog every app in the family
  carries: a grid of language cards (endonym over English name), split into
  fully/partially supported sections derived from per-language support
  checklists (a language with any unsupported product is partial),
  with a per-product support tooltip and toast, an optional preview footnote,
  an optional "Help translate" footer link, and a primary Close button.
  Selection applies immediately and the dialog closes; state stays with the
  app (props and callbacks only, no store). Endonyms carry `lang`/`dir`
  attributes — with the card's accessible name wired via `aria-labelledby` —
  so assistive tech pronounces them correctly.
- **`languages`** — the family name-book: every language any micro:bit app
  lists, as `{ id, name, enName }` with canonical BCP 47 ids (which are also
  the family's Crowdin codes). Apps indicate support by id — the
  `KnownLanguageId` union makes a typo or mis-cased id a compile error.
- **`getDefaultLanguageId`** — first-run language selection: BCP 47 best-fit
  matching of a `?l=` URL hint and the browser/OS preferences against the ids
  the app allows to be auto-selected. The candidate set is the app's call —
  pass a narrowed set where landing a user in a language silently would be
  wrong (e.g. incomplete native-app translations).

(`<html lang>` needs nothing from this package: `@microbit/ui`'s
`SharedUIProvider` keeps it in step with the locale automatically.)

## Consumption

Like `@microbit/ui`, this package **ships as source** — TypeScript compiled
and style-extracted by the consuming app's build. Set up `@microbit/ui` first
(preset stack, `styled-system` alias, cascade layers — see its
[README](../ui/README.md)), then:

1. Install the package. `@microbit/ui` is a peer dependency, so both must be
   installed; keep them upgraded together. The peer range tracks the
   `@microbit/ui` minor this release was built against — a caret on a `0.x`
   version pins the minor, so each new `@microbit/ui` minor needs a matching
   `@microbit/ui-patterns` release. `react-icons` and `react-intl` are peers
   too, matching `@microbit/ui`'s expectations.
2. Add this package's sources to your Panda `include`, alongside the
   `@microbit/ui` glob:

   ```ts
   include: [
     "./src/**/*.{ts,tsx}",
     "./node_modules/@microbit/ui/src/**/*.{ts,tsx}",
     "./node_modules/@microbit/ui-patterns/src/**/*.{ts,tsx}",
   ],
   ```

   Miss the glob and the components render unstyled: Panda never sees their
   style calls, and there is no error.

3. **Strings**: compile `lang/ui.<locale>.json` into your per-locale catalogs
   exactly as you do `@microbit/ui`'s (message ids are namespaced
   `ui-patterns.`). English needs no catalog — components carry inline
   `defaultMessage`s.

## Development

Stories live in `stories/` here but are rendered by the repo's Storybook
harness, [`apps/storybook`](../../apps/storybook), whose config globs this
package — one harness for the whole family. Run it from the repo root:

```bash
npm run storybook
```

`npm run typecheck -w @microbit/ui-patterns` generates this package's own
`styled-system/` output (from the same base preset) and runs `tsc`;
`npm run test -w @microbit/ui-patterns` runs the vitest suite.

## Releases

Create a GitHub release with a tag of the form `ui-patterns-vX.Y.Z`
(e.g. `ui-patterns-v0.1.0-alpha.1`). The build workflow routes the release to
this package by the tag prefix and publishes it. This package is versioned
independently of `@microbit/ui`.

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.
