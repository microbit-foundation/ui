/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * Stable re-export of the Panda styling primitives and layout patterns, so
 * shared-ui consumers (and a future extracted library) import from one place
 * rather than reaching into the generated `styled-system` directly.
 */
export { css, cva, sva, cx } from "styled-system/css";
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
 * a coloured sidebar header — so the focus indicators inside it flip to
 * their on-dark colours: `<header {...darkSurface}>`.
 *
 * "Dark" describes the surface's own luminance, not anything relative to
 * the app's overall look. That is also what would let the tag survive a
 * dark mode if we ever ship one: designed-dark surfaces stay dark and keep
 * their tags, while a dark mode would flip the *untagged* defaults via
 * token conditions, never via markup.
 *
 * Mechanism: one data attribute that the `onDark` condition scopes
 * semantic-token overrides to (`focusRing`, `focusBorder` — see
 * base-preset.ts). Custom properties inherit, so tagging the bar element
 * covers every control inside it, and portalled overlays (e.g. a modal
 * opened from a dark toolbar) escape the tag with the DOM, which is correct.
 */
export const darkSurface = { "data-surface": "dark" } as const;
