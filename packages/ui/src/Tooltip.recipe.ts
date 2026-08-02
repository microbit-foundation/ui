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
 * The colour, vertical padding and radius are Chakra's exactly. They had
 * drifted (white, `py: 1`, `borderRadius: md`) while this lived inside the
 * component, which classroom's port measured: a 6px radius where Chakra drew
 * 2px. ml-trainer and python-editor pick the correction up too.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const tooltip = defineRecipe({
  className: "tooltip",
  base: {
    bg: "gray.700",
    color: "whiteAlpha.900",
    px: "2",
    py: "0.5",
    borderRadius: "sm",
    fontSize: "sm",
    fontWeight: "medium",
    boxShadow: "md",
    maxW: "xs",
    zIndex: "tooltip",
  },
});
