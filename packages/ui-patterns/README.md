# @microbit/ui-patterns

Higher-level UI patterns for micro:bit web apps, composed from
[`@microbit/ui`](../ui) primitives. Where `@microbit/ui` provides the
design-system building blocks (buttons, fields, overlays), this package holds
the larger assemblies apps share — recurring page furniture built from those
blocks.

The package currently contains only `PatternsDemo`, a placeholder that proves
the packaging: it composes an `@microbit/ui` component and carries its own
Panda styles. It will be deleted when the first real pattern lands.

## Consumption

Like `@microbit/ui`, this package **ships as source** — TypeScript compiled
and style-extracted by the consuming app's build. Set up `@microbit/ui` first
(preset stack, `styled-system` alias, cascade layers — see its
[README](../ui/README.md)), then:

1. Install the package. `@microbit/ui` is a peer dependency, so both must be
   installed; keep them upgraded together. The peer range is deliberately
   `*`: it is the one range npm accepts both for the published prerelease
   versions (a normal semver range refuses to match another package's
   prereleases) and for the in-repo workspace copy, which sits at `0.0.0`.
   Apps pin exact versions anyway.
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

## Development

Stories live in `stories/` here but are rendered by the repo's Storybook
harness, [`apps/storybook`](../../apps/storybook), whose config globs this
package — one harness for the whole family. Run it from the repo root:

```bash
npm run storybook
```

`npm run typecheck -w @microbit/ui-patterns` generates this package's own
`styled-system/` output (from the same base preset) and runs `tsc`.

## Releases

Create a GitHub release with a tag of the form `ui-patterns-vX.Y.Z`
(e.g. `ui-patterns-v0.1.0-alpha.1`). The build workflow routes the release to
this package by the tag prefix and publishes it. This package is versioned
independently of `@microbit/ui`.

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.
