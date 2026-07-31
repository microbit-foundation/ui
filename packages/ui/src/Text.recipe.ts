/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

/**
 * Text recipe — Chakra's <Text> had no styles of its own, but an app theme
 * could give it sizes and a default size via `components.Text`
 * (python-editor's did: sm/md with a default of md, which its shrunken
 * fontSize scale renders at 0.9rem). A config recipe so an app preset can
 * restore that: extend `defaultVariants` to set an app-wide default size.
 * No default here — with no `size`, Text inherits like Chakra's default,
 * which is what the other family apps expect.
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
