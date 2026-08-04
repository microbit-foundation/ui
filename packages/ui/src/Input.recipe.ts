/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

// Chakra's transition.property.common, inlined (Panda has no transitionProperty
// token category).
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform";

/**
 * Input recipe — Chakra's outline Input field (light mode) with its size
 * scale. Used by the shared-ui Input and NativeSelect, and by TextField's
 * input slot.
 *
 * Focus matches both native `:focus-visible` (plain inputs; browsers treat any
 * focus in a text field as focus-visible) and react-aria's `data-focused`
 * (inputs inside RAC TextField).
 *
 * Hover, invalid and focus all set `borderColor`, so their precedence has to be
 * hover < invalid < focus. Declaration order will not buy that: Panda sorts a
 * recipe's state rules itself, ranking selectors against a fixed
 * link/visited/focus/hover/active table, which puts `_hover` *after* focus and
 * after anything the table doesn't mention (`[data-invalid]`). Equal-specificity
 * rules then leave hover winning. So the ladder is spelled with repeated `&`
 * instead — `&&` and `&&&` emit `.input.input` and `.input.input.input`, making
 * precedence specificity rather than order, which nothing downstream can
 * resort. Variants still override freely; they land in a later cascade layer.
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const input = defineRecipe({
  className: "input",
  base: {
    width: "100%",
    minWidth: 0,
    outline: "none",
    position: "relative",
    appearance: "none",
    font: "inherit",
    transitionProperty: transitionCommon,
    transitionDuration: "normal",
    border: "1px solid",
    // The accessible outline stops: gray.400 is the ramp's 3:1-on-white
    // boundary grey (WCAG 1.4.11), hover steps darker, never lighter.
    // Chakra used 200/300 (~1.3:1), which read as barely-there.
    borderColor: "gray.400",
    bg: "inherit",
    color: "inherit",
    _hover: { borderColor: "gray.500" },
    "&&:is([data-invalid], :user-invalid)": {
      borderColor: "danger.500",
      boxShadow: "0 0 0 1px token(colors.danger.500)",
    },
    "&&&:is(:focus-visible, [data-focused])": {
      zIndex: 1,
      borderColor: "focusBorder",
      boxShadow: "0 0 0 1px token(colors.focusBorder)",
      // Focus indicator for forced-colors modes, which strip the box-shadow
      // and force the border colour (the focusShadow utility's technique; the
      // ring here is the 1px border tint, not an outline* shadow token).
      outline: "2px solid transparent",
      outlineOffset: "2px",
    },
    "&:is(:disabled, [data-disabled])": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
  variants: {
    // Chakra's Input size scale, minus the unused xs.
    size: {
      lg: { fontSize: "lg", px: "4", h: "12", borderRadius: "md" },
      md: { fontSize: "md", px: "4", h: "10", borderRadius: "md" },
      sm: { fontSize: "sm", px: "3", h: "8", borderRadius: "sm" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
