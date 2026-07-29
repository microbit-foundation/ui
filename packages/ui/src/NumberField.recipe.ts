/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * NumberField slot recipe — Chakra's NumberInput look: an outline input (the
 * `input` recipe styles the input itself) with a right-hand stepper column of
 * two stacked buttons. Consumed by the shared-ui NumberField
 * (react-aria-components NumberField).
 *
 * Registered in the base preset (base-preset.ts). No variants, so it needs
 * no `staticCss` entry.
 */
export const numberField = defineSlotRecipe({
  className: "numberField",
  slots: ["root", "group", "stepper", "stepperButton"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    },
    group: {
      position: "relative",
      zIndex: 0,
    },
    // Chakra's NumberInputStepper: a column overlaying the input's right
    // edge, inset by the input border.
    stepper: {
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      insetEnd: "0",
      top: "0",
      height: "calc(100% - 2px)",
      margin: "1px",
      width: "6",
      zIndex: 1,
    },
    stepperButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      cursor: "pointer",
      lineHeight: "normal",
      fontSize: "xs",
      color: "inherit",
      bg: "transparent",
      borderStart: "1px solid",
      borderColor: "gray.200",
      transitionProperty: "background",
      transitionDuration: "ultra-fast",
      "&:last-child": {
        borderTop: "1px solid",
        borderTopColor: "gray.200",
        marginTop: "-1px",
      },
      "&[data-hovered]": { bg: "gray.100" },
      "&[data-pressed]": { bg: "gray.200" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
  },
});
