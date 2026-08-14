/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

// The common transition-property list, inlined (Panda has no
// transitionProperty token category).
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, transform";

/**
 * Input recipe — the outline text field with an sm/md/lg size scale. Used by
 * the shared-ui Input and NativeSelect, and by TextField's input slot.
 *
 * hover < focused < invalid is a specificity ladder (`&&`, `&&&`): Panda
 * sorts state rules against its own pseudo-class table, not declaration
 * order, so equal-specificity borderColor ties would leave hover winning.
 * Variants still override freely (later cascade layer).
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
    border: "2px solid",
    // Deliberately below 3:1 — valid while something else visually
    // identifies the field (label, or a ≥3:1 icon/placeholder).
    // Checkbox/Radio keep gray.400: their box IS the identifier.
    // Rationale: ui-private docs/a11y-positions.md.
    borderColor: "gray.300",
    bg: "inherit",
    color: "inherit",
    _hover: { borderColor: "gray.500" },
    // Any focus, pointer included; the keyboard ring composes on top.
    // zIndex so the border — and the ring with it — paint over
    // attached-group neighbours.
    "&&:is(:focus, [data-focused])": { zIndex: 1, borderColor: "focusBorder" },
    "&&&:is([data-invalid], :user-invalid)": {
      borderColor: "danger.500",
    },
    // Modality-tracked: RAC's attribute, or Input.tsx's. Native
    // :focus-visible is the fallback for a bare element wearing the recipe,
    // but not text-entry ones — browsers match it there on a pointer click,
    // which is what the tracking exists to exclude.
    "&&&:is([data-focus-visible], :focus-visible:not([data-rac], input, textarea))":
      {
        focusRing: "outline",
      },
    "&:is(:disabled, [data-disabled])": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
  variants: {
    // The sm/md/lg size scale.
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
