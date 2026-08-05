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
      // These set `fontSize` flat, and the `size` variant sets it
      // responsively: Panda hoists every media query below all base rules,
      // so above `md` a responsive size's rule would beat these whatever
      // the declaration order (playbook gotcha #31). Pair them with a flat
      // size (`md`, `sm`, `xs`) or no size at all — never `lg` and up.
      label: {
        fontSize: "4xl",
        color: "headingAccent",
      },
      subtitle: {
        fontSize: "xl",
        fontWeight: "normal",
        color: "headingAccent",
      },
    },
  },
  defaultVariants: {
    size: "xl",
  },
});
