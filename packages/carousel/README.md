# @microbit/ui-carousel

Carousel components for micro:bit web apps, built on
[Swiper](https://swiperjs.com/) and styled with
[`@microbit/ui`](../ui) primitives. Extracted from the implementations
previously duplicated across micro:bit apps (CreateAI, Python Editor).

## What's here

- **`CarouselRow`** — page furniture around a `Carousel`: a full-width row
  with an `<h2>` heading (`title`, or `titleElement` verbatim for titles
  with adornments) and optional trailing `actions`. `className` hooks
  app-specific styling (e.g. tighter padding on short screens); `Carousel`
  props pass through.
- **`Carousel`** — the standard micro:bit carousel: a paged row of 260px
  cards whose slides-per-page follow the window width, or — with `hero` — a
  full-width looping banner that autoplays (paused on hover, stopped on
  interaction). `centerItems` centres a row too short to fill the width;
  `navigation={false}` drops the prev/next buttons (e.g. on touch-only
  native apps).
- **`SwiperCarousel`** — thin wrapper over Swiper shared by everything else
  here: list semantics, translated ARIA annotations, focus-follows-slide,
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
