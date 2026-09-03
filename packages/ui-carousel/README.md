# @microbit/ui-carousel

Carousel components for micro:bit web apps, built on
[Swiper](https://swiperjs.com/) and styled with
[`@microbit/ui`](../ui) primitives. Extracted from the implementations
previously duplicated across micro:bit apps (CreateAI, Python Editor).

## What's here

- **`CarouselRow`** — page furniture around a `Carousel`: a full-width row
  with an `<h2>` heading that also names the carousel for assistive tech
  (`title`, with `titleSuffix` for adornments kept out of the accessible
  name) and optional trailing `actions`. `className` hooks app-specific
  styling (e.g. tighter padding on short screens); `Carousel` props pass
  through.
- **`Carousel`** — the standard micro:bit carousel: a paged row of 260px
  cards whose slides-per-page follow the window width. `centerItems` centres
  a row too short to fill the width; `navigation={false}` drops the
  prev/next buttons (e.g. on touch-only native apps).
- **`SwiperCarousel`** — thin wrapper over Swiper shared by everything else
  here: APG carousel semantics, translated ARIA annotations, focus-follows-slide,
  and edge-pinned prev/next overlay buttons (enable with `navigation`;
  hidden below `md`, decorative for keyboard users — tab moves through the
  cards instead). Takes a pre-translated `containerLabel` as the carousel's
  accessible name, and any Swiper prop passes through. Layout — breakpoints,
  slide sizing, padding — stays with the caller.

## Consumption

Like `@microbit/ui`, this package **ships as source** — TypeScript compiled
and style-extracted by the consuming app's build. Set up `@microbit/ui` first
(preset stack, `styled-system` alias, cascade layers — see its
[README](../ui/README.md)), then:

1. Install the package. `@microbit/ui` and `swiper` are peer dependencies,
   so both must be installed.
2. Add this package's sources to your Panda `include`, alongside the
   `@microbit/ui` glob:

   ```ts
   include: [
     "./src/**/*.{ts,tsx}",
     "./node_modules/@microbit/ui/src/**/*.{ts,tsx}",
     "./node_modules/@microbit/ui-carousel/src/**/*.{ts,tsx}",
   ],
   ```

   Miss the glob and the components render unstyled: Panda never sees their
   style calls, and there is no error.

3. Swiper's stylesheets are imported by this package into the `vendor`
   cascade layer, so your app's `@layer` declaration must include `vendor`
   (it does if it follows the `@microbit/ui` README).

4. **Strings**: compile `lang/ui.<locale>.json` into your per-locale catalogs
   exactly as you do `@microbit/ui`'s (message ids are namespaced
   `ui-carousel.`). English needs no catalog — components carry inline
   `defaultMessage`s.

## Development

Stories live in `stories/` here but are rendered by the repo's Storybook
harness, [`apps/storybook`](../../apps/storybook), whose config globs this
package — one harness for the whole family. Run it from the repo root:

```bash
npm run storybook
```

`npm run typecheck -w @microbit/ui-carousel` generates this package's own
`styled-system/` output (from the same base preset) and runs `tsc`.

## Releases

Create a GitHub release with a tag of the form `ui-carousel-vX.Y.Z`
(e.g. `ui-carousel-v0.1.0-alpha.1`). The build workflow routes the release
to this package by the tag prefix and publishes it. This package is
versioned independently of `@microbit/ui`.

## License

[MIT](LICENSE.md) © Micro:bit Educational Foundation and contributors.
