/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { definePreset } from "@pandacss/dev";

const toTokens = (values: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(values).map(([k, value]) => [k, { value }]),
  ) as Record<string, { value: string }>;

/**
 * The numeric spacing/size grid, Chakra's 0.25rem step × 0.88.
 *
 * Only the numeric scale is touched: the named `sizes` (`xs`…`8xl`, `max`,
 * `full`, `container.*`) stay at their base-preset values, as they did in
 * both apps' Chakra themes.
 */
const scale = toTokens({
  px: "1px",
  0.5: "0.11rem",
  1: "0.22rem",
  1.5: "0.33rem",
  2: "0.44rem",
  2.5: "0.55rem",
  3: "0.66rem",
  3.5: "0.77rem",
  4: "0.88rem",
  5: "1.1rem",
  6: "1.32rem",
  7: "1.54rem",
  8: "1.76rem",
  9: "1.98rem",
  10: "2.2rem",
  12: "2.64rem",
  14: "3.08rem",
  16: "3.52rem",
  20: "4.4rem",
  24: "5.28rem",
  28: "6.16rem",
  32: "7.04rem",
  36: "7.92rem",
  40: "8.8rem",
  44: "9.68rem",
  48: "10.56rem",
  52: "11.44rem",
  56: "12.32rem",
  60: "13.2rem",
  64: "14.08rem",
  72: "15.84rem",
  80: "17.6rem",
  96: "21.12rem",
});

/**
 * Font sizes from `md` up, × 0.9. `xs`/`sm` keep their full size so small
 * text never gets too small, and `3xs`/`2xs` (which neither app's theme
 * listed) stay at their base-preset values.
 */
const denseFontSizes = toTokens({
  md: "0.9rem",
  lg: "1.012rem",
  xl: "1.125rem",
  "2xl": "1.35rem",
  "3xl": "1.687rem",
  "4xl": "2.025rem",
  "5xl": "2.7rem",
  "6xl": "3.375rem",
  "7xl": "4.05rem",
  "8xl": "5.4rem",
  "9xl": "7.2rem",
});

/**
 * The dense preset — an optional density override for the information-dense
 * apps in the family. Stacks between the base preset and the app preset:
 *
 * ```ts
 * presets: ["@pandacss/preset-base", basePreset, densePreset, appPreset]
 * ```
 *
 * Both python-editor and classroom shipped the same "make everything
 * smaller" Chakra theme change (2022): the numeric spacing/sizes grid at
 * × 0.88 and `fontSizes` from `md` up at × 0.9. The two themes' values were
 * byte-identical, so the scale lives here rather than being replicated in
 * each app preset (migration-playbook gotcha #25 — a global scale override
 * hides from every safeguard, so it needs to be explicit and shared).
 *
 * Whether this density stays or the family aligns on one scale is an open
 * design question; when it is answered, this preset is the single place the
 * answer lands (deleting it from an app's stack un-shrinks that app).
 * ml-trainer and data-microbit-org do not use it.
 */
export const densePreset = definePreset({
  name: "microbit-ui-dense",
  theme: {
    extend: {
      tokens: {
        spacing: scale,
        sizes: scale,
        fontSizes: denseFontSizes,
      },
    },
  },
});

export default densePreset;
