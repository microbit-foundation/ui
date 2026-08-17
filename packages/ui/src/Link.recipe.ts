/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

/**
 * Link recipe — underlined by default: a link in prose must be marked by
 * more than colour (WCAG 1.4.1). `standalone` drops the underline until
 * hover, for links whose context already shows they are links (navigation,
 * menus, cards, icon links).
 *
 * Registered in the base preset (base-preset.ts).
 */
export const link = defineRecipe({
  className: "link",
  jsx: ["Link"],
  base: {
    cursor: "pointer",
    textDecoration: "underline",
    outline: "none",
    transitionProperty:
      "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
    transitionDuration: "normal",
    _focusVisible: { focusRing: "outline" },
  },
  variants: {
    variant: {
      standalone: {
        textDecoration: "none",
        _hover: { textDecoration: "underline" },
      },
    },
  },
});
