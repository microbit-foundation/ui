/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

/**
 * Text recipe — sizes only, no default: with no `size`, Text inherits, which
 * is what most family apps expect. A config recipe so an app preset can set
 * an app-wide default size by extending `defaultVariants` (python-editor
 * defaults to md, which its shrunken fontSize scale renders at 0.9rem).
 *
 * Registered in the base preset (base-preset.ts).
 */
export const text = defineRecipe({
  className: "text",
  jsx: ["Text"],
  variants: {
    size: {
      sm: { fontSize: "sm" },
      md: { fontSize: "md" },
      lg: { fontSize: "lg" },
    },
  },
});
