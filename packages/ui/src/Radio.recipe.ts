/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Radio slot recipe — the checkbox control rounded fully, with a 50%
 * `currentColor` dot when selected instead of the check glyph, across the
 * same sm/md/lg size scale. As with the checkbox, `borderColor: inherit`
 * picks up a `borderColor` set on the root.
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
      // As the checkbox: the accessible outline stop (WCAG 1.4.11), on the
      // root so the control's `borderColor: inherit` reads it and call
      // sites can still tint at the root.
      borderColor: "gray.400",
      "&[data-disabled]": { cursor: "not-allowed" },
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
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
        // The radio dot.
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
      // Disabled greys; the selected block restates _hover so the widened
      // native-:hover condition can't re-tint a disabled control.
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
    // The sm/md/lg size scale; control dimensions match the checkbox's.
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
