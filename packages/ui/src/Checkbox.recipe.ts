/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Checkbox slot recipe with an sm/md/lg size scale. The control's
 * `borderColor: inherit` picks up a `borderColor` set on the root, so call
 * sites can tint the box from there.
 *
 * State styling keys off data attributes stamped on the control by the
 * shared-ui Checkbox (react-aria provides the state via render props).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const checkbox = defineSlotRecipe({
  className: "checkbox",
  slots: ["root", "control", "icon", "label"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      verticalAlign: "top",
      cursor: "pointer",
      position: "relative",
      // The accessible outline stop (WCAG 1.4.11), as the input recipe.
      // Stated here rather than on the control — whose `borderColor:
      // inherit` reads it — so a call site can still tint the whole control
      // by setting borderColor on the root.
      borderColor: "border.controlEmphasis",
      "&[data-disabled]": { cursor: "not-allowed" },
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderWidth: "2px",
      borderStyle: "solid",
      borderRadius: "sm",
      borderColor: "inherit",
      color: "fg.onEmphasis",
      bg: "fill.control",
      "&[data-selected]": {
        bg: "fill.accent",
        borderColor: "fill.accent",
        color: "fg.onEmphasis",
        _hover: {
          bg: "fill.accentHover",
          borderColor: "fill.accentHover",
        },
      },
      // Disabled greys; the selected block restates _hover so the widened
      // native-:hover condition can't re-tint a disabled control.
      "&[data-disabled]": {
        bg: "fill.disabled",
        borderColor: "border.disabled",
      },
      "&[data-selected][data-disabled]": {
        bg: "fill.disabledEmphasis",
        borderColor: "border.disabledEmphasis",
        color: "fg.disabled",
        _hover: {
          bg: "fill.disabledEmphasis",
          borderColor: "border.disabledEmphasis",
        },
      },
      "&[data-focus-visible]": {
        focusRing: "outline",
      },
    },
    icon: {
      transitionProperty: "transform",
      transitionDuration: "normal",
    },
    label: {
      userSelect: "none",
      marginStart: "2",
      "&[data-disabled]": { opacity: 0.4 },
    },
  },
  variants: {
    // The icon dimensions are the 1.2em-wide check glyph at each size's icon
    // fontSize (3xs/2xs/2xs), resolved to rem.
    size: {
      sm: {
        control: { width: "3", height: "3" },
        icon: { width: "0.54rem", height: "0.54rem" },
        label: { fontSize: "sm" },
      },
      md: {
        control: { width: "4", height: "4" },
        icon: { width: "0.75rem", height: "0.75rem" },
        label: { fontSize: "md" },
      },
      lg: {
        control: { width: "5", height: "5" },
        icon: { width: "0.75rem", height: "0.75rem" },
        label: { fontSize: "lg" },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
