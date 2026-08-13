# micro:bit UI

Design-system monorepo for micro:bit web apps: react-aria-components for
behaviour/accessibility and Panda CSS for styling, with a design language
ported from the apps' [Chakra UI](https://chakra-ui.com/) v2 themes (see
[Chakra UI heritage](#chakra-ui-heritage)).

Extracted from [ml-trainer](https://github.com/microbit-foundation/ml-trainer),
the first app in the family to adopt it.

## Planned breaking changes

This is a first pass version that allows for a very close fidelity for the Foundation's apps.

We're going to evolve this in some significant and breaking ways:

- Switch to role based colour tokens to improve theming options
- Review of where we're not making the most of the underlying components (as the port has focused on enabling fidelity to existing Chakra themes)
- Integration of feedback from an accessibility review

It will be a while before this settles down as a component API, but in the short term there will be churn in design tokens too as we work through the above.

## Packages

- [`@microbit/ui`](./packages/ui) — the component library. It also exposes,
  as a subpath export, the **base preset** (`@microbit/ui/base-preset`): the
  complete micro:bit design system (Chakra scales, recipes, the micro:bit
  house vocabulary, and OSS default brand values). Used alone it renders in
  the OSS default look; a private brand preset (a sibling repo) merged after
  it overrides the `brand`/`brand2` ramps and `display` font for branded
  builds. Ships as source; see the package README for the consumption setup
  (preset stack, `styled-system` alias, cascade layers, react-intl
  messages).
- [`@microbit/ui-patterns`](./packages/ui-patterns) — higher-level patterns
  composed from `@microbit/ui` primitives. Also ships as source, consumed
  the same way; `@microbit/ui` is a peer dependency.

## Releases

Packages are versioned independently. To release one, create a GitHub
release whose tag carries the package's prefix — `ui-vX.Y.Z` or
`ui-patterns-vX.Y.Z` (bare `vX.Y.Z` still means `@microbit/ui`, the
pre-monorepo convention). The build workflow routes the release to the
package by prefix, derives the npm version from the tag's numeric part, and
publishes that package alone; an unrecognised prefix fails the build.

## Storybook

Components are developed and browsed in Storybook. The harness is its own
private workspace, [`apps/storybook`](./apps/storybook), which depends on
every package; stories stay next to the package they exercise (e.g.
`packages/ui/stories/`) and are globbed in from there. It uses the base
preset alone, so it shows the components in the OSS default look (Chakra
blue/gray) rather than a private brand, and is the CI build target.

## Development

```bash
npm install
npm run storybook        # component browser
npm run build-storybook  # static build (CI target)
npm run typecheck        # all workspaces
npm run format
```

## Chakra UI heritage

The micro:bit apps this library serves were built on
[Chakra UI](https://chakra-ui.com/) v2 for years, and this library began as
a faithful port of their look and feel so they could move to
react-aria-components + Panda CSS without a redesign: the token scales were
snapshotted from `@chakra-ui/theme`'s defaults, and the component recipes
ported from Chakra's component styles. However far the design system evolves
from that starting point, it owes its foundations to Chakra. Thanks to
Segun Adebayo and the Chakra UI contributors. Chakra UI is MIT-licensed; its
notice is carried in [LICENSE.md](LICENSE.md).

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.

Includes design tokens and component styling derived from Chakra UI v2,
© Segun Adebayo, also MIT — see the third-party notice in
[LICENSE.md](LICENSE.md).

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
