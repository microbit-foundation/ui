# @microbit/ui-carousel

Carousel components for micro:bit web apps, built on
[Swiper](https://swiperjs.com/) and styled with
[`@microbit/ui`](../ui) primitives. Extracted from the implementations
previously duplicated across micro:bit apps (CreateAI, Python Editor).

## What's here

- **`SwiperCarousel`** — thin wrapper over Swiper shared by everything else
  here: list semantics, translated ARIA annotations, focus-follows-slide,
  and edge-pinned prev/next overlay buttons (enable with `navigation`;
  hidden below `md`, decorative for keyboard users — tab moves through the
  cards instead). Takes a pre-translated `containerLabel` as the carousel's
  accessible name, and any Swiper prop passes through. Layout — breakpoints,
  slide sizing, padding — stays with the caller.

More lands as the extraction progresses (`Carousel`, `CarouselRow`).

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
