/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

/**
 * Heading recipe — Chakra's default Heading base + responsive sizes.
 * A config recipe for the same reasons as `button` (see Button.recipe.ts);
 * the `marketing` variant is token-driven via the `display` font, so brands
 * only override tokens.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const heading = defineRecipe({
  className: "heading",
  jsx: ["Heading"],
  base: {
    fontFamily: "heading",
    fontWeight: "bold",
  },
  variants: {
    size: {
      "4xl": { fontSize: { base: "6xl", md: "7xl" }, lineHeight: 1 },
      "3xl": { fontSize: { base: "5xl", md: "6xl" }, lineHeight: 1 },
      "2xl": {
        fontSize: { base: "4xl", md: "5xl" },
        lineHeight: { base: 1.2, md: 1 },
      },
      xl: {
        fontSize: { base: "3xl", md: "4xl" },
        lineHeight: { base: 1.33, md: 1.2 },
      },
      lg: {
        fontSize: { base: "2xl", md: "3xl" },
        lineHeight: { base: 1.33, md: 1.2 },
      },
      md: { fontSize: "xl", lineHeight: 1.2 },
      sm: { fontSize: "md", lineHeight: 1.2 },
      xs: { fontSize: "sm", lineHeight: 1.2 },
    },
    // Brand marketing headings. The `display` font token is Helvetica in OSS and
    // GT Walsheim in the private preset.
    variant: {
      marketing: { fontFamily: "display" },
      // Page-title chrome in the accent colour (`headingAccent` — see
      // base-preset.ts). Converged from classroom and data-microbit-org,
      // which carried these two byte-identically app-side.
      //
      // `fontSize` goes through a doubled selector because `size` sets it too,
      // responsively. Source order can't settle that: Panda hoists media
      // queries below the base rules (gotcha #31) and emits variant rules in
      // the order it meets them, so which of the two wins would depend on the
      // breakpoint and on what other call sites exist. Two classes beat one at
      // every width instead.
      label: {
        "&&": { fontSize: "4xl" },
        color: "headingAccent",
      },
      subtitle: {
        "&&": { fontSize: "xl" },
        fontWeight: "normal",
        color: "headingAccent",
      },
    },
  },
  defaultVariants: {
    size: "xl",
  },
});
