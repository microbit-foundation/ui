/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

/**
 * Tooltip recipe — Chakra's dark tooltip.
 *
 * A recipe rather than styles inside the component because tooltip typography
 * is the kind of thing an app sets once for all of them: classroom's Chakra
 * theme did exactly that (`fontSize: md`), and a `css` override at today's
 * call sites would quietly not apply to tomorrow's.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const tooltip = defineRecipe({
  className: "tooltip",
  base: {
    bg: "gray.700",
    color: "white",
    px: "2",
    py: "1",
    borderRadius: "md",
    fontSize: "sm",
    fontWeight: "medium",
    boxShadow: "md",
    maxW: "xs",
    zIndex: "tooltip",
  },
});
