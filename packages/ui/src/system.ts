/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * Stable re-export of the Panda layout patterns and runtime helpers, so
 * shared-ui consumers (and a future extracted library) import from one place
 * rather than reaching into the generated `styled-system` directly.
 *
 * `css`, `cva`, `sva` and `cx` are deliberately NOT re-exported: Panda
 * extracts a helper only when it is imported from `styled-system/css`, so
 * calls reaching one through here would produce no CSS and no diagnostic.
 * (`cx` only joins strings, but it shares the import line with `css`.)
 * `token` is a runtime variable lookup with nothing to extract.
 */
export { token } from "styled-system/tokens";
export type { SystemStyleObject } from "styled-system/types";
// react-aria collection types call sites need for selection handlers.
export type { Key, Selection } from "react-aria-components";
export type {
  BoxProps,
  FlexProps,
  StackProps,
  HstackProps,
  VstackProps,
  GridProps,
} from "styled-system/jsx";

// Layout patterns — Box/Flex/Stack/etc.
//
// The pattern components extract by component and prop name, so their style
// props work through this re-export.
//
// `styled` is re-exported for the `styled(Component)` form, which works from
// anywhere. The `styled.tag` JSX form does NOT: Panda recognises the factory by
// the module it was imported from, so `<styled.table css={…}>` on a `styled`
// imported from here silently produces no CSS. Import it from
// "styled-system/jsx" for that.
export {
  AspectRatio,
  Box,
  Container,
  Flex,
  Stack,
  HStack,
  VStack,
  Grid,
  GridItem,
  Center,
  Wrap,
  styled,
} from "styled-system/jsx";

/**
 * Spread onto a surface element that is dark by design — a black toolbar,
 * a coloured sidebar header — so focus indicators inside it flip to their
 * on-dark colours: `<header {...darkSurface}>`.
 *
 * Tag a surface's own designed luminance, never anything theme-relative
 * (a future dark mode flips untagged defaults via token conditions, not
 * markup). One inherited data attribute (the `onDark` condition): tag the
 * bar, cover its controls; portalled overlays escape with the DOM.
 */
export const darkSurface = { "data-surface": "dark" } as const;
