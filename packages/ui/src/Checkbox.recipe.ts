/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Checkbox slot recipe — Chakra's checkbox with the default blue colorScheme
 * (light mode) and its sm/md/lg size scale. The control's
 * `borderColor: inherit` picks up a `borderColor` set on the root, matching
 * Chakra's convention for tinting the box from the call site.
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
      // The control's `borderColor: inherit` reads this. Stated here rather
      // than on the control so a call site can still tint the whole control
      // by setting borderColor on the root. Without it, inherit fell through
      // to the reset's gray.200 (~1.3:1) — the accessible outline stop, as
      // the input recipe (docs/gray-ramp.md).
      borderColor: "gray.400",
      "&[data-disabled]": { cursor: "not-allowed" },
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transitionProperty: "box-shadow",
      transitionDuration: "normal",
      borderWidth: "2px",
      borderStyle: "solid",
      borderRadius: "sm",
      borderColor: "inherit",
      color: "white",
      bg: "white",
      "&[data-selected]": {
        bg: "controlCheckedBg",
        borderColor: "controlCheckedBg",
        color: "white",
        _hover: {
          bg: "controlCheckedHoverBg",
          borderColor: "controlCheckedHoverBg",
        },
      },
      // Chakra's disabled greys; the selected block restates _hover so the
      // widened native-:hover condition can't re-tint a disabled control.
      "&[data-disabled]": {
        bg: "gray.100",
        borderColor: "gray.100",
      },
      "&[data-selected][data-disabled]": {
        bg: "gray.200",
        borderColor: "gray.200",
        color: "gray.500",
        _hover: { bg: "gray.200", borderColor: "gray.200" },
      },
      "&[data-focus-visible]": {
        focusShadow: "outline",
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
    // Chakra's Checkbox size scale. The icon dimensions are Chakra's
    // 1.2em-wide check glyph at each size's icon fontSize (3xs/2xs/2xs),
    // resolved to rem.
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
