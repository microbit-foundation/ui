/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Radio slot recipe — Chakra's radio with the default blue colorScheme
 * (light mode) and its sm/md/lg size scale: the checkbox control rounded
 * fully, with a 50% `currentColor` dot when selected instead of the check
 * glyph. As with the checkbox, `borderColor: inherit` picks up a
 * `borderColor` set on the root.
 *
 * State styling keys off data attributes stamped by the shared-ui Radio
 * (react-aria provides the state via render props).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop size variants generated.
 */
export const radio = defineSlotRecipe({
  className: "radio",
  slots: ["root", "control", "label"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      verticalAlign: "top",
      cursor: "pointer",
      position: "relative",
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
      borderRadius: "full",
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
        // Chakra's radio dot.
        _before: {
          content: '""',
          display: "inline-block",
          position: "relative",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          bg: "currentColor",
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
    label: {
      userSelect: "none",
      marginStart: "2",
      "&[data-disabled]": { opacity: 0.4 },
    },
  },
  variants: {
    // Chakra's Radio size scale (the Checkbox control scale).
    size: {
      sm: {
        control: { width: "3", height: "3" },
        label: { fontSize: "sm" },
      },
      md: {
        control: { width: "4", height: "4" },
        label: { fontSize: "md" },
      },
      lg: {
        control: { width: "5", height: "5" },
        label: { fontSize: "lg" },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
